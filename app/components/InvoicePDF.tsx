import { Invoice, Totals } from "@/type";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { ArrowDownFromLine, Layers } from "lucide-react";
import React, { useRef } from "react";

interface InvoicePDFProps {
  invoice: Invoice;
  totals: Totals;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("fr-FR", options);
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, totals }) => {
  const factureRef = useRef<HTMLDivElement>(null);

  const handleDownLoadPDF = async () => {
    const element = factureRef.current;
    try {
      if (element) {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "A4",
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`facture-${invoice.name.trim()}_${invoice.id}.pdf`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la generation  du PDF:", error);
    }
  };

  return (
    <div className="hidden lg:block mt-4">
      <div className="border-2 border-base-200 border-dashed rounded-xl p-5">
        <button
          className="btn btn-sm btn-accent mb-4"
          onClick={handleDownLoadPDF}
        >
          Facture PDF <ArrowDownFromLine className="w-4 ml-2" />
        </button>
        <div className="p-8" ref={factureRef}>
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <div>
                <div className="flex items-center">
                  <div className="bg-accent-content text-accent  rounded-full p-2">
                    <Layers className="h-6 w-6" />
                  </div>
                  <span className="ml-3 font-bold text-2xl italic">
                    In<span className="text-accent">Voice</span>
                  </span>
                </div>
              </div>
              <h2 className="text-7xl font-bold uppercase">Facture</h2>
            </div>
            <div className="text-right uppercase">
              <p className="badge badge-ghost">Facture ° {invoice.id}</p>
              <p className="my-2">
                <strong>Date </strong>
                {formatDate(invoice.invoiceDate)}
              </p>
              <p className="">
                <strong>Date d'échéance </strong>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
          <div className="my-6 flex justify-between">
            <div>
              <p className="badge badge-ghost mb-2">Émetteur</p>
              <p className="text-sm font-bold italic">{invoice.issuerName}</p>
              <p className="text-sm text-gray-500 w-52 break-words">
                {invoice.issuerAddress}
              </p>
            </div>
            <div className="text-right">
              <p className="badge badge-ghost mb-2">Client</p>
              <p className="text-sm font-bold italic">{invoice.clientName}</p>
              <p className="text-sm text-gray-500 w-52 break-words">
                {invoice.clientAddress}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{line.description}</td>
                    <td>{line.quantity}</td>
                    <td>{line.unitPrice.toFixed(2)}$</td>
                    <td>{(line.quantity * line.unitPrice).toFixed(2)}$</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 space-y-2 text-md">
            <div className="flex justify-between">
              <div className="font-bold">Total Hors Taxes</div>
              <div className="">{totals.totalHT.toFixed(2)}$</div>
            </div>
            {invoice.vatActive && (
              <div className="flex justify-between">
                <div className="font-bold">TVA({invoice.vatRate}%)</div>
                <div className="">{totals.totalVAT.toFixed(2)}$</div>
              </div>
            )}
            <div className="flex justify-between">
              <div className="font-bold">Total Toutes Taxes Comprises</div>
              <div className="badge badge-accent">
                {totals.totalTTC.toFixed(2)}$
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
