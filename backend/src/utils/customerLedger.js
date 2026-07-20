import Farmer from "../models/Farmer.js";
import Invoice from "../models/Invoice.js";
import Transaction from "../models/Transaction.js";

export const getPaymentStatus = (grandTotal = 0, paidAmount = 0) => {
  const total = Number(grandTotal) || 0;
  const paid = Number(paidAmount) || 0;

  if (total <= 0 || paid >= total) return "paid";
  if (paid > 0) return "partially_paid";
  return "unpaid";
};

export const recalculateCustomerLedger = async (farmerId) => {
  const [farmer, invoices, transactions] = await Promise.all([
    Farmer.findById(farmerId),
    Invoice.find({ farmer: farmerId }).sort({ createdAt: 1, _id: 1 }),
    Transaction.find({ farmer: farmerId }).sort({ createdAt: 1, _id: 1 }),
  ]);

  if (!farmer) return null;

  const totalDebit = transactions
    .filter((entry) => ["opening", "credit", "interest"].includes(entry.type))
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const totalCredit = transactions
    .filter((entry) => entry.type === "payment")
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);

  let remainingPaid = totalCredit;

  for (const invoice of invoices) {
    const invoiceTotal = Number(invoice.grandTotal || 0);
    const paidAmount = Math.min(invoiceTotal, Math.max(remainingPaid, 0));
    const balanceDue = Math.max(invoiceTotal - paidAmount, 0);
    const paymentStatus = getPaymentStatus(invoiceTotal, paidAmount);

    invoice.paidAmount = paidAmount;
    invoice.balanceDue = balanceDue;
    invoice.paymentStatus = paymentStatus;
    await invoice.save();

    remainingPaid -= paidAmount;
  }

  farmer.dueAmount = Math.max(totalDebit - totalCredit, 0);
  await farmer.save();

  return {
    totalOrders: invoices.length,
    totalPurchase: invoices.reduce(
      (total, invoice) => total + Number(invoice.grandTotal || 0),
      0
    ),
    totalPaid: totalCredit,
    outstandingBalance: farmer.dueAmount,
  };
};

export const buildCustomerStatement = async (farmerId) => {
  await recalculateCustomerLedger(farmerId);

  const [farmer, invoices, transactions] = await Promise.all([
    Farmer.findById(farmerId),
    Invoice.find({ farmer: farmerId }).populate("products.product", "productName"),
    Transaction.find({ farmer: farmerId })
      .sort({ createdAt: 1, _id: 1 }),
  ]);

  if (!farmer) return null;

  // Older ledger entries may not have a usable invoice reference. Resolve by
  // invoice number as a fallback so existing GST and non-GST rows also split.
  const invoicesById = new Map(
    invoices.map((invoice) => [String(invoice._id), invoice])
  );
  const invoicesByNumber = new Map(
    invoices.map((invoice) => [String(invoice.invoiceNumber || "").trim(), invoice])
  );

  let runningBalance = 0;
  const statement = transactions.map((entry) => {
    let linkedInvoice = invoicesById.get(String(entry.invoice || ""))
      || invoicesById.get(String(entry._id || ""))
      || invoicesByNumber.get(String(entry.invoiceNumber || "").trim());

    if (!linkedInvoice && entry.type === "credit") {
      const sameAmountInvoices = invoices.filter(
        (invoice) => Number(invoice.grandTotal || 0) === Number(entry.amount || 0)
      );
      linkedInvoice = sameAmountInvoices.sort((first, second) => {
        const entryTime = new Date(entry.createdAt).getTime();
        return Math.abs(new Date(first.createdAt).getTime() - entryTime)
          - Math.abs(new Date(second.createdAt).getTime() - entryTime);
      })[0];
    }
    const isDebit = ["opening", "credit", "interest"].includes(entry.type);
    const debit = isDebit ? Number(entry.amount || 0) : 0;
    const credit = entry.type === "payment" ? Number(entry.amount || 0) : 0;
    runningBalance += debit - credit;

    return {
      _id: entry._id,
      date: entry.voucherDate || entry.createdAt,
      voucherType: entry.type,
      voucherNo: entry.voucherNo || "-",
      invoiceNo: entry.invoiceNumber || "-",
      description: entry.description || "",
      paymentMode: entry.paymentMode || "",
      documentType: linkedInvoice?.documentType || "",
      itemNames: [
        ...new Set(
          (linkedInvoice?.products || [])
            .map((item) => item.product?.productName)
            .filter(Boolean)
        ),
      ],
      type: entry.type,
      debit,
      credit,
      runningBalance: Math.max(runningBalance, 0),
    };
  });

  const totalPurchase = invoices.reduce(
    (total, invoice) => total + Number(invoice.grandTotal || 0),
    0
  );
  const totalPaid = transactions
    .filter((entry) => entry.type === "payment")
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);

  return {
    farmer,
    summary: {
      totalOrders: invoices.length,
      totalPurchase,
      totalPaid,
      outstandingBalance: farmer.dueAmount,
    },
    statement,
  };
};
