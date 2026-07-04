import { useEffect, useState } from "react";
import {
  FileText,
  IndianRupee,
  Layers,
  Package,
  Percent,
  Save,
  Tag,
} from "lucide-react";

const ProductForm = ({ initialData = {}, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    unit: "Sq Ft",
    gstRate: "0",
    cashRate: "",
    creditRate: "",
    wholesaleRate: "",
    description: "",
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        productName: initialData.productName || "",
        category: initialData.category || "",
        unit: initialData.unit || "Sq Ft",
        gstRate: initialData.gstRate ?? "0",
        cashRate: initialData.cashRate ?? "",
        creditRate: initialData.creditRate ?? "",
        wholesaleRate: initialData.wholesaleRate ?? "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const labelClasses =
    "mb-2 block text-xs font-black uppercase tracking-widest text-slate-600";
  const FieldIcon = ({ icon }) => (
    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {icon}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Product Details
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Add the product and its per sq ft rates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className={labelClasses}>Product Name</label>
            <div className="relative">
              <FieldIcon icon={<Package size={18} />} />
              <input
                type="text"
                name="productName"
                placeholder="Flex Banner"
                value={formData.productName}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Category</label>
            <div className="relative">
              <FieldIcon icon={<Tag size={18} />} />
              <input
                type="text"
                name="category"
                placeholder="Flex, vinyl, board"
                value={formData.category}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Unit</label>
            <div className="relative">
              <FieldIcon icon={<Layers size={18} />} />
              <input
                type="text"
                name="unit"
                placeholder="Sq Ft"
                value={formData.unit}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>

        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <IndianRupee size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Pricing</h2>
            <p className="text-sm font-medium text-slate-500">
              Rate A, Rate B, and Rate C are all per sq ft.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClasses}>Rate A / Sq Ft</label>
            <div className="relative">
              <FieldIcon icon={<IndianRupee size={18} />} />
              <input
                type="number"
                min="0"
                step="0.01"
                name="cashRate"
                placeholder="12"
                value={formData.cashRate}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Rate B / Sq Ft</label>
            <div className="relative">
              <FieldIcon icon={<IndianRupee size={18} />} />
              <input
                type="number"
                min="0"
                step="0.01"
                name="creditRate"
                placeholder="10"
                value={formData.creditRate}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Rate C / Sq Ft</label>
            <div className="relative">
              <FieldIcon icon={<IndianRupee size={18} />} />
              <input
                type="number"
                min="0"
                step="0.01"
                name="wholesaleRate"
                placeholder="8"
                value={formData.wholesaleRate}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>GST %</label>
            <div className="relative">
              <FieldIcon icon={<Percent size={18} />} />
              <input
                type="number"
                min="0"
                step="0.01"
                name="gstRate"
                placeholder="18"
                value={formData.gstRate}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <label className={labelClasses}>Description</label>
        <div className="relative">
          <FileText
            className="absolute left-3 top-4 text-slate-400"
            size={18}
          />
          <textarea
            name="description"
            placeholder="Optional product notes"
            value={formData.description}
            onChange={handleChange}
            className="input-field min-h-28 resize-none pl-10"
          />
        </div>
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
