import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, MessageCircle, Pencil, Printer } from "lucide-react";
import API from "../../services/api";
import { toNumber } from "../../utils/billing";
import { numberToWords } from "../../utils/numberToWords";

const PAGE_ITEM_LIMIT = 14;

const FALLBACK_SHOP = {
  shopName: "Walia's Creative",
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
  min-height: 297mm;
  padding: 8mm;
  box-sizing: border-box;
  background: #ffffff;
  color: #111827;
  font-family: "Segoe UI", Arial, sans-serif;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16);
  page-break-after: always;
  break-after: page;
}

.invoice-page:last-child {
  page-break-after: auto;
  break-after: auto;
}

.invoice-sheet {
  min-height: 281mm;
  border: 1.4px solid #111827;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.invoice-document.pdf-render {
  gap: 0;
}

.invoice-document.pdf-render .invoice-page {
  box-shadow: none;
}

.invoice-top-line {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  border-bottom: 1.2px solid #111827;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.invoice-title {
  text-align: center;
  padding: 9px 12px 6px;
}

.invoice-title h1 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34px;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.invoice-title p {
  margin: 5px 0 0;
  font-size: 10px;
  font-weight: 700;
}

.invoice-business-line {
  border-top: 1.2px solid #111827;
  border-bottom: 1.2px solid #111827;
  background: #f3f6fb;
  padding: 5px 10px;
  text-align: center;
  font-size: 10.5px;
  font-weight: 800;
}

.invoice-contact-line {
  padding: 5px 12px;
  text-align: center;
  border-bottom: 1.2px solid #111827;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
}

.invoice-party-grid {
  display: grid;
  grid-template-columns: 58% 42%;
  border-bottom: 1.2px solid #111827;
  font-size: 10.5px;
}

.invoice-buyer-box,
.invoice-meta-box {
  min-height: 28mm;
  padding: 8px 9px;
}

.invoice-buyer-box {
  border-right: 1.2px solid #111827;
}

.invoice-buyer-name {
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.invoice-muted-label {
  color: #475569;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.invoice-meta-row {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #d7dde7;
}

.invoice-meta-row:last-child {
  border-bottom: 0;
}

.invoice-page-body {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9.3px;
}

.invoice-table th {
  background: #f8fafc;
  border-right: 1px solid #111827;
  border-bottom: 1.2px solid #111827;
  padding: 5px 4px;
  text-align: center;
  font-weight: 900;
  text-transform: uppercase;
}

.invoice-table th:last-child,
.invoice-table td:last-child {
  border-right: 0;
}

.invoice-table td {
  height: 7.1mm;
  border-right: 1px solid #111827;
  border-bottom: 1px solid #cbd5e1;
  padding: 3px 4px;
  vertical-align: top;
}

.invoice-table .amount-cell,
.invoice-table .rate-cell {
  text-align: right;
}

.invoice-table .center-cell {
  text-align: center;
}

.invoice-table .product-cell {
  font-weight: 800;
  word-break: break-word;
}

.invoice-table tfoot td {
  background: #f8fafc;
  border-top: 1.2px solid #111827;
  border-bottom: 1.2px solid #111827;
  font-weight: 900;
}

.invoice-continued {
  margin-top: 6px;
  color: #64748b;
  font-size: 9px;
  font-weight: 700;
  text-align: right;
}

.invoice-footer {
  margin-top: auto;
  border-top: 1.2px solid #111827;
}

.invoice-footer-grid {
  display: grid;
  border-bottom: 1.2px solid #111827;
}

.invoice-footer-cell {
  min-height: 34mm;
  border-right: 1.2px solid #111827;
  padding: 7px;
  font-size: 9.4px;
  line-height: 1.35;
}

.invoice-footer-cell:last-child {
  border-right: 0;
}

.invoice-section-title {
  display: block;
  margin-bottom: 4px;
  font-size: 9.5px;
  font-weight: 900;
  text-decoration: underline;
  text-transform: uppercase;
}

.invoice-tax-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px;
  font-size: 8.2px;
}

.invoice-tax-table th,
.invoice-tax-table td {
  border: 1px solid #111827;
  padding: 3px;
}

.invoice-tax-table th {
  background: #f3f6fb;
  font-weight: 900;
}

.invoice-terms {
  margin: 0;
  padding-left: 14px;
}

.invoice-terms li {
  margin-bottom: 2px;
}

.invoice-total-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 0;
  font-weight: 900;
}

.invoice-total-row.net {
  margin-top: 5px;
  border-top: 1px solid #111827;
  padding-top: 6px;
  color: #991b1b;
  font-size: 11px;
}

.invoice-signature-row {
  display: grid;
  grid-template-columns: 1fr 210px;
  align-items: end;
  gap: 12px;
  padding: 9px 12px 7px;
  min-height: 26mm;
}

.invoice-amount-words {
  font-size: 10px;
  line-height: 1.4;
}

.invoice-signature {
  text-align: center;
  font-size: 9.5px;
  font-weight: 800;
}

.invoice-signature img {
  display: block;
  height: 54px;
  max-width: 185px;
  object-fit: contain;
  margin: 0 auto 2px;
  mix-blend-mode: multiply;
}

.invoice-payment-qr {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
  border-top: 1px solid #d7dde7;
  padding-top: 7px;
}

.invoice-payment-qr img {
  width: 70px;
  height: 70px;
  border: 1px solid #111827;
  object-fit: contain;
}

.invoice-payment-qr strong {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
}

.invoice-payment-qr span {
  display: block;
  margin-top: 2px;
  word-break: break-all;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body {
    width: 210mm;
    background: #ffffff !important;
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
    gap: 0 !important;
    min-width: 0 !important;
  }

  .invoice-page {
    box-shadow: none !important;
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
      shopName: settings.shopName || FALLBACK_SHOP.shopName,
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

  const interestRate = toNumber(settings.monthlyInterestRate, 2) * 12 || 24;
  const termsList = [
    "Goods once sold will not be taken back or exchanged.",
    `Outstanding bills will attract ${formatCompactNumber(interestRate)}% annual interest after due date.`,
    "All disputes are subject to Raipur jurisdiction only.",
    "E. & O. E. GST rules apply as per current regulations.",
  ];

  const grandTotal = toNumber(invoice?.grandTotal);
  const grandTotalRounded = Math.round(grandTotal);
  const roundOff = grandTotalRounded - grandTotal;
  const amountInWords = numberToWords(grandTotalRounded);

  const getPdfFilename = () =>
    `${isGst ? "GST-Invoice" : "Order"}-${invoice?.invoiceNumber || "bill"}.pdf`;

  const getPdfOptions = (filename, element) => ({
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
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  });

  const withPdfRender = async (element, action) => {
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
    const options = getPdfOptions(filename, element);

    return withPdfRender(element, () =>
      html2pdf().set(options).from(element).output("blob")
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice || pdfBusy) return;

    setPdfBusy(true);
    try {
      const filename = getPdfFilename();
      const blob = await createPdfBlob(filename);
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
      const filename = getPdfFilename();
      const blob = await createPdfBlob(filename);
      if (!blob) return;

      const pdfFile = new File([blob], filename, { type: "application/pdf" });
      const date = formatDate(invoice?.createdAt);
      const message = `${docLabel} #${invoice?.invoiceNumber}\nDate: ${date}\nCustomer: ${invoice?.farmer?.name || "-"}\nAmount: Rs ${formatNumber(grandTotalRounded)}\n\nPDF invoice is attached.`;

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: filename,
          text: message,
        });
        return;
      }

      downloadBlob(blob, filename);
      const fallbackMessage = `${message}\n\nPDF has been downloaded. Please attach the downloaded file in this WhatsApp chat.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`, "_blank");
    } catch (err) {
      console.error("WhatsApp share failed:", err);
      alert("PDF share nahi ho paya. Please Save PDF karke WhatsApp me attach karein.");
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
            {whatsAppBusy ? "Preparing PDF..." : "Send PDF on WhatsApp"}
          </button>

          <Link
            to={`/invoices/edit/${invoice?._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-amber-600"
          >
            <Pencil size={17} />
            Edit {docLabel}
          </Link>

          <button
            onClick={handleDownloadPDF}
            disabled={pdfBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download size={17} />
            {pdfBusy ? "Saving..." : "Save PDF A4"}
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
  const customerAddress = [
    invoice?.farmer?.address,
    invoice?.farmer?.village,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentMode = invoice?.billingType === "cash" ? "Cash" : "Credit";

  return (
    <>
      <div className="invoice-top-line">
        <span>{isGst ? `GSTIN: ${shop.gstNumber}` : "Non-GST Order"}</span>
        <span>{docHeading}</span>
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
        Mobile: {shop.shopMobile}
        {shop.shopEmail ? ` | Email: ${shop.shopEmail}` : ""}
      </div>

      <div className="invoice-party-grid">
        <div className="invoice-buyer-box">
          <span className="invoice-muted-label">Bill To</span>
          <p className="invoice-buyer-name">{invoice?.farmer?.name || "-"}</p>
          <div style={{ marginTop: 4, lineHeight: 1.45 }}>
            <div>{customerAddress || "-"}</div>
            <div>Mobile: {invoice?.farmer?.mobileNumber || "-"}</div>
            {isGst && <div>GSTIN: {invoice?.farmer?.gstNumber || "-"}</div>}
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
            <strong>Payment Mode</strong>
            <strong>{paymentMode}</strong>
          </div>
          <div className="invoice-meta-row">
            <strong>Document Type</strong>
            <strong>{isGst ? "GST Invoice" : "Order"}</strong>
          </div>
        </div>
      </div>
    </>
  );
};

const ItemsTable = ({ invoice, isGst, pageItems, serialOffset, showPageTotal }) => {
  const blankRows = Math.max(0, PAGE_ITEM_LIMIT - pageItems.length);

  return (
    <table className="invoice-table">
      <colgroup>
        <col style={{ width: "6%" }} />
        <col style={{ width: isGst ? "26%" : "37%" }} />
        {isGst && <col style={{ width: "10%" }} />}
        {isGst && <col style={{ width: "8%" }} />}
        <col style={{ width: "12%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "8%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "10%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>S. No.</th>
          <th>Particulars</th>
          {isGst && <th>HSN/SAC</th>}
          {isGst && <th>GST %</th>}
          <th>Size</th>
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
                <td className="center-cell">
                  {formatCompactNumber(item.gstRate)}
                </td>
              )}
              <td className="center-cell">
                {formatCompactNumber(item.width)} x {formatCompactNumber(item.length)}
              </td>
              <td className="center-cell">{formatCompactNumber(sqFt)}</td>
              <td className="center-cell">{formatCompactNumber(quantity)}</td>
              <td className="rate-cell">{formatNumber(item.selectedRate)}</td>
              <td className="amount-cell">{formatNumber(amount)}</td>
            </tr>
          );
        })}

        {Array.from({ length: blankRows }).map((_, idx) => (
          <BlankRow key={`blank-${idx}`} isGst={isGst} />
        ))}
      </tbody>
      {showPageTotal && (
        <tfoot>
          <tr>
            <td />
            <td>Total Taxable Amount</td>
            {isGst && <td />}
            {isGst && <td />}
            <td />
            <td />
            <td />
            <td />
            <td className="amount-cell">{formatNumber(invoice?.subTotal)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

const BlankRow = ({ isGst }) => (
  <tr>
    <td />
    <td />
    {isGst && <td />}
    {isGst && <td />}
    <td />
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
}) => (
  <div className="invoice-footer">
    <div
      className="invoice-footer-grid"
      style={{
        gridTemplateColumns: isGst ? "45% 31% 24%" : "38% 38% 24%",
      }}
    >
      <div className="invoice-footer-cell">
        {isGst && (
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
                  <td style={{ textAlign: "center", fontWeight: 800 }}>
                    {formatCompactNumber(row.rate)}%
                  </td>
                  <td style={{ textAlign: "right" }}>{formatNumber(row.taxable)}</td>
                  <td style={{ textAlign: "right" }}>{formatNumber(row.gstAmount / 2)}</td>
                  <td style={{ textAlign: "right" }}>{formatNumber(row.gstAmount / 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
        {!isGst && (
          <div className="invoice-payment-qr">
            <img src={ORDER_PAYMENT_QR} alt="Scan QR to pay" />
            <div>
              <strong>Scan to Pay</strong>
              <span>UPI: {shop.paymentUpiId}</span>
            </div>
          </div>
        )}
      </div>

      <div className="invoice-footer-cell">
        <div className="invoice-total-row">
          <span>Subtotal</span>
          <span>{formatNumber(invoice?.subTotal)}</span>
        </div>
        {isGst && (
          <>
            <div className="invoice-total-row">
              <span>CGST</span>
              <span>{formatNumber(toNumber(invoice?.totalGST) / 2)}</span>
            </div>
            <div className="invoice-total-row">
              <span>SGST</span>
              <span>{formatNumber(toNumber(invoice?.totalGST) / 2)}</span>
            </div>
            <div className="invoice-total-row">
              <span>Total GST</span>
              <span>{formatNumber(invoice?.totalGST)}</span>
            </div>
          </>
        )}
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
        <div>For {shop.shopName}</div>
        <img src="/signature.png" alt="Authorized signature" />
        <div>Proprietor / Authorised Signatory</div>
      </div>
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
