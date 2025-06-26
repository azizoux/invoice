import { Invoice } from "@/type";
import { InvoiceLine } from "@prisma/client";
import { Plus, Trash } from "lucide-react";
import React, { useState } from "react";

interface Props {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
}

const InvoiceLines: React.FC<Props> = ({ invoice, setInvoice }) => {
  const handleAddLine = () => {
    const newLine: InvoiceLine = {
      id: `${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      invoiceId: invoice.id,
    };
    setInvoice({
      ...invoice,
      lines: [...invoice.lines, newLine],
    });
  };
  const handleDeleteLine = (id: string) => {
    const updetedLines = invoice.lines.filter((line) => line.id !== id);
    setInvoice({
      ...invoice,
      lines: updetedLines,
    });
  };
  const handleQuantityChange = (index: number, value: string) => {
    const updatedLine = [...invoice.lines];
    updatedLine[index].quantity = value === "" ? 0 : parseInt(value);
    setInvoice({
      ...invoice,
      lines: updatedLine,
    });
  };
  const handleDescriptionChange = (index: number, value: string) => {
    const updatedLine = [...invoice.lines];
    updatedLine[index].description = value;
    setInvoice({
      ...invoice,
      lines: updatedLine,
    });
  };
  const handleUnitPriceChange = (index: number, value: string) => {
    const updatedLine = [...invoice.lines];
    updatedLine[index].unitPrice = value === "" ? 0 : parseFloat(value);
    setInvoice({
      ...invoice,
      lines: updatedLine,
    });
  };
  console.log(invoice);

  return (
    <div className="h-fit bg-base-200 p-5 w-full rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="badge badge-accent">Produits / Services</h2>
        <button className="btn btn-sm btn-accent" onClick={handleAddLine}>
          <Plus className="w-4" />
        </button>
      </div>
      <div className="scrolable">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Quantité</th>
              <th>Description</th>
              <th>Prix unitaire (HT)</th>
              <th>Montant (HT)</th>
              <th>Montant (HT)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={line.id}>
                <td>
                  <input
                    type="number"
                    value={line.quantity}
                    min={0}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={line.description}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.unitPrice.toFixed(2)}
                    min={0}
                    step={0.01}
                    className="input input-sm input-bordered w-full"
                    onChange={(e) =>
                      handleUnitPriceChange(index, e.target.value)
                    }
                  />
                </td>
                <td className="font-bold">
                  {(line.quantity * line.unitPrice).toFixed(2)} $
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-circle btn-accent"
                    onClick={() => handleDeleteLine(line.id)}
                  >
                    <Trash className="w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceLines;
