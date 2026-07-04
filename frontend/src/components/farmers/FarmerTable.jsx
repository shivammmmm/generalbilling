import { Link } from "react-router-dom";
import { Edit3, Eye, IndianRupee, Phone, Trash2, User } from "lucide-react";

const CustomerTable = ({ farmers, deleteCustomer }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Customer Name",
                "Mobile",
                "Default Rate Type",
                "Outstanding",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500 ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {farmers?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <User size={42} />
                    <p className="text-sm font-bold">No customers found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              farmers?.map((farmer) => (
                <tr key={farmer._id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 font-black text-blue-700">
                        {farmer.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-950">
                          {farmer.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {farmer.village}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Phone size={14} />
                      {farmer.mobileNumber}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
                      {farmer.defaultRateType || "Rate A"}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <span className="inline-flex items-center gap-1 text-sm font-black text-slate-950">
                      <IndianRupee size={14} className="text-blue-600" />
                      {Number(farmer.dueAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/farmers/${farmer._id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/farmers/edit/${farmer._id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-600 hover:text-white"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => deleteCustomer(farmer._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
