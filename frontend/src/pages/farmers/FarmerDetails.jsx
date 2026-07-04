import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, IndianRupee, Phone, User } from "lucide-react";
import API from "../../services/api";
import { formatCurrency } from "../../utils/billing";

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const { data } = await API.get(`/transactions/ledger/${id}`);
        setCustomer(data.farmer);
        setHistory((data.ledger || []).filter((item) => item.type !== "interest"));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center font-bold text-slate-600 shadow-sm">
        Loading customer...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Link
        to="/farmers"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <User size={22} />
          </div>
          <h1 className="text-3xl font-black text-slate-950">
            {customer?.name}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Phone size={15} />
            {customer?.mobileNumber}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Area: {customer?.village}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Default Rate Type: {customer?.defaultRateType || "Rate A"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <IndianRupee size={22} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Outstanding
          </p>
          <p className="mt-2 text-3xl font-black text-blue-700">
            {formatCurrency(customer?.dueAmount)}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-black text-slate-950">
            Payment History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Type", "Amount", "Date", "Notes"].map((heading) => (
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
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-sm font-semibold text-slate-400"
                  >
                    No payment history found.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id}>
                    <td className="px-5 py-4 text-sm font-bold capitalize text-slate-800">
                      {item.type}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-slate-950">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {item.description || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CustomerDetails;
