"use server";

import prisma from "@/lib/prisma";
import { Invoice } from "@/type";
import { randomBytes } from "crypto";

export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser && name) {
      await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

const generateUniqueId = async () => {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = randomBytes(3).toString("hex");
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        id: uniqueId,
      },
    });
    if (!existingInvoice) {
      isUnique = true;
    }
  }
  return uniqueId;
};

export async function createEmptyInvoice(email: string, name: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    const invoiceId = (await generateUniqueId()) as string;
    if (user) {
      const newInvoice = await prisma.invoice.create({
        data: {
          id: invoiceId,
          name: name,
          userId: user?.id,
          issuerName: "",
          issuerAddress: "",
          clientName: "",
          clientAddress: "",
          invoiceDate: "",
          dueDate: "",
          vatActive: false,
          vatRate: 20,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getInvoicesByEmail(email: string) {
  if (!email) return;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        invoices: {
          include: {
            lines: true,
          },
        },
      },
    });
    if (user) {
      const today = new Date();
      const updatedInvoices = await Promise.all(
        user.invoices.map(async (invoice) => {
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < today && invoice.status === 2) {
            const updatedInvoice = await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status: 5 },
              include: { lines: true },
            });
            return updatedInvoice;
          }
          return invoice;
        })
      );
      return updatedInvoices;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lines: true,
      },
    });
    if (!invoice) {
      throw new Error("Facture non trouvée");
    }
    return invoice;
  } catch (error) {
    console.error(error);
  }
}

export async function updateInvoice(invoice: Invoice) {
  try {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        lines: true,
      },
    });
    if (!existingInvoice) {
      throw new Error("Facture non trouvée");
    }
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        issuerName: invoice.issuerName,
        issuerAddress: invoice.issuerAddress,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        vatActive: invoice.vatActive,
        vatRate: invoice.vatRate,
        status: invoice.status,
      },
    });
    const existingLines = existingInvoice.lines;
    const receivedLines = invoice.lines;
    const linesToDelete = existingLines.filter(
      (existingLine) =>
        !receivedLines.some((line) => line.id === existingLine.id)
    );
    if (linesToDelete.length > 0) {
      const lineToDeleteIdsTab = linesToDelete.map((line) => line.id);
      await prisma.invoiceLine.deleteMany({
        where: {
          id: { in: lineToDeleteIdsTab },
        },
      });
    }
    for (const line of receivedLines) {
      const existingLine = existingLines.find((l) => l.id === line.id);
      if (existingLine) {
        const hasChanged =
          line.description !== existingLine.description ||
          existingLine.quantity ||
          existingLine.unitPrice;
        if (hasChanged) {
          await prisma.invoiceLine.update({
            where: { id: line.id },
            data: {
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            },
          });
        }
      } else {
        //creer une nouvelle ligne
        await prisma.invoiceLine.create({
          data: {
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            invoiceId: invoice.id,
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const deleletedInvoice = await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    if (!deleletedInvoice) {
      throw new Error("Erreur lors de la suppression de la facture");
    }
  } catch (error) {
    console.error(error);
  }
}
