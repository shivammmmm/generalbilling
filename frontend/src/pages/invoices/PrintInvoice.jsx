import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Printer, Download, MessageCircle } from "lucide-react";
import API from "../../services/api";
import { formatCurrency, toNumber } from "../../utils/billing";

const PrintInvoice = () => {
  const { id } = useParams();
  const printRef = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getInvoice = async () => {
      try {
        const { data } = await API.get(`/invoices/print/${id}`);
        setInvoice(data.printableInvoice);
      } catch (err) {
        setError(err.response?.data?.message || "Invoice not found");
      } finally {
        setLoading(false);
      }
    };

    getInvoice();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice?.invoiceNumber || "Invoice",
  });

  // ✅ PDF Download — browser print dialog mein "Save as PDF" select karo
  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = `Invoice-${invoice?.invoiceNumber || "download"}`;
    window.print();
    document.title = originalTitle;
  };

  // ✅ WhatsApp Send (Free — wa.me link)
  const handleWhatsApp = () => {
    const phone = invoice?.farmer?.mobileNumber?.replace(/\D/g, "");
    if (!phone) {
      alert("Customer ka mobile number nahi mila.");
      return;
    }

    const date = new Date(invoice?.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const gstEnabled = invoice?.gstEnabled !== false;

    const productLines = invoice?.products
      ?.map((item) => {
        const sqFt = item.sqFt ?? toNumber(item.length) * toNumber(item.width);
        const baseAmount = item.baseAmount ?? sqFt * toNumber(item.selectedRate) * toNumber(item.quantity, 1);
        return `• ${item?.product?.productName} - ${sqFt} sqft @ ₹${item.selectedRate} = ₹${Math.round(baseAmount).toLocaleString("en-IN")}`;
      })
      .join("\n");

    const gstLine = gstEnabled
      ? `🏷️ GST: ₹${Math.round(toNumber(invoice?.totalGST)).toLocaleString("en-IN")}\n`
      : "";

    const message = `🧾 *Invoice #${invoice?.invoiceNumber}*
📅 Date: ${date}
👤 Customer: ${invoice?.farmer?.name}
📍 Area: ${invoice?.farmer?.village}

📦 *Items:*
${productLines}

💰 Subtotal: ₹${Math.round(toNumber(invoice?.subTotal)).toLocaleString("en-IN")}
${gstLine}✅ *Grand Total: ₹${Math.round(toNumber(invoice?.grandTotal)).toLocaleString("en-IN")}*

Payment Status: ${invoice?.paymentStatus?.toUpperCase()}

_Thank you for your business! 🌾_`;

    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center font-bold text-slate-600 shadow-sm">
        Loading invoice...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-10 text-center font-bold text-red-700">
        {error}
      </div>
    );
  }

  const gstEnabled = invoice?.gstEnabled !== false;

  return (
    <div className="space-y-6 bg-slate-100 p-4 sm:p-6">
      {/* Action Buttons — print mein hidden */}
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-black text-white shadow-lg shadow-green-200 hover:bg-green-600"
          >
            <MessageCircle size={18} />
            Send on WhatsApp
          </button>

          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 font-black text-white shadow-lg hover:bg-slate-900"
          >
            <Download size={18} />
            Save PDF
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        ref={printRef}
        className="mx-auto min-h-[1120px] w-full max-w-5xl bg-white p-8 text-slate-900 shadow-lg sm:p-10 print:min-h-0 print:max-w-none print:shadow-none"
      >
        <header className="flex flex-col gap-6 border-b-2 border-slate-900 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              AgroShop
            </h1>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">
              Agriculture Management System
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Your Business Address
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Phone: +91 98765 43210
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Invoice
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              #{invoice?.invoiceNumber}
            </h2>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Date:{" "}
              {new Date(invoice?.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Rate Type: {invoice?.rateType || "Rate A"}
            </p>
            {!gstEnabled && (
              <span className="mt-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                GST Excluded
              </span>
            )}
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Bill To
            </p>
            <h3 className="mt-3 text-xl font-black text-slate-950">
              {invoice?.farmer?.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Mobile: {invoice?.farmer?.mobileNumber}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Area: {invoice?.farmer?.village}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Address: {invoice?.farmer?.address}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span>Payment Status</span>
              <span className="capitalize text-slate-950">
                {invoice?.paymentStatus}
              </span>
            </div>
            {gstEnabled && (
              <div className="mt-4 flex justify-between text-sm font-bold text-slate-600">
                <span>GST Total</span>
                <span>{formatCurrency(invoice?.totalGST)}</span>
              </div>
            )}
            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-lg font-black text-slate-950">
                <span>Grand Total</span>
                <span>{formatCurrency(invoice?.grandTotal)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 overflow-hidden border border-slate-300">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                {[
                  "Product",
                  "Length",
                  "Width",
                  "Sq Ft",
                  "Rate / Sq Ft",
                  "Quantity",
                  ...(gstEnabled ? ["GST"] : []),
                  "Amount",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-slate-300 px-3 py-3 text-xs font-black uppercase tracking-wider text-slate-700"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice?.products?.map((item) => {
                const sqFt =
                  item.sqFt ?? toNumber(item.length) * toNumber(item.width);
                const baseAmount =
                  item.baseAmount ??
                  sqFt * toNumber(item.selectedRate) * toNumber(item.quantity, 1);

                return (
                  <tr key={item._id}>
                    <td className="border-b border-slate-200 px-3 py-3 font-bold">
                      {item?.product?.productName}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      {item?.length || 0} ft
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      {item?.width || 0} ft
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      {sqFt} sq ft
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      {formatCurrency(item?.selectedRate)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      {item?.quantity}
                    </td>
                    {gstEnabled && (
                      <td className="border-b border-slate-200 px-3 py-3">
                        {item?.gstRate}%
                      </td>
                    )}
                    <td className="border-b border-slate-200 px-3 py-3 font-black">
                      {formatCurrency(baseAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-8 ml-auto w-full max-w-sm space-y-4">
          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice?.subTotal)}</span>
          </div>
          {gstEnabled && (
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span>GST Total</span>
              <span>{formatCurrency(invoice?.totalGST)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-slate-900 pt-4 text-xl font-black text-slate-950">
            <span>Grand Total</span>
            <span>{formatCurrency(invoice?.grandTotal)}</span>
          </div>
        </section>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-sm font-semibold text-slate-600">
          Thank you for your business. 🌾
        </footer>
      </div>
    </div>
  );
};

export default PrintInvoice;
