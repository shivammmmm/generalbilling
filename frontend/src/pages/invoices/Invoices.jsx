import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FilePlus2,
  IndianRupee,
  Receipt,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import InvoiceTable from "../../components/invoices/InvoicesTable";
import { formatCurrency } from "../../utils/billing";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
  });

  const getInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/invoices");
      const invoiceList = data.invoices || [];

      setInvoices(invoiceList);
      setStats({
        totalAmount: invoiceList.reduce(
          (acc, invoice) => acc + Number(invoice.grandTotal || 0),
          0
        ),
        pendingAmount: invoiceList
          .filter((invoice) => invoice.paymentStatus === "pending")
          .reduce((acc, invoice) => acc + Number(invoice.grandTotal || 0), 0),
        paidAmount: invoiceList
          .filter((invoice) => invoice.paymentStatus === "paid")
          .reduce((acc, invoice) => acc + Number(invoice.grandTotal || 0), 0),
      });
    } catch (error) {
      toast.error("Failed to load invoices");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice record?")) return;

    try {
      await API.delete(`/invoices/${id}`);
      toast.success("Invoice deleted");
      getInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  useEffect(() => {
    getInvoices();
  }, []);

  const cards = [
    {
      label: "Total Invoiced",
      value: stats.totalAmount,
      icon: <Receipt size={22} />,
      color: "text-blue-700 bg-blue-50",
    },
    {
      label: "Outstanding Payments",
      value: stats.pendingAmount,
      icon: <WalletCards size={22} />,
      color: "text-amber-700 bg-amber-50",
    },
    {
      label: "Received Payments",
      value: stats.paidAmount,
      icon: <IndianRupee size={22} />,
      color: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
            Invoices
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Invoice List
          </h1>
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
            Review flex printing invoices, totals, payment status, and print
            copies.
          </p>
        </div>

        <Link
          to="/billing"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          <FilePlus2 size={20} />
          Create Invoice
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div
              className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}
            >
              {card.icon}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center text-sm font-bold text-slate-500 shadow-sm">
          Loading invoices...
        </div>
      ) : (
        <InvoiceTable invoices={invoices} deleteInvoice={deleteInvoice} />
      )}
    </div>
  );
};

export default Invoices;
