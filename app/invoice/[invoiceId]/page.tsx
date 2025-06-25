"use client";
import React, { useState, useEffect } from "react";
import { Invoice } from "@/type";
import { getInvoiceById } from "@/app/actions";
import Wrapper from "@/app/components/Wrapper";
import { Trash } from "lucide-react";
import InvoiceInfo from "@/app/components/InvoiceInfo";
import VATControl from "@/app/components/VATControl";
import InvoiceLine from "@/app/components/InvoiceLine";

const page = ({ params }: { params: Promise<{ invoiceId: string }> }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
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
  if (!invoice) {
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
            >
              <option value={1}>Brouillon</option>
              <option value={2}>En attente</option>
              <option value={3}>Payée</option>
              <option value={4}>Annulée</option>
              <option value={5}>Impayée</option>
            </select>
            <button className="btn btn-sm btn-accent ml-4">Sauvegarder</button>
            <button className="btn btn-sm btn-accent ml-4">
              <Trash className="w-4" />
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col w-full md:w-1/3">
          <div className="mb-4 bg-base-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="badge badge-accent">Résumé des Totaux</div>
              <VATControl invoice={invoice} setInvoice={setInvoice} />
            </div>
          </div>
          <InvoiceInfo invoice={invoice} setInvoice={setInvoice} />
        </div>
        <div className="flex flex-col w-full md:w-2/3">
          <InvoiceLine invoice={invoice} setInvoice={setInvoice} />
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
