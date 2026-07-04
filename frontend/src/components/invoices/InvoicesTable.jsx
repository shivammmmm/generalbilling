import { Link } from "react-router-dom";
import {
  Calendar,
  Eye,
  IndianRupee,
  Printer,
  Receipt,
  Trash2,
  User,
} from "lucide-react";
import { formatCurrency } from "../../utils/billing";

const InvoiceTable = ({ invoices, deleteInvoice }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Invoice",
                "Customer",
                "Rate Type",
                "Grand Total",
                "Status & Date",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices?.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Receipt size={40} />
                    <p className="text-sm font-bold">No invoices found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              invoices?.map((invoice) => (
                <tr key={invoice._id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-900">
                      #{invoice.invoiceNumber}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Invoice
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {invoice.farmer?.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {invoice.farmer?.mobileNumber}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
                      {invoice.rateType || "Rate A"}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 text-lg font-black text-slate-950">
                      <IndianRupee size={16} className="text-blue-600" />
                      {Number(invoice.grandTotal || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      GST {formatCurrency(invoice.totalGST)}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-xl px-3 py-1 text-xs font-black uppercase tracking-widest ${
                        invoice.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {invoice.paymentStatus}
                    </span>
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Calendar size={13} />
                      {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/invoices/print/${invoice._id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-blue-600"
                        title="Print"
                      >
                        <Printer size={18} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteInvoice(invoice._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;
