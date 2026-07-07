import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Download, MessageCircle } from "lucide-react";
import API from "../../services/api";
import { toNumber } from "../../utils/billing";
import { numberToWords } from "../../utils/numberToWords";

// A4 Print CSS injected into document head
const A4_PRINT_STYLE = `
.inline-edit {
  border: none !important;
  background: transparent !important;
  width: 100% !important;
  font-family: inherit !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  color: inherit !important;
  padding: 0 !important;
  margin: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  resize: none !important;
}

@media screen {
  .inline-edit:hover {
    background-color: #f1f5f9 !important;
    cursor: pointer;
  }
  .inline-edit:focus {
    background-color: #f1f5f9 !important;
    border-bottom: 1px dashed #3b82f6 !important;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 5mm 8mm 5mm 8mm;
  }

  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: white !important;
  }

  .print\\:hidden { display: none !important; }

  #invoice-a4-wrapper {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: white !important;
    font-size: 9.5pt !important;
    border: 1.5px solid black !important;
  }

  #invoice-a4-wrapper table {
    font-size: 8.5pt !important;
  }

  #invoice-a4-wrapper th,
  #invoice-a4-wrapper td {
    padding: 2px 3px !important;
  }

  #invoice-a4-wrapper tr {
    page-break-inside: avoid;
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

  // Inline-editable states
  const [shopDetails, setShopDetails] = useState({
    shopName: "",
    shopAddress: "",
    shopMobile: "",
    shopEmail: "",
    gstNumber: "",
    accountHolderName: "",
    bankName: "",
    bankBranch: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  const [buyerDetails, setBuyerDetails] = useState({
    name: "",
    address: "",
    mobileNumber: "",
    gstNumber: "",
  });

  const [termsList, setTermsList] = useState([
    "Goods once sold will not be taken back or exchanged.",
    "Bills not paid due date will attract 24% interest.",
    "All disputes subject to Jurisdication only.",
    "Prescribed Sales Tax declaration will be given.",
  ]);

  const [printOptions, setPrintOptions] = useState({
    delivery: "",
    termsOfPayment: "",
    suppliersRef: "",
    otherReferences: "",
    buyerOrderNo: "",
    termsOfDelivery: "",
    dispatchDocNo: "",
    dispatchDated: "",
    dispatchThrough: "",
    destination: "",
  });

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

  useEffect(() => {
    if (settings) {
      setShopDetails({
        shopName: settings.shopName || "Walia’s creative design & prints",
        shopAddress: settings.shopAddress || "Budhapara branch Raipur (C.G.)",
        shopMobile: settings.shopMobile || "",
        shopEmail: settings.shopEmail || "",
        gstNumber: settings.gstNumber || "",
        accountHolderName: settings.accountHolderName || "Walia’s creative design & prints",
        bankName: settings.bankName || "Punjab national bank",
        bankBranch: settings.bankBranch || "Budhapara branch Raipur (C.G.)",
        accountNumber: settings.accountNumber || "0926050051323",
        ifscCode: settings.ifscCode || "PUNB0092620",
        upiId: settings.upiId || "0926050051323@pnb",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (invoice) {
      setBuyerDetails({
        name: invoice.farmer?.name || "",
        address: ((invoice.farmer?.address || "") + " " + (invoice.farmer?.village || "")).trim(),
        mobileNumber: invoice.farmer?.mobileNumber || "",
        gstNumber: invoice.farmer?.gstNumber || "",
      });

      setPrintOptions((prev) => ({
        ...prev,
        termsOfPayment: invoice.billingType === "cash" ? "CASH" : "CREDIT",
        dispatchDated: formatDate(invoice.createdAt),
      }));

      const interestRate = settings.monthlyInterestRate * 12 || 24;
      setTermsList([
        "Goods once sold will not be taken back or exchanged.",
        `Bills not paid due date will attract ${interestRate}% interest.`,
        "All disputes subject to Jurisdication only.",
        "Prescribed Sales Tax declaration will be given.",
      ]);
    }
  }, [invoice, settings]);

  const handleShopChange = (field, value) => {
    setShopDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuyerChange = (field, value) => {
    setBuyerDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleTermChange = (index, value) => {
    setTermsList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

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

    const date = formatDate(invoice?.createdAt);

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatNumber = (value) => {
    return toNumber(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

  // GST breakup: CGST + SGST (50/50 split)
  const totalGST = toNumber(invoice?.totalGST);
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;

  const grandTotal = toNumber(invoice?.grandTotal);
  const grandTotalRounded = Math.round(grandTotal);
  const adjustment = grandTotalRounded - grandTotal;
  const amountInWords = numberToWords(grandTotalRounded);

  // spacer row height to fit A4 page perfectly
  const itemRowsCount = invoice?.products?.length || 0;
  const spacerHeight = Math.max(15, 120 - (itemRowsCount * 15));

  // Dynamic QR Code link URL
  const payeeName = shopDetails.shopName || "Walia’s creative design & prints";
  const upiId = shopDetails.upiId || "0926050051323@pnb";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotalRounded}&tn=Invoice%20${invoice?.invoiceNumber}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiUrl)}`;

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

      {/* ── Print Customizations Panel (hidden on print) ── */}
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-700">
          Print customizations (Dispatch & Delivery Details)
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Delivery</label>
            <input
              type="text"
              value={printOptions.delivery}
              onChange={(e) => setPrintOptions({ ...printOptions, delivery: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
              placeholder="e.g. CASH"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Terms of Payment</label>
            <input
              type="text"
              value={printOptions.termsOfPayment}
              onChange={(e) => setPrintOptions({ ...printOptions, termsOfPayment: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Suppliers Ref.</label>
            <input
              type="text"
              value={printOptions.suppliersRef}
              onChange={(e) => setPrintOptions({ ...printOptions, suppliersRef: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Other Reference(s)</label>
            <input
              type="text"
              value={printOptions.otherReferences}
              onChange={(e) => setPrintOptions({ ...printOptions, otherReferences: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Buyer Order No</label>
            <input
              type="text"
              value={printOptions.buyerOrderNo}
              onChange={(e) => setPrintOptions({ ...printOptions, buyerOrderNo: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Terms of Delivery</label>
            <input
              type="text"
              value={printOptions.termsOfDelivery}
              onChange={(e) => setPrintOptions({ ...printOptions, termsOfDelivery: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dispatch Doc No</label>
            <input
              type="text"
              value={printOptions.dispatchDocNo}
              onChange={(e) => setPrintOptions({ ...printOptions, dispatchDocNo: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dispatch Date</label>
            <input
              type="text"
              value={printOptions.dispatchDated}
              onChange={(e) => setPrintOptions({ ...printOptions, dispatchDated: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dispatch Through</label>
            <input
              type="text"
              value={printOptions.dispatchThrough}
              onChange={(e) => setPrintOptions({ ...printOptions, dispatchThrough: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Destination</label>
            <input
              type="text"
              value={printOptions.destination}
              onChange={(e) => setPrintOptions({ ...printOptions, destination: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <p className="mt-3 text-xs font-bold text-slate-500">
          💡 Click directly on the Company Name, Address, Bank details, UPI ID, or Terms below in the preview to edit them dynamically!
        </p>
      </div>

      {/* ── A4 Invoice Content ── */}
      <div className="w-full overflow-x-auto pb-4">
        <div
          id="invoice-a4-wrapper"
          ref={printRef}
          style={{
            fontFamily: "'Segoe UI', Arial, sans-serif",
            border: "1.5px solid black",
            margin: "0 auto",
            padding: "0",
            backgroundColor: "#fff",
            color: "#000",
            boxSizing: "border-box",
            minWidth: "750px"
          }}
          className="mx-auto w-full max-w-[210mm] shadow-lg print:max-w-none print:shadow-none print:min-w-0"
        >
        {/* Title Header */}
        <div style={{ textAlign: "center", padding: "4px 0", borderBottom: "1.5px solid black" }}>
          <span style={{ fontSize: "13px", fontWeight: "bold", color: "#0000FF", letterSpacing: "1.5px" }}>
            {isGst ? "GST INVOICE" : "ESTIMATE / ORDER"}
          </span>
        </div>

        {/* Two-Column Seller & Invoice Details */}
        <div style={{ display: "grid", gridTemplateColumns: "58% 42%", borderBottom: "1.5px solid black" }}>
          {/* Left Column: Shop & Buyer Details */}
          <div style={{ borderRight: "1.5px solid black", display: "flex", flexDirection: "column" }}>
            {/* Shop Details */}
            <div style={{ padding: "8px", minHeight: "135px" }}>
              <input
                type="text"
                value={shopDetails.shopName}
                onChange={(e) => handleShopChange("shopName", e.target.value)}
                className="inline-edit"
                style={{ fontSize: "15px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" }}
              />
              <textarea
                rows="2"
                value={shopDetails.shopAddress}
                onChange={(e) => handleShopChange("shopAddress", e.target.value)}
                className="inline-edit mt-1"
                style={{ fontSize: "9.5px", fontWeight: "bold", textTransform: "uppercase", lineHeight: "1.3" }}
              />
              <div style={{ display: "flex", gap: "4px", fontSize: "9.5px", fontWeight: "bold", marginTop: "2px" }}>
                <span>Phone:</span>
                <input
                  type="text"
                  value={shopDetails.shopMobile}
                  onChange={(e) => handleShopChange("shopMobile", e.target.value)}
                  className="inline-edit"
                  style={{ width: "150px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "4px", fontSize: "9.5px", fontWeight: "bold" }}>
                <span>E-Mail:</span>
                <input
                  type="text"
                  value={shopDetails.shopEmail}
                  onChange={(e) => handleShopChange("shopEmail", e.target.value)}
                  className="inline-edit"
                  style={{ width: "200px" }}
                />
              </div>
              {isGst && (
                <div style={{ display: "flex", gap: "4px", fontSize: "9.5px", fontWeight: "bold" }}>
                  <span>GST No:</span>
                  <input
                    type="text"
                    value={shopDetails.gstNumber}
                    onChange={(e) => handleShopChange("gstNumber", e.target.value)}
                    className="inline-edit"
                    style={{ width: "180px" }}
                  />
                </div>
              )}
            </div>

            {/* Buyer Details */}
            <div style={{ padding: "8px", borderTop: "1.5px solid black", minHeight: "95px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "8.5px", margin: "0 0 2px 0", color: "#555" }}>Buyer details:</p>
                <input
                  type="text"
                  value={buyerDetails.name}
                  onChange={(e) => handleBuyerChange("name", e.target.value)}
                  className="inline-edit"
                  style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}
                />
                <textarea
                  rows="2"
                  value={buyerDetails.address}
                  onChange={(e) => handleBuyerChange("address", e.target.value)}
                  className="inline-edit mt-1"
                  style={{ fontSize: "9.5px", textTransform: "uppercase", lineHeight: "1.3" }}
                />
                <div style={{ display: "flex", gap: "4px", fontSize: "9.5px", marginTop: "2px" }}>
                  <span>Phone:</span>
                  <input
                    type="text"
                    value={buyerDetails.mobileNumber}
                    onChange={(e) => handleBuyerChange("mobileNumber", e.target.value)}
                    className="inline-edit"
                    style={{ width: "150px" }}
                  />
                </div>
              </div>
              {isGst && (
                <div style={{ display: "flex", gap: "4px", fontSize: "9.5px", fontWeight: "bold" }}>
                  <span>GST NO:</span>
                  <input
                    type="text"
                    value={buyerDetails.gstNumber}
                    onChange={(e) => handleBuyerChange("gstNumber", e.target.value)}
                    className="inline-edit"
                    style={{ width: "180px" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Grid */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Row 1 */}
            <div style={{ display: "flex", borderBottom: "1.5px solid black", height: "38px" }}>
              <div style={{ width: "50%", borderRight: "1.5px solid black", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Invoice No. :</span>
                <span style={{ fontSize: "10px", fontWeight: "bold" }}>{invoice?.invoiceNumber}</span>
              </div>
              <div style={{ width: "50%", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Date :</span>
                <span style={{ fontSize: "10px", fontWeight: "bold" }}>{formatDate(invoice?.createdAt)}</span>
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: "flex", borderBottom: "1.5px solid black", height: "38px" }}>
              <div style={{ width: "50%", borderRight: "1.5px solid black", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Delivery</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.delivery}</span>
              </div>
              <div style={{ width: "50%", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Terms Of Payment</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold", textTransform: "uppercase" }}>{printOptions.termsOfPayment}</span>
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: "flex", borderBottom: "1.5px solid black", height: "38px" }}>
              <div style={{ width: "50%", borderRight: "1.5px solid black", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Suppilers Ref.</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.suppliersRef}</span>
              </div>
              <div style={{ width: "50%", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Other Reference(s)</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.otherReferences}</span>
              </div>
            </div>

            {/* Row 4 */}
            <div style={{ display: "flex", borderBottom: "1.5px solid black", height: "38px" }}>
              <div style={{ width: "50%", borderRight: "1.5px solid black", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Buyer Order No</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.buyerOrderNo}</span>
              </div>
              <div style={{ width: "50%", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>TERMS OF DELIVERY</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.termsOfDelivery}</span>
              </div>
            </div>

            {/* Row 5 */}
            <div style={{ display: "flex", borderBottom: "1.5px solid black", height: "38px" }}>
              <div style={{ width: "50%", borderRight: "1.5px solid black", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Dispatch Document No</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.dispatchDocNo}</span>
              </div>
              <div style={{ width: "50%", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Dated</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.dispatchDated}</span>
              </div>
            </div>

            {/* Row 6 */}
            <div style={{ display: "flex", height: "38px" }}>
              <div style={{ width: "50%", borderRight: "1.5px solid black", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Dispatch through</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.dispatchThrough}</span>
              </div>
              <div style={{ width: "50%", padding: "3px 6px" }}>
                <span style={{ fontSize: "7.5px", color: "#555", display: "block" }}>Destination</span>
                <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{printOptions.destination}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1.5px solid black" }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid black", fontSize: "8.5px", fontWeight: "bold" }}>
              <th style={{ borderRight: "1.5px solid black", width: "4%", padding: "4px", textAlign: "center" }}>S.</th>
              <th style={{ borderRight: "1.5px solid black", width: "34%", padding: "4px", textAlign: "left" }}>PRODUCT NAME</th>
              <th style={{ borderRight: "1.5px solid black", width: "16%", padding: "0", textAlign: "center" }} colSpan="2">
                <div style={{ borderBottom: "1px solid black", padding: "2px 0" }}>SIZE DETAILS</div>
                <div style={{ display: "flex" }}>
                  <div style={{ width: "50%", borderRight: "1px solid black", padding: "1px 0" }}>WIDTH</div>
                  <div style={{ width: "50%", padding: "1px 0" }}>HEIGHT</div>
                </div>
              </th>
              <th style={{ borderRight: "1.5px solid black", width: "7%", padding: "4px", textAlign: "center" }}>PCS</th>
              <th style={{ borderRight: "1.5px solid black", width: "10%", padding: "4px", textAlign: "center" }}>QTY./SQFT</th>
              <th style={{ borderRight: "1.5px solid black", width: "9%", padding: "4px", textAlign: "right" }}>RATE</th>
              <th style={{ borderRight: "1.5px solid black", width: "6%", padding: "4px", textAlign: "center" }}>PER</th>
              <th style={{ borderRight: "1.5px solid black", width: "5%", padding: "4px", textAlign: "center" }}>DISC%</th>
              <th style={{ width: "9%", padding: "4px", textAlign: "right" }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.products?.map((item, idx) => {
              const sqFt = item.sqFt ?? toNumber(item.length) * toNumber(item.width);
              const totalSqFt = sqFt * toNumber(item.quantity, 1);
              const amount = item.baseAmount ?? totalSqFt * toNumber(item.selectedRate);

              return (
                <tr key={item._id || idx} style={{ fontSize: "9px", height: "24px" }}>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ borderRight: "1.5px solid black", paddingLeft: "6px", fontWeight: "bold" }}>{item?.product?.productName}</td>
                  <td style={{ borderRight: "1px solid black", textAlign: "center" }}>{toNumber(item.width).toFixed(2)}</td>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "center" }}>{toNumber(item.length).toFixed(2)}</td>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "center" }}>{toNumber(item.quantity).toFixed(2)}</td>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "center" }}>{totalSqFt.toFixed(2)}</td>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "right", paddingRight: "4px" }}>{toNumber(item.selectedRate).toFixed(2)}</td>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "center" }}>{item?.product?.unit || "SQFT"}</td>
                  <td style={{ borderRight: "1.5px solid black", textAlign: "center" }}>0.00</td>
                  <td style={{ textAlign: "right", paddingRight: "4px" }}>{toNumber(amount).toFixed(2)}</td>
                </tr>
              );
            })}
            {/* Empty spacer row to push total to bottom and render vertical borders */}
            <tr style={{ height: `${spacerHeight}px` }}>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td></td>
            </tr>
            {/* Total row of table */}
            <tr style={{ borderTop: "1.5px solid black", fontSize: "9.5px", fontWeight: "bold", height: "26px" }}>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black", paddingLeft: "6px", textAlign: "left" }}>TOTAL</td>
              <td style={{ borderRight: "1px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ borderRight: "1.5px solid black" }}></td>
              <td style={{ textAlign: "right", paddingRight: "4px" }}>{toNumber(invoice?.subTotal).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Area: Bank & Terms Left, Summary Totals Right */}
        <div style={{ display: "grid", gridTemplateColumns: "60% 40%", padding: "6px 0", borderBottom: "1.5px solid black" }}>
          {/* Left Column: Bank Details & Terms */}
          <div style={{ paddingLeft: "8px", paddingRight: "8px" }}>
            {/* Bank Details & QR Code Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "70% 30%", marginBottom: "8px", alignItems: "center" }}>
              <div style={{ fontSize: "8.5px", fontWeight: "bold", lineHeight: "1.4" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span>A/C NAME -</span>
                  <input
                    type="text"
                    value={shopDetails.accountHolderName}
                    onChange={(e) => handleShopChange("accountHolderName", e.target.value)}
                    className="inline-edit"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span>BANK NAME -</span>
                  <input
                    type="text"
                    value={shopDetails.bankName}
                    onChange={(e) => handleShopChange("bankName", e.target.value)}
                    className="inline-edit"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span>BRANCH -</span>
                  <input
                    type="text"
                    value={shopDetails.bankBranch}
                    onChange={(e) => handleShopChange("bankBranch", e.target.value)}
                    className="inline-edit"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span>ACCOUNT NO. -</span>
                  <input
                    type="text"
                    value={shopDetails.accountNumber}
                    onChange={(e) => handleShopChange("accountNumber", e.target.value)}
                    className="inline-edit"
                  />
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span>BRANCH IFSC -</span>
                  <input
                    type="text"
                    value={shopDetails.ifscCode}
                    onChange={(e) => handleShopChange("ifscCode", e.target.value)}
                    className="inline-edit"
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={qrCodeUrl}
                  alt="Scan to Pay"
                  style={{ width: "70px", height: "70px", border: "1.5px solid black", padding: "1px", background: "white" }}
                />
                <span style={{ fontSize: "7px", fontWeight: "bold", marginTop: "2px" }}>SCAN TO PAY</span>
                <input
                  type="text"
                  value={shopDetails.upiId}
                  onChange={(e) => handleShopChange("upiId", e.target.value)}
                  className="inline-edit print:hidden"
                  placeholder="UPI ID"
                  style={{ fontSize: "7.5px", fontWeight: "bold", textAlign: "center", width: "95px", marginTop: "3px", borderBottom: "1px dotted #ccc" }}
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{ fontSize: "8.5px" }}>
              <span style={{ textDecoration: "underline", fontWeight: "bold", fontStyle: "italic" }}>Terms & Conditions</span>
              <ol style={{ margin: "2px 0 0 0", paddingLeft: "14px", lineHeight: "1.3", listStyleType: "decimal" }}>
                {termsList.map((term, index) => (
                  <li key={index}>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => handleTermChange(index, e.target.value)}
                      className="inline-edit"
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Column: Summary Totals */}
          <div style={{ paddingRight: "8px", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-start" }}>
            <table style={{ width: "100%", fontSize: "9.5px", fontWeight: "bold", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", padding: "3px 0" }}>SUB TOTAL AMOUNT :</td>
                  <td style={{ textAlign: "right", padding: "3px 0" }}>{formatNumber(invoice?.subTotal)}</td>
                </tr>
                {isGst && totalGST > 0 && (
                  <>
                    <tr>
                      <td style={{ textAlign: "left", padding: "2.5px 0" }}>CGST (50%) :</td>
                      <td style={{ textAlign: "right", padding: "2.5px 0" }}>{formatNumber(cgst)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "2.5px 0" }}>SGST (50%) :</td>
                      <td style={{ textAlign: "right", padding: "2.5px 0" }}>{formatNumber(sgst)}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td style={{ textAlign: "left", padding: "3px 0" }}>BILL DISC :</td>
                  <td style={{ textAlign: "right", padding: "3px 0" }}>0.00</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "3px 0" }}>OTHER ADJUSTMENT :</td>
                  <td style={{ textAlign: "right", padding: "3px 0" }}>{formatNumber(adjustment)}</td>
                </tr>
                <tr style={{ borderTop: "1px solid black" }}>
                  <td style={{ textAlign: "left", padding: "4px 0" }}>TOTAL AMOUNT R/off :</td>
                  <td style={{ textAlign: "right", padding: "4px 0" }}>{formatNumber(grandTotalRounded)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chargeable Amount in Words & Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "8px 8px 8px 8px" }}>
          {/* Amount in words */}
          <div style={{ width: "60%" }}>
            <span style={{ fontSize: "8px", color: "#555", display: "block" }}>Amount Chargeable(in words)</span>
            <span style={{ fontSize: "9.5px", fontWeight: "bold" }}>{amountInWords}</span>
          </div>

          {/* Signature */}
          <div style={{ width: "40%", textAlign: "right", fontSize: "8.5px" }}>
            <span style={{ display: "block", marginBottom: "35px", fontStyle: "italic" }}>Authorised signatory</span>
            <span style={{ fontWeight: "bold" }}>For {shopDetails.shopName.toUpperCase()}</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
