import { ShieldCheck, UserCog } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Users = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
          Users
        </p>
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
          User Access
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
          Manage who can access the billing software.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <UserCog size={22} />
        </div>
        <h2 className="text-xl font-black text-slate-950">
          {user?.name || "Admin User"}
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {user?.email || "Signed-in account"}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
          <ShieldCheck size={16} />
          Active
        </div>
      </div>
    </div>
  );
};

export default Users;
