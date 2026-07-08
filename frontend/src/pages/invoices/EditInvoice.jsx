import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileCheck,
  FileText,
  IndianRupee,
  Plus,
  Receipt,
  Ruler,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import {
  RATE_TYPES,
  calculateInvoiceTotals,
  calculateLine,
  getProductRate,
} from "../../utils/billing";

const emptyItem = {
  product: "",
  length: "",
  width: "",
  quantity: 1,
  selectedRate: "",
  gstRate: "",
};

const today = new Date().toISOString().slice(0, 10);

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [documentType, setDocumentType] = useState("gst_invoice");

  const gstEnabled = documentType === "gst_invoice";

  const [formData, setFormData] = useState({
    farmerId: "",
    rateType: "Rate A",
    invoiceDate: today,
    billingType: "credit",
    products: [{ ...emptyItem }],
  });

  const summary = useMemo(
    () =>
      calculateInvoiceTotals(
        formData.products,
        productsList,
        formData.rateType,
        gstEnabled
      ),
    [formData.products, formData.rateType, productsList, gstEnabled]
  );

  const withProductRate = (item, rateType = formData.rateType) => {
    const product = productsList.find((entry) => entry._id === item.product);
    if (!product) return item;

    return {
      ...item,
      selectedRate: getProductRate(product, rateType),
      gstRate: product.gstRate ?? 0,
    };
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((entry) => entry._id === customerId);
    const nextRateType = customer?.defaultRateType || "Rate A";

    setFormData((prev) => ({
      ...prev,
      farmerId: customerId,
      rateType: nextRateType,
      products: prev.products.map((item) =>
        item.product ? withProductRate(item, nextRateType) : item
      ),
    }));
  };

  const handleRateTypeChange = (rateType) => {
    setFormData((prev) => ({
      ...prev,
      rateType,
      products: prev.products.map((item) =>
        item.product ? withProductRate(item, rateType) : item
      ),
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData((prev) => {
      const products = prev.products.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const updated = { ...item, [field]: value };

        if (field === "product") {
          const product = productsList.find((entry) => entry._id === value);

          return {
            ...updated,
            selectedRate: product ? getProductRate(product, prev.rateType) : "",
            gstRate: product?.gstRate ?? "",
          };
        }

        return updated;
      });

      return { ...prev, products };
    });
  };

  const addProductRow = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { ...emptyItem }],
    }));
  };

  const removeProductRow = (index) => {
    setFormData((prev) => {
      if (prev.products.length === 1) return prev;

      return {
        ...prev,
        products: prev.products.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleFormKeyDown = (event) => {
    if (event.key !== "Enter") return;

    const active = document.activeElement;
    if (
      !active ||
      (active.tagName !== "INPUT" && active.tagName !== "SELECT") ||
      active.type === "submit"
    ) {
      return;
    }

    event.preventDefault();
    const controls = Array.from(
      event.currentTarget.querySelectorAll("input, select, button[type='submit']")
    ).filter((el) => !el.disabled && el.type !== "hidden" && el.tabIndex !== -1);
    const index = controls.indexOf(active);
    const next = controls[index + 1];

    if (next) {
      next.focus();
      if (next.tagName === "INPUT" && next.select) next.select();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.farmerId) {
      toast.error("Please select a customer");
      return;
    }

    const invalidItem = formData.products.some((item) => {
      const product = productsList.find((entry) => entry._id === item.product);
      const line = calculateLine(item, product, formData.rateType, gstEnabled);
      return (
        !item.product ||
        line.length <= 0 ||
        line.width <= 0 ||
        line.quantity <= 0 ||
        line.rate <= 0
      );
    });

    if (invalidItem) {
      toast.error("Select product and enter valid size, quantity, and rate");
      return;
    }

    try {
      setLoading(true);
      await API.put(`/invoices/${id}`, {
        farmerId: formData.farmerId,
        billingType: formData.billingType,
        rateType: formData.rateType,
        invoiceDate: formData.invoiceDate,
        documentType,
        products: formData.products.map((item) => ({
          product: item.product,
          length: Number(item.length),
          width: Number(item.width),
          quantity: Number(item.quantity),
          selectedRate: Number(item.selectedRate),
          gstRate: gstEnabled ? Number(item.gstRate) : 0,
        })),
      });

      toast.success(`${gstEnabled ? "GST Invoice" : "Order"} updated`);
      navigate(`/invoices/print/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getDataAndInvoice = async () => {
      try {
        setPageLoading(true);
        const [customerRes, productRes, invoiceRes] = await Promise.all([
          API.get("/farmers"),
          API.get("/products"),
          API.get(`/invoices/${id}`),
        ]);

        const invoiceData = invoiceRes.data.invoice;
        setCustomers(customerRes.data.farmers || []);
        setProductsList(productRes.data.products || []);

        if (invoiceData) {
          const nextDocumentType =
            invoiceData.documentType ||
            (invoiceData.gstEnabled ? "gst_invoice" : "order");

          setDocumentType(nextDocumentType);
          setFormData({
            farmerId: invoiceData.farmer?._id || invoiceData.farmer,
            rateType: invoiceData.rateType || "Rate A",
            invoiceDate: invoiceData.createdAt
              ? invoiceData.createdAt.slice(0, 10)
              : today,
            billingType: invoiceData.billingType || "credit",
            products:
              invoiceData.products?.map((item) => ({
                product: item.product?._id || item.product,
                length: item.length || "",
                width: item.width || "",
                quantity: item.quantity || 1,
                selectedRate: item.selectedRate || "",
                gstRate: item.gstRate || "",
              })) || [{ ...emptyItem }],
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load invoice edit data");
      } finally {
        setPageLoading(false);
      }
    };

    getDataAndInvoice();
  }, [id]);

  if (pageLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl bg-white px-8 py-6 text-sm font-bold text-slate-600 shadow-sm">
          Loading edit form...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to={`/invoices/print/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Invoice
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Edit {gstEnabled ? "GST Invoice" : "Order"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Add, delete, or update invoice items. Totals and customer balance will be recalculated after saving.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Receipt size={20} className="text-blue-600" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Grand Total
            </p>
            <p className="text-lg font-black text-slate-950">
              Rs {summary.grandTotal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
            Bill Type
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDocumentType("gst_invoice")}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-sm font-black transition ${
                gstEnabled
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              <FileCheck size={20} />
              GST Invoice
            </button>
            <button
              type="button"
              onClick={() => setDocumentType("order")}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-sm font-black transition ${
                !gstEnabled
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"
              }`}
            >
              <FileText size={20} />
              Non-GST Order
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-600">
                Customer
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={formData.farmerId}
                  onChange={(event) => handleCustomerChange(event.target.value)}
                  className="input-field pl-10"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.village}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-600">
                Payment
              </label>
              <select
                value={formData.billingType}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingType: event.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="credit">Credit</option>
                <option value="cash">Cash</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-600">
                Date
              </label>
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      invoiceDate: event.target.value,
                    }))
                  }
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-600">
              Rate Type
            </p>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {RATE_TYPES.map((rateType) => (
                <button
                  type="button"
                  key={rateType}
                  onClick={() => handleRateTypeChange(rateType)}
                  className={`rounded-2xl border px-3 py-3 text-xs font-black transition ${
                    formData.rateType === rateType
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {rateType}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Items</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Size in feet, quantity in pieces. Amount updates automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={addProductRow}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.products.map((item, index) => {
              const product = productsList.find((entry) => entry._id === item.product);
              const line = calculateLine(item, product, formData.rateType, gstEnabled);

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-600">
                        Product
                      </label>
                      <select
                        value={item.product}
                        onChange={(event) =>
                          handleProductChange(index, "product", event.target.value)
                        }
                        className="input-field bg-white"
                        required
                      >
                        <option value="">Select Product</option>
                        {productsList.map((productItem) => (
                          <option key={productItem._id} value={productItem._id}>
                            {productItem.productName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <NumberField
                      label="Length"
                      value={item.length}
                      onChange={(value) => handleProductChange(index, "length", value)}
                    />
                    <NumberField
                      label="Width"
                      value={item.width}
                      onChange={(value) => handleProductChange(index, "width", value)}
                    />
                    <NumberField
                      label="Qty"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(value) => handleProductChange(index, "quantity", value)}
                    />

                    <div className="flex items-end justify-end lg:col-span-2">
                      <button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        disabled={formData.products.length === 1}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 ${
                      gstEnabled ? "sm:grid-cols-5" : "sm:grid-cols-4"
                    }`}
                  >
                    <Stat label="Sq Ft" value={line.sqFt.toLocaleString("en-IN")} icon />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Rate / Sq Ft
                      </p>
                      <div className="relative mt-1">
                        <IndianRupee
                          size={14}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.selectedRate}
                          onChange={(event) =>
                            handleProductChange(index, "selectedRate", event.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {gstEnabled && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          GST %
                        </p>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.gstRate}
                          onChange={(event) =>
                            handleProductChange(index, "gstRate", event.target.value)
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    <Stat label="Amount" value={`Rs ${line.baseAmount.toLocaleString("en-IN")}`} />
                    <Stat label="Line Total" value={`Rs ${line.lineTotal.toLocaleString("en-IN")}`} highlight />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="text-sm font-semibold text-slate-600">
            Subtotal Rs {summary.subTotal.toLocaleString("en-IN")}
            {gstEnabled && (
              <span className="ml-2">
                + GST Rs {summary.totalGST.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || summary.grandTotal <= 0}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
              gstEnabled
                ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                : "bg-orange-500 shadow-orange-200 hover:bg-orange-600"
            }`}
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </section>
      </form>
    </div>
  );
};

const NumberField = ({ label, value, onChange, min = "0", step = "0.01" }) => (
  <div className="lg:col-span-2">
    <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-600">
      {label}
    </label>
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="input-field bg-white"
      required
    />
  </div>
);

const Stat = ({ label, value, highlight = false, icon = false }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label}
    </p>
    <p
      className={`mt-2 flex items-center gap-1 text-sm font-black ${
        highlight ? "text-blue-700" : "text-slate-950"
      }`}
    >
      {icon && <Ruler size={14} className="text-blue-600" />}
      {value}
    </p>
  </div>
);

export default EditInvoice;
