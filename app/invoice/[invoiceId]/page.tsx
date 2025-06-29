"use client";
import React, { useState, useEffect } from "react";
import { Invoice, Totals } from "@/type";
import { deleteInvoice, getInvoiceById, updateInvoice } from "@/app/actions";
import Wrapper from "@/app/components/Wrapper";
import { Save, Trash } from "lucide-react";
import InvoiceInfo from "@/app/components/InvoiceInfo";
import VATControl from "@/app/components/VATControl";
import InvoiceLines from "@/app/components/InvoiceLines";
import { useRouter } from "next/navigation";
import InvoicePDF from "@/app/components/InvoicePDF";

const page = ({ params }: { params: Promise<{ invoiceId: string }> }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const fetchInvoice = async () => {
    try {
      const { invoiceId } = await params;
      const fetchedInvoice = await getInvoiceById(invoiceId);
      if (fetchedInvoice) {
        setInvoice(fetchedInvoice);
        setInitialInvoice(fetchedInvoice);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  useEffect(() => {
    setIsSaveDisabled(
      JSON.stringify(invoice) === JSON.stringify(initialInvoice)
    );
  }, [invoice, initialInvoice]);

  useEffect(() => {
    if (!invoice) return;
    const ht = invoice.lines.reduce((acc, { quantity, unitPrice }) => {
      return acc + quantity * unitPrice;
    }, 0);
    const vat = invoice.vatActive ? ht * (invoice.vatRate / 100) : 0;
    setTotals({
      totalHT: ht,
      totalVAT: vat,
      totalTTC: ht + vat,
    });
  }, [invoice]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value);
    if (invoice) {
      const updatedInvoice = { ...invoice, status: newStatus };
      setInvoice(updatedInvoice);
    }
  };

  const handleSave = async () => {
    if (!invoice) return;
    setIsLoading(true);
    try {
      await updateInvoice(invoice);
      const updatedInvoice = await getInvoiceById(invoice.id);
      if (updatedInvoice) {
        setInitialInvoice(updatedInvoice);
        setInvoice(updatedInvoice);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise a jour de la facture.", error);
    }
  };
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Etes-vous sûr de vouloir supprimer la facture?"
    );
    try {
      if (confirmed) {
        await deleteInvoice(invoice?.id as string);
        router.push("/");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la facture.", error);
    }
  };

  if (!invoice || !totals) {
    return (
      <div className="flex justify-center items-center h-screen gap-4">
        <p className="font-bold">
          <span className="text-accent">Erreur 404</span> - Facture non trouvée
        </p>
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  return (
    <Wrapper>
      <div className="">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-lg badge-ghost uppercase">
            <span>Facture-</span>
            {invoice?.id}
          </p>
          <div className="flex md:mt-0 mt-4">
            <select
              className="select select-sm select-bordered w-full"
              value={invoice?.status}
              onChange={handleStatusChange}
            >
              <option value={1}>Brouillon</option>
              <option value={2}>En attente</option>
              <option value={3}>Payée</option>
              <option value={4}>Annulée</option>
              <option value={5}>Impayée</option>
            </select>
            <button
              className="btn btn-sm btn-accent ml-4"
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <div>
                  <span className="loading loading-spinner loading-xs"></span>
                </div>
              ) : (
                <div className="flex items-center">
                  Sauvegarder <Save className="w-4 ml-2" />
                </div>
              )}
            </button>
            <button
              className="btn btn-sm btn-accent ml-4"
              onClick={handleDelete}
            >
              <Trash className="w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full">
        <div className="flex flex-col w-full md:w-1/3">
          <div className="mb-4 bg-base-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="badge badge-accent">Résumé des Totaux</div>
              <VATControl invoice={invoice} setInvoice={setInvoice} />
            </div>
            <div className="flex justify-between">
              <span>Total hors taxe</span>
              <span>{totals?.totalHT.toFixed(2)}$</span>
            </div>
            <div className="flex justify-between">
              <span>
                TVA({invoice?.vatActive ? `${invoice?.vatRate}%` : "0"})
              </span>
              <span>{totals?.totalVAT.toFixed(2)}$</span>
            </div>
            <div className="flex justify-between">
              <span>Total TTC </span>
              <span>{totals?.totalTTC.toFixed(2)}$</span>
            </div>
          </div>
          <InvoiceInfo invoice={invoice} setInvoice={setInvoice} />
        </div>
        <div className="flex flex-col w-full md:w-2/3 md:ml-4">
          <InvoiceLines invoice={invoice} setInvoice={setInvoice} />
          <InvoicePDF invoice={invoice} totals={totals} />
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
