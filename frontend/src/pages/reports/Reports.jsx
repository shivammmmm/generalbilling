import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  IndianRupee,
  Package,
  Receipt,
  Users,
} from "lucide-react";
import API from "../../services/api";
import { formatCurrency } from "../../utils/billing";

const Reports = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [invoiceRes, customerRes, productRes] = await Promise.all([
          API.get("/invoices"),
          API.get("/farmers"),
          API.get("/products"),
        ]);

        setInvoices(invoiceRes.data.invoices || []);
        setCustomers(customerRes.data.farmers || []);
        setProducts(productRes.data.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const report = useMemo(() => {
    const revenue = invoices.reduce(
      (total, invoice) => total + Number(invoice.grandTotal || 0),
      0
    );
    const gst = invoices.reduce(
      (total, invoice) => total + Number(invoice.totalGST || 0),
      0
    );
    const outstanding = customers.reduce(
      (total, customer) => total + Number(customer.dueAmount || 0),
      0
    );
    const areas = Array.from(
      customers.reduce((map, customer) => {
        const area = customer.village || "Unassigned";
        const current = map.get(area) || { area, customers: 0, outstanding: 0 };
        current.customers += 1;
        current.outstanding += Number(customer.dueAmount || 0);
        map.set(area, current);
        return map;
      }, new Map()).values()
    );

    return {
      revenue,
      gst,
      outstanding,
      invoiceCount: invoices.length,
      areas,
    };
  }, [customers, invoices]);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center text-sm font-bold text-slate-500 shadow-sm">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
          Reports
        </p>
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
          Business Reports
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
          Review invoice totals, outstanding payments, products, and customer
          areas.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {[
          {
            label: "Total Sales",
            value: formatCurrency(report.revenue),
            icon: <IndianRupee size={22} />,
          },
          {
            label: "GST Total",
            value: formatCurrency(report.gst),
            icon: <Receipt size={22} />,
          },
          {
            label: "Invoices",
            value: report.invoiceCount,
            icon: <BarChart3 size={22} />,
          },
          {
            label: "Outstanding",
            value: formatCurrency(report.outstanding),
            icon: <Users size={22} />,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              {card.icon}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-black text-slate-950">
              Product Rates
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Product", "Rate A", "Rate B", "Rate C", "GST"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 8).map((product) => (
                  <tr key={product._id}>
                    <td className="px-5 py-4 font-bold capitalize text-slate-900">
                      {product.productName}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {formatCurrency(product.cashRate)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {formatCurrency(product.creditRate)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {formatCurrency(product.wholesaleRate)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {product.gstRate || 0}%
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
              <Package size={20} className="text-blue-600" />
              Customer Areas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Area", "Customers", "Outstanding"].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.areas.map((area) => (
                  <tr key={area.area}>
                    <td className="px-5 py-4 font-bold capitalize text-slate-900">
                      {area.area}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {area.customers}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {formatCurrency(area.outstanding)}
                    </td>
                  </tr>
                ))}
                {report.areas.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      No customer areas found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
