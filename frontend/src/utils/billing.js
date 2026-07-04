export const RATE_TYPES = ["Rate A", "Rate B", "Rate C"];

export const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getProductRate = (product, rateType = "Rate A") => {
  if (!product) return 0;

  if (rateType === "Rate B") return toNumber(product.creditRate);
  if (rateType === "Rate C") return toNumber(product.wholesaleRate);

  return toNumber(product.cashRate);
};

export const calculateLine = (item, product, rateType = "Rate A", gstEnabled = true) => {
  const length = toNumber(item?.length);
  const width = toNumber(item?.width);
  const quantity = toNumber(item?.quantity, 1);
  const sqFt = length * width;
  const rate =
    item?.selectedRate !== undefined && item?.selectedRate !== ""
      ? toNumber(item.selectedRate)
      : getProductRate(product, rateType);
  const gstRate =
    gstEnabled
      ? (item?.gstRate !== undefined && item?.gstRate !== ""
          ? toNumber(item.gstRate)
          : toNumber(product?.gstRate))
      : 0;
  const baseAmount = sqFt * rate * quantity;
  const gstAmount = (baseAmount * gstRate) / 100;
  const lineTotal = baseAmount + gstAmount;

  return {
    length,
    width,
    quantity,
    sqFt,
    rate,
    gstRate,
    baseAmount,
    gstAmount,
    lineTotal,
  };
};

export const calculateInvoiceTotals = (
  items = [],
  products = [],
  rateType = "Rate A",
  gstEnabled = true
) => {
  return items.reduce(
    (totals, item) => {
      const product = products.find((entry) => entry._id === item.product);
      const line = calculateLine(item, product, rateType, gstEnabled);

      return {
        subTotal: totals.subTotal + line.baseAmount,
        totalGST: totals.totalGST + line.gstAmount,
        grandTotal: totals.grandTotal + line.lineTotal,
      };
    },
    { subTotal: 0, totalGST: 0, grandTotal: 0 }
  );
};

export const formatCurrency = (value) =>
  `Rs ${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
