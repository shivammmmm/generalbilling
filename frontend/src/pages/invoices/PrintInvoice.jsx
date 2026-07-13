import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, MessageCircle, Pencil, Printer } from "lucide-react";
import API from "../../services/api";
import { toNumber } from "../../utils/billing";
import { numberToWords } from "../../utils/numberToWords";

const PAGE_ITEM_LIMIT = 14;
const COMPANY_DISPLAY_NAME = "Walia's Creative Design & Prints";

const FALLBACK_SHOP = {
  shopName: COMPANY_DISPLAY_NAME,
  businessLine:
    "Eco Solvent Print, Flex Banners, Hoardings, Glow Signs, Inshop Branding, Acrylic LED Boards.",
  shopAddress: "Kelkar Para, Station Road, Raipur (C.G.)",
  shopMobile: "+91 9981111199",
  shopEmail: "waliascreative@gmail.com",
  gstNumber: "22AEYPA8034J1ZC",
  accountHolderName: "Walia's Creative Design & Prints",
  bankName: "Punjab National Bank",
  bankBranch: "Budhapara Branch, Raipur (C.G.)",
  accountNumber: "0926050051323",
  ifscCode: "PUNB0092620",
  paymentUpiId: "ahluwaliaharmansingh@okicici",
};

const ORDER_PAYMENT_QR = "/payment-qr-crop.jpeg";
const ORDER_LOGO_NAME = "Walia's Creative";
const ORDER_SERVICES = ["Solvent", "Eco-Solvent", "Glow Sign Board", "Signage Solutions"];

const A4_PRINT_STYLE = `
.invoice-shell {
  background: #eef2f7;
}

.invoice-scroll {
  width: 100%;
  overflow-x: auto;
  padding: 0 0 16px;
}

.invoice-document {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-width: 210mm;
}

.invoice-page {
  width: 210mm;
  height: 297mm;
  padding: 8mm;
  box-sizing: border-box;
  background: #ffffff;
  color: #111827;
  font-family: "Segoe UI", Arial, sans-serif;
  font-weight: 700;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16);
  page-break-after: always;
  break-after: page;
}

.invoice-page:last-child {
  page-break-after: auto;
  break-after: auto;
}

.invoice-sheet {
  height: 281mm;
  border: 1.4px solid #111827;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.invoice-document.pdf-render {
  display: block;
  width: 210mm;
  min-width: 210mm;
  max-width: 210mm;
  gap: 0;
  align-items: stretch;
  margin: 0;
  padding: 0;
  background: #ffffff;
}

.invoice-document.pdf-render .invoice-page {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 8mm;
  box-shadow: none;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
}

.invoice-document.pdf-render .invoice-page:last-child {
  page-break-after: auto;
  break-after: auto;
}

.invoice-top-line {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  border-bottom: 1.2px solid #111827;
  padding: 4px 9px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.3;
}

.invoice-document-heading {
  font-size: 18px;
  font-weight: 900;
  text-transform: uppercase;
}

.invoice-title {
  text-align: center;
  padding: 5px 14px 9px;
}

.invoice-title h1 {
  margin: 0 0 10px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 39px;
  line-height: 1.08;
  letter-spacing: 0;
  text-transform: none;
}

.invoice-title p {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.invoice-business-line {
  border-top: 1.2px solid #111827;
  border-bottom: 1.2px solid #111827;
  background: #f3f6fb;
  padding: 6px 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
}

.invoice-contact-line {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8mm;
  padding: 6px 14px;
  text-align: center;
  border-bottom: 1.2px solid #111827;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
}

.invoice-party-grid {
  display: grid;
  grid-template-columns: 58% 42%;
  border-bottom: 1.2px solid #111827;
  font-size: 13px;
}

.invoice-buyer-box,
.invoice-meta-box {
  min-height: 28mm;
  padding: 8px 10px;
}

.invoice-buyer-box {
  border-right: 1.2px solid #111827;
}

.invoice-buyer-name {
  margin: 2px 0 0;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  text-transform: uppercase;
}

.invoice-muted-label {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.invoice-buyer-label {
  display: block;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
}

.invoice-buyer-details {
  margin-top: 5px;
  line-height: 1.55;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.invoice-meta-row {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 8px;
  padding: 5px 0;
  align-items: center;
  font-size: 13px;
  line-height: 1.35;
}

.invoice-meta-row strong:first-child {
  font-weight: 900;
}

.invoice-meta-row strong:last-child {
  font-size: 13.5px;
  font-weight: 900;
}

.invoice-page-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.invoice-table-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.invoice-table {
  width: 100%;
  flex: 1;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 11.5px;
  height: 100%;
}

.invoice-table th {
  background: #f8fafc;
  border-right: 1px solid #111827;
  border-bottom: 1.2px solid #111827;
  padding: 6px 5px;
  text-align: center;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
  text-transform: uppercase;
}

.invoice-table th:last-child,
.invoice-table td:last-child {
  border-right: 0;
}

.invoice-table td {
  height: 7.2mm;
  border-right: 1px solid #111827;
  padding: 4px 5px;
  vertical-align: middle;
  line-height: 1.28;
}

.invoice-table .amount-cell,
.invoice-table .rate-cell {
  text-align: center;
}

.invoice-table .center-cell {
  text-align: center;
}

.invoice-table .numeric-highlight {
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.invoice-table .gst-rate-cell,
.invoice-table .amount-highlight {
  font-size: 12.5px;
  font-weight: 900;
  white-space: nowrap;
}

.invoice-table .product-cell {
  font-weight: 800;
  line-height: 1.25;
  word-break: break-word;
}

.invoice-table tfoot td {
  background: #f8fafc;
  border-top: 1.2px solid #111827;
  border-bottom: 1.2px solid #111827;
  font-weight: 900;
}

.invoice-filler-row td {
  height: auto;
  border-bottom: 0;
}

.invoice-continued {
  margin-top: 6px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
  text-align: right;
}

.invoice-footer {
  margin-top: 0;
  border-top: 1.2px solid #111827;
  flex: 0 0 auto;
}

.invoice-footer-grid {
  display: grid;
  border-bottom: 1.2px solid #111827;
}

.invoice-footer-cell {
  min-height: 34mm;
  border-right: 1.2px solid #111827;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.invoice-footer-cell:last-child {
  border-right: 0;
}

.invoice-section-title {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 900;
  text-decoration: underline;
  text-transform: uppercase;
}

.invoice-tax-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 7px;
  font-size: 12px;
}

.invoice-tax-table th,
.invoice-tax-table td {
  border: 1px solid #111827;
  padding: 6px 5px;
  text-align: center;
  vertical-align: middle;
  line-height: 1.35;
  white-space: nowrap;
}

.invoice-tax-table th {
  background: #f3f6fb;
  font-size: 12.5px;
  font-weight: 900;
}

.invoice-tax-table td {
  font-size: 12.5px;
  font-weight: 800;
}

.invoice-terms {
  margin: 0;
  padding-left: 0;
  list-style-position: inside;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
}

.invoice-terms li {
  margin-bottom: 4px;
  line-height: 1.35;
}

.invoice-total-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  font-size: 12.5px;
  font-weight: 900;
  line-height: 1.3;
}

.invoice-total-row span:first-child {
  text-transform: uppercase;
}

.invoice-total-row span:last-child {
  font-size: 13px;
}

.invoice-total-row.net {
  margin-top: 5px;
  border-top: 1px solid #111827;
  padding-top: 6px;
  color: #991b1b;
  font-size: 15px;
}

.invoice-total-row.net span:last-child {
  font-size: 16.5px;
}

.invoice-signature-row {
  display: grid;
  grid-template-columns: 1fr 230px;
  align-items: end;
  gap: 14px;
  padding: 10px 14px 8px;
  min-height: 26mm;
}

.invoice-amount-words {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.invoice-signature {
  text-align: center;
  font-size: 12.5px;
  font-weight: 800;
  line-height: 1.25;
}

.invoice-signature-for {
  font-size: 13px;
  font-weight: 900;
}

.invoice-signature-company {
  font-size: 13px;
  font-weight: 900;
}

.invoice-signature img {
  display: block;
  height: 68px;
  max-width: 210px;
  object-fit: contain;
  margin: 2px auto 3px;
  mix-blend-mode: multiply;
}

.invoice-payment-qr {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 100%;
}

.invoice-payment-qr img {
  width: 84px;
  height: 84px;
  border: 1px solid #111827;
  object-fit: contain;
}

.invoice-payment-qr strong {
  display: block;
  font-size: 12.5px;
  text-transform: uppercase;
}

.invoice-payment-qr span {
  display: block;
  margin-top: 2px;
  word-break: break-all;
}

.order-letterhead-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px 6px;
  border-bottom: 1.2px solid #111827;
}

.order-logo {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.order-checklist {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.65;
  text-align: left;
  white-space: nowrap;
}

.order-checklist li::before {
  content: "\\2611";
  margin-right: 5px;
}

.order-address-line {
  padding: 6px 14px;
  text-align: center;
  border-bottom: 1.2px solid #111827;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.4;
}

.order-party-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  border-bottom: 1.2px solid #111827;
  font-size: 14px;
  font-weight: 800;
  gap: 12px;
}

.order-party-right {
  text-align: right;
  line-height: 1.55;
}

.order-footer {
  border-top: 1.2px solid #111827;
  padding: 8px 14px 12px;
}

.order-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #d7dde7;
}

.order-remarks {
  flex: 1;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
}

.order-total strong {
  font-size: 18px;
}

.order-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 10px;
  font-size: 11.5px;
  font-weight: 700;
}

.order-signature {
  font-size: 13.5px;
  font-weight: 900;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body,
  #root {
    width: 210mm;
    min-width: 210mm;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print\\:hidden {
    display: none !important;
  }

  .invoice-shell {
    background: #ffffff !important;
    padding: 0 !important;
  }

  .invoice-scroll {
    overflow: visible !important;
    padding: 0 !important;
  }

  .invoice-document {
    width: 210mm !important;
    gap: 0 !important;
    min-width: 0 !important;
    align-items: stretch !important;
  }

  .invoice-page {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 8mm !important;
    box-shadow: none !important;
  }

  .invoice-shell > * {
    margin-top: 0 !important;
  }
}
`;

const chunkItems = (items = []) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += PAGE_ITEM_LIMIT) {
    chunks.push(items.slice(index, index + PAGE_ITEM_LIMIT));
  }
  return chunks.length ? chunks : [[]];
};

const normalizeWhatsAppPhone = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const PrintInvoice = () => {
  const { id } = useParams();
  const printRef = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [whatsAppBusy, setWhatsAppBusy] = useState(false);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "a4-print-css";
    styleTag.textContent = A4_PRINT_STYLE;
    document.head.appendChild(styleTag);
    return () => {
      document.getElementById("a4-print-css")?.remove();
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

  const isGst = invoice?.documentType !== "order" && invoice?.gstEnabled !== false;
  const docLabel = isGst ? "Invoice" : "Order";
  const docHeading = isGst ? "Tax Invoice" : "Estimate / Order";

  const shop = useMemo(
    () => ({
      shopName: COMPANY_DISPLAY_NAME,
      businessLine: FALLBACK_SHOP.businessLine,
      shopAddress: settings.shopAddress || FALLBACK_SHOP.shopAddress,
      shopMobile: settings.shopMobile || FALLBACK_SHOP.shopMobile,
      shopEmail: settings.shopEmail || FALLBACK_SHOP.shopEmail,
      gstNumber: settings.gstNumber || FALLBACK_SHOP.gstNumber,
      accountHolderName:
        settings.accountHolderName || FALLBACK_SHOP.accountHolderName,
      bankName: settings.bankName || FALLBACK_SHOP.bankName,
      bankBranch: settings.bankBranch || FALLBACK_SHOP.bankBranch,
      accountNumber: settings.accountNumber || FALLBACK_SHOP.accountNumber,
      ifscCode: settings.ifscCode || FALLBACK_SHOP.ifscCode,
      paymentUpiId: FALLBACK_SHOP.paymentUpiId,
    }),
    [settings]
  );

  const pages = useMemo(() => chunkItems(invoice?.products || []), [invoice]);

  const taxBreakup = useMemo(() => {
    if (!invoice?.products?.length) return [];

    const groups = new Map();
    invoice.products.forEach((item) => {
      const quantity = toNumber(item.quantity, 1);
      const sqFt = toNumber(item.sqFt) || toNumber(item.length) * toNumber(item.width);
      const taxable =
        item.baseAmount ?? sqFt * quantity * toNumber(item.selectedRate);
      const rate = toNumber(item.gstRate);
      const gstAmount = item.gstAmount ?? (taxable * rate) / 100;
      const key = String(rate);
      const existing = groups.get(key) || { rate, taxable: 0, gstAmount: 0 };

      existing.taxable += taxable;
      existing.gstAmount += gstAmount;
      groups.set(key, existing);
    });

    return [...groups.values()].sort((a, b) => a.rate - b.rate);
  }, [invoice]);

  const termsList = [
    "All disputes are subject to Raipur Jurisdiction only.",
    "E.&O.E. GST rules apply as current regulations.",
  ];

  const grandTotal = toNumber(invoice?.grandTotal);
  const grandTotalRounded = Math.round(grandTotal);
  const roundOff = grandTotalRounded - grandTotal;
  const amountInWords = numberToWords(grandTotalRounded);

  const getExportFilename = (extension) =>
    `${isGst ? "GST-Invoice" : "Order"}-${invoice?.invoiceNumber || "bill"}.${extension}`;

  const getPdfOptions = (filename, element) => {
    const firstPage = element.querySelector(".invoice-page");
    const pageWidth = Math.ceil(
      firstPage?.getBoundingClientRect().width || element.getBoundingClientRect().width
    );
    const documentHeight = Math.ceil(
      element.scrollHeight || element.getBoundingClientRect().height
    );

    return {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: pageWidth,
        windowHeight: documentHeight,
        width: pageWidth,
        height: documentHeight,
      },
      jsPDF: { unit: "mm", format: [210, 297], orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };
  };

  const withCaptureRender = async (element, action) => {
    element.classList.add("pdf-render");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      return await action();
    } finally {
      element.classList.remove("pdf-render");
    }
  };

  const createPdfBlob = async (filename) => {
    const element = document.getElementById("invoice-a4-wrapper");
    if (!element) return null;

    const html2pdf = (await import("html2pdf.js")).default;
    return withCaptureRender(element, () =>
      html2pdf().set(getPdfOptions(filename, element)).from(element).output("blob")
    );
  };

  const createImageBlob = async (mimeType = "image/jpeg") => {
    const element = document.getElementById("invoice-a4-wrapper");
    if (!element) return null;

    const html2canvas = (await import("html2canvas")).default;
    return withCaptureRender(element, async () => {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      return new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.95));
    });
  };

  const createExportBlob = (filename) =>
    isGst ? createPdfBlob(filename) : createImageBlob("image/jpeg");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFile = async () => {
    if (!invoice || pdfBusy) return;

    setPdfBusy(true);
    try {
      const filename = getExportFilename(isGst ? "pdf" : "jpg");
      const blob = await createExportBlob(filename);
      if (blob) downloadBlob(blob, filename);
    } finally {
      setPdfBusy(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!invoice || whatsAppBusy) return;

    const phone = normalizeWhatsAppPhone(invoice?.farmer?.mobileNumber);
    if (!phone) {
      alert("Customer mobile number nahi mila.");
      return;
    }

    setWhatsAppBusy(true);
    try {
      const extension = isGst ? "pdf" : "jpg";
      const fileTypeLabel = isGst ? "PDF" : "Image";
      const filename = getExportFilename(extension);
      const blob = await createExportBlob(filename);
      if (!blob) return;

      const sharedFile = new File([blob], filename, {
        type: isGst ? "application/pdf" : "image/jpeg",
      });
      const date = formatDate(invoice?.createdAt);
      const message = `${docLabel} #${invoice?.invoiceNumber}\nDate: ${date}\nCustomer: ${invoice?.farmer?.name || "-"}\nAmount: Rs ${formatNumber(grandTotalRounded)}\n\n${fileTypeLabel} invoice is attached.`;

      if (navigator.canShare && navigator.canShare({ files: [sharedFile] })) {
        await navigator.share({
          files: [sharedFile],
          title: filename,
          text: message,
        });
        return;
      }

      downloadBlob(blob, filename);
      const fallbackMessage = `${message}\n\n${fileTypeLabel} has been downloaded. Please attach the downloaded file in this WhatsApp chat.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`, "_blank");
    } catch (err) {
      console.error("WhatsApp share failed:", err);
      alert("File share nahi ho paya. Please Save file karke WhatsApp me attach karein.");
    } finally {
      setWhatsAppBusy(false);
    }
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

  return (
    <div className="invoice-shell space-y-5 p-3 sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <button
            onClick={handleWhatsApp}
            disabled={whatsAppBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <MessageCircle size={17} />
            {whatsAppBusy ? "Preparing..." : `Send ${isGst ? "PDF" : "Image"} on WhatsApp`}
          </button>

          <Link
            to={`/invoices/edit/${invoice?._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-amber-600"
          >
            <Pencil size={17} />
            Edit {docLabel}
          </Link>

          <button
            onClick={handleDownloadFile}
            disabled={pdfBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download size={17} />
            {pdfBusy ? "Saving..." : isGst ? "Save PDF A4" : "Save Image"}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700"
          >
            <Printer size={17} />
            Print {docLabel}
          </button>
        </div>
      </div>

      <div className="invoice-scroll">
        <div id="invoice-a4-wrapper" ref={printRef} className="invoice-document">
          {pages.map((pageItems, pageIndex) => {
            const isLastPage = pageIndex === pages.length - 1;
            const serialOffset = pageIndex * PAGE_ITEM_LIMIT;

            return (
              <div className="invoice-page" key={`invoice-page-${pageIndex}`}>
                <div className="invoice-sheet">
                  <InvoiceHeader
                    docHeading={docHeading}
                    invoice={invoice}
                    isGst={isGst}
                    pageIndex={pageIndex}
                    pageCount={pages.length}
                    shop={shop}
                  />

                  <div className="invoice-page-body">
                    <div className="invoice-table-area">
                      <ItemsTable
                        invoice={invoice}
                        isGst={isGst}
                        pageItems={pageItems}
                        serialOffset={serialOffset}
                        showPageTotal={isLastPage}
                      />

                      {!isLastPage && (
                        <div className="invoice-continued">
                          Continued on next page
                        </div>
                      )}
                    </div>

                    {isLastPage && (
                      <InvoiceFooter
                        amountInWords={amountInWords}
                        grandTotalRounded={grandTotalRounded}
                        invoice={invoice}
                        isGst={isGst}
                        roundOff={roundOff}
                        shop={shop}
                        taxBreakup={taxBreakup}
                        termsList={termsList}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InvoiceHeader = ({ docHeading, invoice, isGst, pageIndex, pageCount, shop }) => {
  if (!isGst) {
    return <OrderHeader invoice={invoice} shop={shop} />;
  }

  const customerAddress = [
    invoice?.farmer?.address,
    invoice?.farmer?.village,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="invoice-top-line">
        <span />
        <span className="invoice-document-heading">{docHeading}</span>
        <span style={{ textAlign: "right" }}>
          Page {pageIndex + 1} of {pageCount}
        </span>
      </div>

      <div className="invoice-title">
        <h1>{shop.shopName}</h1>
        <p>{shop.shopAddress}</p>
      </div>

      <div className="invoice-business-line">{shop.businessLine}</div>

      <div className="invoice-contact-line">
        Mobile : {shop.shopMobile}
        {shop.shopEmail ? ` | Email : ${shop.shopEmail}` : ""}
        {shop.gstNumber ? ` | GSTIN : ${shop.gstNumber}` : ""}
      </div>

      <div className="invoice-party-grid">
        <div className="invoice-buyer-box">
          <span className="invoice-muted-label invoice-buyer-label">Bill To</span>
          <p className="invoice-buyer-name">{invoice?.farmer?.name || "-"}</p>
          <div className="invoice-buyer-details">
            <div>{customerAddress || "-"}</div>
            <div>Mobile: {invoice?.farmer?.mobileNumber || "-"}</div>
            <div>GSTIN: {invoice?.farmer?.gstNumber || "-"}</div>
          </div>
        </div>

        <div className="invoice-meta-box">
          <div className="invoice-meta-row">
            <strong>Invoice No.</strong>
            <strong>{invoice?.invoiceNumber}</strong>
          </div>
          <div className="invoice-meta-row">
            <strong>Invoice Date</strong>
            <strong>{formatDate(invoice?.createdAt)}</strong>
          </div>
          <div className="invoice-meta-row">
            <strong>Bill Time</strong>
            <strong>{formatTime(invoice?.createdAt)}</strong>
          </div>
          <div className="invoice-meta-row">
            <strong>Document Type</strong>
            <strong>GST Invoice</strong>
          </div>
        </div>
      </div>
    </>
  );
};

const OrderHeader = ({ invoice, shop }) => (
  <>
    <div className="order-letterhead-top">
      <h1 className="order-logo">{ORDER_LOGO_NAME}</h1>
      <ul className="order-checklist">
        {ORDER_SERVICES.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    </div>

    <div className="order-address-line">
      {shop.shopAddress}
      {shop.shopMobile ? ` | Handfone : ${shop.shopMobile}` : ""}
      {shop.shopEmail ? ` | e-mail : ${shop.shopEmail}` : ""}
    </div>

    <div className="order-party-row">
      <div>
        M/s <strong>{invoice?.farmer?.name || "-"}</strong>
      </div>
      <div className="order-party-right">
        <div>Inv.No. <strong>{invoice?.invoiceNumber}</strong></div>
        <div>Date <strong>{formatDate(invoice?.createdAt)}</strong></div>
      </div>
    </div>
  </>
);

const ItemsTable = ({ invoice, isGst, pageItems, serialOffset, showPageTotal }) => {
  return (
    <table className="invoice-table">
      <colgroup>
        <col style={{ width: "6%" }} />
        <col style={{ width: isGst ? "26%" : "40%" }} />
        {isGst && <col style={{ width: "10%" }} />}
        {isGst && <col style={{ width: "8%" }} />}
        {isGst && <col style={{ width: "12%" }} />}
        <col style={{ width: isGst ? "10%" : "16%" }} />
        <col style={{ width: isGst ? "8%" : "12%" }} />
        <col style={{ width: isGst ? "10%" : "13%" }} />
        <col style={{ width: isGst ? "10%" : "13%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>S. No.</th>
          <th>Particulars</th>
          {isGst && <th>HSN/SAC</th>}
          {isGst && <th>GST %</th>}
          {isGst && <th>Size</th>}
          <th>Sq.Ft.</th>
          <th>Qty.</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {pageItems.map((item, idx) => {
          const quantity = toNumber(item.quantity, 1);
          const sqFt = toNumber(item.sqFt) || toNumber(item.length) * toNumber(item.width);
          const amount =
            item.baseAmount ?? sqFt * quantity * toNumber(item.selectedRate);

          return (
            <tr key={item._id || `${item.product?._id}-${idx}`}>
              <td className="center-cell">{serialOffset + idx + 1}</td>
              <td className="product-cell">
                {item.product?.productName || item.product || "-"}
              </td>
              {isGst && (
                <td className="center-cell">
                  {item.hsnCode || item.product?.hsnCode || "-"}
                </td>
              )}
              {isGst && (
                <td className="center-cell gst-rate-cell">
                  {formatCompactNumber(item.gstRate)}
                </td>
              )}
              {isGst && (
                <td className="center-cell">
                  {formatCompactNumber(item.width)} x {formatCompactNumber(item.length)}
                </td>
              )}
              <td className="center-cell">{formatCompactNumber(sqFt)}</td>
              <td className="center-cell">{formatCompactNumber(quantity)}</td>
              <td className="rate-cell numeric-highlight">{formatNumber(item.selectedRate)}</td>
              <td className="amount-cell amount-highlight">{formatNumber(amount)}</td>
            </tr>
          );
        })}

        <FillerRow isGst={isGst} />
      </tbody>
      {showPageTotal && isGst && (
        <tfoot>
          <tr>
            <td />
            <td>Total Taxable Amount</td>
            {isGst && <td />}
            {isGst && <td />}
            {isGst && <td />}
            <td />
            <td />
            <td />
            <td className="amount-cell amount-highlight">{formatNumber(invoice?.subTotal)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

const FillerRow = ({ isGst }) => (
  <tr className="invoice-filler-row">
    <td />
    <td />
    {isGst && <td />}
    {isGst && <td />}
    {isGst && <td />}
    <td />
    <td />
    <td />
    <td />
  </tr>
);

const InvoiceFooter = ({
  amountInWords,
  grandTotalRounded,
  invoice,
  isGst,
  roundOff,
  shop,
  taxBreakup,
  termsList,
}) => {
  if (!isGst) {
    return <OrderFooter grandTotalRounded={grandTotalRounded} shop={shop} />;
  }

  return (
    <div className="invoice-footer">
      <div className="invoice-footer-grid" style={{ gridTemplateColumns: "45% 31% 24%" }}>
        <div className="invoice-footer-cell">
          <table className="invoice-tax-table">
            <thead>
              <tr>
                <th>GST</th>
                <th>Taxable</th>
                <th>CGST</th>
                <th>SGST</th>
              </tr>
            </thead>
            <tbody>
              {taxBreakup.map((row) => (
                <tr key={row.rate}>
                  <td style={{ fontWeight: 800, textAlign: "center" }}>
                    {formatCompactNumber(row.rate)}%
                  </td>
                  <td style={{ textAlign: "center" }}>{formatNumber(row.taxable)}</td>
                  <td style={{ textAlign: "center" }}>{formatNumber(row.gstAmount / 2)}</td>
                  <td style={{ textAlign: "center" }}>{formatNumber(row.gstAmount / 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <span className="invoice-section-title">Terms & Conditions</span>
          <ol className="invoice-terms">
            {termsList.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </div>

        <div className="invoice-footer-cell">
          <span className="invoice-section-title">Bank Details</span>
          <div>A/c Name: <strong>{shop.accountHolderName}</strong></div>
          <div>A/c No.: <strong>{shop.accountNumber}</strong></div>
          <div>Bank: <strong>{shop.bankName}</strong></div>
          <div>Branch: <strong>{shop.bankBranch}</strong></div>
          <div>IFSC: <strong>{shop.ifscCode}</strong></div>
        </div>

        <div className="invoice-footer-cell">
          <div className="invoice-total-row">
            <span>Total</span>
            <span>{formatNumber(invoice?.subTotal)}</span>
          </div>
          <div className="invoice-total-row">
            <span>CGST</span>
            <span>{formatNumber(toNumber(invoice?.totalGST) / 2)}</span>
          </div>
          <div className="invoice-total-row">
            <span>SGST</span>
            <span>{formatNumber(toNumber(invoice?.totalGST) / 2)}</span>
          </div>
          <div className="invoice-total-row">
            <span>Add GST</span>
            <span>{formatNumber(invoice?.totalGST)}</span>
          </div>
          {Math.abs(roundOff) >= 0.01 && (
            <div className="invoice-total-row">
              <span>Round Off</span>
              <span>{formatNumber(roundOff)}</span>
            </div>
          )}
          <div className="invoice-total-row net">
            <span>Net Total</span>
            <span>{formatNumber(grandTotalRounded)}</span>
          </div>
        </div>
      </div>

      <div className="invoice-signature-row">
        <div className="invoice-amount-words">
          <span className="invoice-muted-label">Amount Chargeable in Words</span>
          <div>
            <strong>Rs. {amountInWords} Only</strong>
          </div>
        </div>
        <div className="invoice-signature">
          <div className="invoice-signature-for">FOR</div>
          <div className="invoice-signature-company">{shop.shopName}</div>
          <img src="/signature.png" alt="Authorized signature" />
          <div>Proprietor / Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
};

const OrderFooter = ({ grandTotalRounded, shop }) => (
  <div className="order-footer">
    <div className="order-footer-row">
      <div className="order-remarks">Remarks :</div>

      <div className="invoice-payment-qr">
        <img src={ORDER_PAYMENT_QR} alt="Scan QR to pay" />
        <div>
          <strong>Scan to Pay</strong>
          <span>UPI: {shop.paymentUpiId}</span>
        </div>
      </div>

      <div className="order-total">
        <span>Total :</span>
        <strong>{formatNumber(grandTotalRounded)}</strong>
      </div>
    </div>

    <div className="order-bottom-row">
      <div>
        Subject to Raipur Jurisdiction
        <br />
        E.&amp;O.E.
      </div>
      <div className="order-signature">For, {ORDER_LOGO_NAME}</div>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatNumber = (value) =>
  toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCompactNumber = (value) => {
  const numericValue = toNumber(value);
  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2);
};

export default PrintInvoice;
