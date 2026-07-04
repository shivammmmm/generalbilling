import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  FilePlus2,
  IndianRupee,
  Plus,
  Receipt,
  Ruler,
  Trash2,
  User,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import InvoicePreview from "../../components/billing/InvoicePreview";
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

const Billing = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [formData, setFormData] = useState({
    farmerId: "",
    rateType: "Rate A",
    invoiceDate: today,
    products: [{ ...emptyItem }],
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const [customerRes, productRes] = await Promise.all([
          API.get("/farmers"),
          API.get("/products"),
        ]);

        setCustomers(customerRes.data.farmers || []);
        setProductsList(productRes.data.products || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load billing data");
      } finally {
        setPageLoading(false);
      }
    };

    getData();
  }, []);

  const selectedCustomer = customers.find(
    (customer) => customer._id === formData.farmerId
  );

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
        withProductRate(item, nextRateType)
      ),
    }));
  };

  const handleRateTypeChange = (rateType) => {
    setFormData((prev) => ({
      ...prev,
      rateType,
      products: prev.products.map((item) => withProductRate(item, rateType)),
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.farmerId) {
      toast.error("Please select a customer");
      return;
    }

    const invalidItem = formData.products.some((item) => {
      const line = calculateLine(
        item,
        productsList.find((product) => product._id === item.product),
        formData.rateType
      );

      return !item.product || line.length <= 0 || line.width <= 0 || line.quantity <= 0;
    });

    if (invalidItem) {
      toast.error("Select a product and enter valid length, width, and quantity");
      return;
    }

    try {
      setLoading(true);
      await API.post("/invoices", {
        farmerId: formData.farmerId,
        billingType: "credit",
        rateType: formData.rateType,
        invoiceDate: formData.invoiceDate,
        gstEnabled: gstEnabled,
        products: formData.products.map((item) => ({
          product: item.product,
          length: Number(item.length),
          width: Number(item.width),
          quantity: Number(item.quantity),
          selectedRate: Number(item.selectedRate),
          gstRate: gstEnabled ? Number(item.gstRate) : 0,
        })),
      });

      toast.success("Invoice created successfully");
      navigate("/invoices");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl bg-white px-8 py-6 text-sm font-bold text-slate-600 shadow-sm">
          Loading invoice form...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
            Flex Printing Billing Software
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Create Invoice
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Every invoice item is calculated by length x width x rate per sq ft.
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 xl:col-span-7"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
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
                    onChange={(event) =>
                      handleCustomerChange(event.target.value)
                    }
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
                  Rate Type
                </label>
                <div className="grid grid-cols-3 gap-2">
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
                {selectedCustomer?.defaultRateType && (
                  <p className="text-xs font-semibold text-slate-500">
                    Customer default: {selectedCustomer.defaultRateType}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-600">
                  Invoice Date
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
                      setFormData({ ...formData, invoiceDate: event.target.value })
                    }
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* GST Toggle */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-950">GST</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {gstEnabled ? "GST included in invoice" : "No GST on this invoice"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGstEnabled((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition ${
                  gstEnabled
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {gstEnabled ? (
                  <ToggleRight size={22} className="text-green-600" />
                ) : (
                  <ToggleLeft size={22} className="text-slate-400" />
                )}
                {gstEnabled ? "GST Include" : "GST Exclude"}
              </button>
            </div>
          </section>

          {/* Invoice Items */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Invoice Items
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Enter size in feet. Sq ft and amount update automatically.
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
                const product = productsList.find(
                  (entry) => entry._id === item.product
                );
                const line = calculateLine(item, product, formData.rateType);

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

                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-600">
                          Length (ft)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.length}
                          onChange={(event) =>
                            handleProductChange(index, "length", event.target.value)
                          }
                          className="input-field bg-white"
                          required
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-600">
                          Width (ft)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.width}
                          onChange={(event) =>
                            handleProductChange(index, "width", event.target.value)
                          }
                          className="input-field bg-white"
                          required
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-600">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleProductChange(index, "quantity", event.target.value)
                          }
                          className="input-field bg-white"
                          required
                        />
                      </div>

                      <div className="flex items-end justify-end lg:col-span-2">
                        <button
                          type="button"
                          onClick={() => removeProductRow(index)}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 sm:grid-cols-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Sq Ft
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-base font-black text-slate-950">
                          <Ruler size={14} className="text-blue-600" />
                          {line.sqFt.toLocaleString("en-IN")}
                        </p>
                      </div>

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
                              handleProductChange(
                                index,
                                "selectedRate",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

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

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Amount
                        </p>
                        <p className="mt-2 text-sm font-black text-slate-950">
                          Rs {line.baseAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Line Total
                        </p>
                        <p className="mt-2 text-sm font-black text-blue-700">
                          Rs {line.lineTotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="text-sm font-semibold text-slate-600">
              Subtotal Rs {summary.subTotal.toLocaleString("en-IN")} + GST Rs{" "}
              {summary.totalGST.toLocaleString("en-IN")}
            </div>
            <button
              type="submit"
              disabled={loading || summary.grandTotal <= 0}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <FilePlus2 size={20} />
                  Create Invoice
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </section>
        </form>

        <aside className="xl:col-span-5">
          <InvoicePreview
            formData={formData}
            customers={customers}
            productsList={productsList}
            summary={summary}
          />
        </aside>
      </div>
    </div>
  );
};

export default Billing;
