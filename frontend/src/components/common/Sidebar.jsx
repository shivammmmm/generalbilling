import {
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShoppingBag,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={21} /> },
  { name: "Customers", path: "/farmers", icon: <Users size={21} /> },
  { name: "Products", path: "/products", icon: <Boxes size={21} /> },
  { name: "Categories", path: "/categories", icon: <FolderTree size={21} /> },
  { name: "Orders", path: "/billing", icon: <ShoppingBag size={21} /> },
  { name: "Invoices", path: "/invoices", icon: <Receipt size={21} /> },
  { name: "Payments", path: "/transactions", icon: <CreditCard size={21} /> },
  { name: "Reports", path: "/reports", icon: <BarChart3 size={21} /> },
  { name: "Users", path: "/users", icon: <UserCog size={21} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={21} /> },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:w-[280px] md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <FileText size={23} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950">
              FlexBill
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Per Sq Ft
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
