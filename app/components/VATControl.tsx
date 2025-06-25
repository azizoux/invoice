import React from "react";
import { Invoice } from "@/type";

interface Props {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
}

const VATControl: React.FC<Props> = ({ invoice, setInvoice }) => {
  const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice({
      ...invoice,
      vatActive: e.target.checked,
      vatRate: e.target.checked ? invoice.vatRate : 0,
    });
  };
  const handleVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice({
      ...invoice,
      vatRate: parseFloat(e.target.value),
    });
  };
  return (
    <div className="flex items-center">
      <label className="block test-sm font-bold">TVA (%)</label>
      {invoice.vatActive && (
        <input
          type="number"
          value={invoice.vatRate}
          className="input input-sm input-bordered w-16 ml-2"
          onChange={handleVatRateChange}
        />
      )}

      <input
        type="checkbox"
        className="toggle toggle-sm ml-2"
        checked={invoice.vatActive}
        onChange={handleVatChange}
      />
    </div>
  );
};

export default VATControl;
