import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, Leaf } from "lucide-react";

// ✅ Yahan apni license keys daalo — client ko ek key dena
const VALID_LICENSE_KEYS = [
  "AGRO-2024-XXXX-PREMIUM",
  "AGRO-2024-YYYY-PREMIUM",
  "AGRO-2025-ZZZZ-BASIC",
];

const LICENSE_STORAGE_KEY = "agroshop_license";

const LicenseKey = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const trimmedKey = key.trim().toUpperCase();

      if (VALID_LICENSE_KEYS.includes(trimmedKey)) {
        localStorage.setItem(LICENSE_STORAGE_KEY, trimmedKey);
        navigate("/dashboard");
      } else {
        setError("❌ Invalid license key. Please contact your vendor.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-400 opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-3xl shadow-2xl shadow-green-900 mb-4">
            <Leaf size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            AgroShop
          </h1>
          <p className="text-green-300 font-semibold mt-1 text-sm">
            Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-green-300" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Software Activation</h2>
              <p className="text-green-300 text-xs font-semibold">
                Enter your license key to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleActivate} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-green-300 mb-2">
                License Key
              </label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400"
                />
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="AGRO-XXXX-XXXX-XXXX"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/30 font-bold text-sm outline-none focus:border-green-400 focus:bg-white/15 transition uppercase tracking-wider"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-2xl px-4 py-3">
                <p className="text-red-300 text-sm font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-900 text-sm tracking-wide"
            >
              {loading ? "Verifying..." : "🔓 Activate Software"}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs font-semibold mt-6">
            Contact your vendor if you lost your license key
          </p>
        </div>

        <p className="text-center text-green-500/50 text-xs font-semibold mt-6">
          AgroShop v1.0 • Offline Edition
        </p>
      </div>
    </div>
  );
};

export default LicenseKey;
