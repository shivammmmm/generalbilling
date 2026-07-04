import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Download, MessageCircle } from "lucide-react";
import API from "../../services/api";
import { formatCurrency, toNumber } from "../../utils/billing";

// A4 Print CSS injected into document head
const A4_PRINT_STYLE = `
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 12mm 10mm 12mm;
  }

  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print\\:hidden { display: none !important; }

  #invoice-a4-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
    background: white;
    font-size: 10pt;
  }

  #invoice-a4-wrapper table {
    font-size: 8.5pt;
  }

  #invoice-a4-wrapper th,
  #invoice-a4-wrapper td {
    padding: 4px 5px !important;
  }

  #invoice-a4-wrapper tr {
    page-break-inside: avoid;
  }

  #invoice-a4-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #e2e8f0;
    padding: 4mm 0 0 0;
    text-align: center;
    font-size: 8pt;
    color: #64748b;
    background: white;
  }
}
`;

const PrintInvoice = () => {
  const { id } = useParams();
  const printRef = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inject A4 print styles once
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "a4-print-css";
    styleTag.textContent = A4_PRINT_STYLE;
    document.head.appendChild(styleTag);
    return () => {
      const existing = document.getElementById("a4-print-css");
      if (existing) existing.remove();
    };
  }, []);

  useEffect(() => {
    const getInvoice = async () => {
      try {
        const { data } = await API.get(`/invoices/print/${id}`);
        setInvoice(data.printableInvoice);
        setSettings(data.settings || {});
      } catch (err) {
        setError(err.response?.data?.message || "Invoice not found");
      } finally {
        setLoading(false);
      }
    };

    getInvoice();
  }, [id]);

  // ── Print via browser dialog ──
  const handlePrint = () => {
    window.print();
  };

  // ── PDF Download using html2pdf.js ──
  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-a4-wrapper");
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const isGst = invoice?.documentType !== "order" && invoice?.gstEnabled !== false;
    const docLabel = isGst ? "GST-Invoice" : "Order";
    const filename = `${docLabel}-${invoice?.invoiceNumber || "bill"}.pdf`;

    const opt = {
      margin: [10, 12, 10, 12],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css"] },
    };

    await html2pdf().set(opt).from(element).save();
  };

  // ── WhatsApp: Download PDF → open WhatsApp with message ──
  const handleWhatsApp = async () => {
    const phone = invoice?.farmer?.mobileNumber?.replace(/\D/g, "");
    if (!phone) {
      alert("Customer ka mobile number nahi mila.");
      return;
    }

    // 1. Download PDF first
    await handleDownloadPDF();

    // 2. Build message
    const isGst = invoice?.documentType !== "order" && invoice?.gstEnabled !== false;
    const docLabel = isGst ? "Invoice" : "Order";
    const filename = `${isGst ? "GST-Invoice" : "Order"}-${invoice?.invoiceNumber || "bill"}.pdf`;

    const date = new Date(invoice?.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const productLines = invoice?.products
      ?.map((item) => {
        const sqFt = item.sqFt ?? toNumber(item.length) * toNumber(item.width);
        const baseAmount =
          item.baseAmount ?? sqFt * toNumber(item.selectedRate) * toNumber(item.quantity, 1);
        return `• ${item?.product?.productName} - ${sqFt} sqft @ ₹${item.selectedRate} = ₹${Math.round(baseAmount).toLocaleString("en-IN")}`;
      })
      .join("\n");

    const gstLine =
      isGst
        ? `🏷️ GST: ₹${Math.round(toNumber(invoice?.totalGST)).toLocaleString("en-IN")}\n`
        : "";

    const message = `🧾 *${docLabel} #${invoice?.invoiceNumber}*
📅 Date: ${date}
👤 Customer: ${invoice?.farmer?.name}
📍 Area: ${invoice?.farmer?.village}

📦 *Items:*
${productLines}

💰 Subtotal: ₹${Math.round(toNumber(invoice?.subTotal)).toLocaleString("en-IN")}
${gstLine}✅ *Grand Total: ₹${Math.round(toNumber(invoice?.grandTotal)).toLocaleString("en-IN")}*

📎 PDF "${filename}" download ho gaya hai.
WhatsApp mein attach karke bhejo!

_Thank you for your business! 🌾_`;

    // 3. Open WhatsApp Web
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

  const isGst = invoice?.documentType !== "order" && invoice?.gstEnabled !== false;
  const docLabel = isGst ? "Invoice" : "Order";
  const shopName = settings?.shopName || "FlexBill";
  const shopAddress = settings?.shopAddress || "";
  const shopMobile = settings?.shopMobile || "";
  const gstNumber = settings?.gstNumber || "";

  // GST breakup: CGST + SGST (50/50 split)
  const totalGST = toNumber(invoice?.totalGST);
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;

  return (
    <div className="space-y-6 bg-slate-100 p-4 sm:p-6">
      {/* ── Action Buttons (hidden on print) ── */}
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-black text-white shadow-lg shadow-green-200 hover:bg-green-600"
          >
            <MessageCircle size={18} />
            Send to WhatsApp
          </button>

          {/* PDF Download */}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 font-black text-white shadow-lg hover:bg-slate-900"
          >
            <Download size={18} />
            Save PDF (A4)
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            <Printer size={18} />
            Print {docLabel}
          </button>
        </div>
      </div>

      {/* ── A4 Invoice Content ── */}
      <div
        id="invoice-a4-wrapper"
        ref={printRef}
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
        className="mx-auto w-full max-w-[210mm] bg-white px-8 py-7 text-slate-900 shadow-lg print:max-w-none print:shadow-none print:px-0 print:py-0"
      >

        {/* ── HEADER ── */}
        <header style={{ borderBottom: "2.5px solid #1e293b", paddingBottom: "10px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Left: Shop Info */}
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                {shopName}
              </h1>
              {shopAddress && (
                <p style={{ fontSize: "9px", color: "#475569", margin: "2px 0 0 0" }}>
                  {shopAddress}
                </p>
              )}
              {shopMobile && (
                <p style={{ fontSize: "9px", color: "#475569", margin: "1px 0 0 0" }}>
                  Phone: {shopMobile}
                </p>
              )}
              {isGst && gstNumber && (
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#1d4ed8", margin: "2px 0 0 0" }}>
                  GSTIN: {gstNumber}
                </p>
              )}
            </div>

            {/* Right: Invoice/Order Number */}
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase", margin: 0 }}>
                {docLabel}
              </p>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "2px 0 0 0" }}>
                #{invoice?.invoiceNumber}
              </h2>
              <p style={{ fontSize: "9px", color: "#475569", margin: "3px 0 0 0" }}>
                Date:{" "}
                {new Date(invoice?.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {!isGst && (
                <span style={{ display: "inline-block", marginTop: "4px", background: "#fff7ed", color: "#c2410c", fontSize: "8px", fontWeight: 900, padding: "2px 8px", borderRadius: "9999px", border: "1px solid #fed7aa" }}>
                  NON-GST ORDER
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── BILL TO ── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <p style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: 0 }}>
              Bill To
            </p>
            <h3 style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a", margin: "4px 0 2px 0" }}>
              {invoice?.farmer?.name}
            </h3>
            <p style={{ fontSize: "9px", color: "#475569", margin: "1px 0" }}>
              Mobile: {invoice?.farmer?.mobileNumber}
            </p>
            <p style={{ fontSize: "9px", color: "#475569", margin: "1px 0" }}>
              Area: {invoice?.farmer?.village}
            </p>
            {invoice?.farmer?.address && (
              <p style={{ fontSize: "9px", color: "#475569", margin: "1px 0" }}>
                Address: {invoice?.farmer?.address}
              </p>
            )}
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
            {isGst && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                <span>Total GST</span>
                <span>{formatCurrency(invoice?.totalGST)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>
              <span>Grand Total</span>
              <span>{formatCurrency(invoice?.grandTotal)}</span>
            </div>
          </div>
        </section>

        {/* ── ITEMS TABLE ── */}
        <section style={{ marginBottom: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "left", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>Product</th>
                {isGst && <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "left", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>HSN</th>}
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "center", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>L (ft)</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "center", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>W (ft)</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "center", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>Sq Ft</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "center", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>Qty</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "right", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>Rate/SqFt</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "right", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>Taxable Amt</th>
                {isGst && <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "center", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>GST %</th>}
                {isGst && <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "right", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>GST Amt</th>}
                <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", textAlign: "right", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "8px", color: "#475569" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.products?.map((item, idx) => {
                const sqFt =
                  item.sqFt ?? toNumber(item.length) * toNumber(item.width);
                const baseAmount =
                  item.baseAmount ??
                  sqFt * toNumber(item.selectedRate) * toNumber(item.quantity, 1);
                const gstAmt = isGst ? toNumber(item.gstAmount) : 0;
                const lineTotal = baseAmount + gstAmt;
                const hsnCode = item.hsnCode || item.product?.hsnCode || "—";

                return (
                  <tr key={item._id || idx} style={{ pageBreakInside: "avoid" }}>
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", fontWeight: 700 }}>
                      {item?.product?.productName}
                    </td>
                    {isGst && (
                      <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "left", color: "#475569" }}>
                        {hsnCode}
                      </td>
                    )}
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "center" }}>
                      {item?.length || 0}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "center" }}>
                      {item?.width || 0}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "center" }}>
                      {sqFt}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "center" }}>
                      {item?.quantity}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "right" }}>
                      {formatCurrency(item?.selectedRate)}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "right" }}>
                      {formatCurrency(baseAmount)}
                    </td>
                    {isGst && (
                      <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "center" }}>
                        {item?.gstRate}%
                      </td>
                    )}
                    {isGst && (
                      <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "right" }}>
                        {formatCurrency(gstAmt)}
                      </td>
                    )}
                    <td style={{ border: "1px solid #e2e8f0", padding: "5px 6px", textAlign: "right", fontWeight: 900 }}>
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ── TOTALS ── */}
        <section style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
          <div style={{ minWidth: "260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
              <span>Subtotal (Taxable)</span>
              <span>{formatCurrency(invoice?.subTotal)}</span>
            </div>

            {isGst && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#64748b", marginBottom: "2px" }}>
                  <span>CGST (50%)</span>
                  <span>{formatCurrency(cgst)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#64748b", marginBottom: "2px" }}>
                  <span>SGST (50%)</span>
                  <span>{formatCurrency(sgst)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  <span>Total GST</span>
                  <span>{formatCurrency(totalGST)}</span>
                </div>
              </>
            )}

            <div style={{ borderTop: "2px solid #0f172a", paddingTop: "6px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
              <span>Grand Total</span>
              <span>{formatCurrency(invoice?.grandTotal)}</span>
            </div>
          </div>
        </section>

        {/* ── TERMS / NOTES ── */}
        {isGst && (
          <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 12px", marginBottom: "10px", fontSize: "8px", color: "#64748b" }}>
            <strong>Note:</strong> This is a computer-generated GST Invoice. E&OE.
            {gstNumber && ` | GSTIN: ${gstNumber}`}
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer id="invoice-a4-footer" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", textAlign: "center", fontSize: "8px", color: "#94a3b8", marginTop: "8px" }}>
          Thank you for your business. 🌾 | {shopName}
          {shopMobile && ` | ${shopMobile}`}
        </footer>
      </div>
    </div>
  );
};

export default PrintInvoice;
