import { Bell, Search, User, ChevronDown } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="glass-panel px-4 py-4 sm:px-6 sm:py-5 rounded-[2rem] flex flex-col gap-4 md:flex-row md:justify-between md:items-center shadow-premium sticky top-6 z-40">
      <div className="w-full md:w-auto">
        <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-2xl w-full max-w-lg group focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
          <Search size={18} className="text-slate-600 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search customers, products, invoices..." 
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 w-full md:w-auto">
        <button className="self-start md:self-center relative p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-0 md:pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 tracking-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Admin</p>
          </div>
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm group-hover:shadow-md transition-all">
              {user?.name?.charAt(0) || <User size={20} />}
            </div>

            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
