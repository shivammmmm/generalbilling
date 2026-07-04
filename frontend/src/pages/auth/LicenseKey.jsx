import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, Zap } from "lucide-react";

// ✅ Valid license keys — client ko ek key dena
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
          >
            <Zap size={38} className="text-white" fill="white" />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Cloudify
          </h1>
          <p className="text-indigo-300 font-semibold mt-1 text-sm tracking-widest uppercase">
            General Billing Software
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <ShieldCheck size={20} className="text-indigo-300" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Software Activation</h2>
              <p className="text-indigo-300 text-xs font-semibold">
                Enter your license key to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleActivate} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">
                License Key
              </label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"
                />
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 font-bold text-sm outline-none uppercase tracking-wider transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(99,102,241,0.6)";
                    e.target.style.background = "rgba(255,255,255,0.09)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.12)";
                    e.target.style.background = "rgba(255,255,255,0.06)";
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl px-4 py-3"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <p className="text-red-300 text-sm font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="w-full text-white font-black py-4 rounded-2xl transition-all text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading || !key.trim()
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #3b82f6)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              }}
            >
              {loading ? "Verifying..." : "🔓 Activate Software"}
            </button>
          </form>

          <p className="text-center text-white/25 text-xs font-semibold mt-6">
            Contact your vendor if you lost your license key
          </p>
        </div>

        <p className="text-center text-indigo-500/50 text-xs font-semibold mt-6 tracking-widest uppercase">
          Cloudify v2.0 • General Billing Software
        </p>
      </div>
    </div>
  );
};

export default LicenseKey;
