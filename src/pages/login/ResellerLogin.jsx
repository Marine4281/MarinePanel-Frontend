// src/pages/login/ResellerLogin.jsx
// Shown only on reseller domains (domainType === "reseller")
// Dark premium glass UI. No child panel / reseller panel copy.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useReseller } from "../../context/ResellerContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);
const IconZap = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconSupport = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const PAYMENT_METHODS = [
  "M-Pesa", "MTN MoMo", "Airtel Money",
  "Crypto", "Visa / Mastercard",
  "PayPal", "Stripe", "Payeer", "PerfectMoney",
];

export default function ResellerLogin() {
  const { login }                     = useAuth();
  const navigate                      = useNavigate();
  const { reseller, loading }         = useReseller();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  const brandName = reseller?.brandName  || "Panel";
  const logo      = reseller?.logo       || null;
  const tc        = reseller?.themeColor || "#f97316";

  // Skeleton while branding resolves
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="animate-pulse w-full max-w-md p-8 rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="h-10 w-10 rounded-xl bg-white/10 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded-xl mb-2 mx-10" />
          <div className="h-4 bg-white/5 rounded-xl mb-6 mx-16" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-white/10 rounded-xl mb-3" />)}
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      toast.success("Login successful!");
      if (res.data.isAdmin)      navigate("/admin");
      else if (res.data.isChildPanel) navigate("/child-panel/dashboard");
      else                        navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email first");
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f172a 55%, #0a0a0f 100%)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-52 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.08] blur-3xl" style={{ background: tc }} />
        <div className="absolute -bottom-52 -right-32 w-[520px] h-[520px] rounded-full opacity-[0.05] blur-3xl" style={{ background: "#6366f1" }} />
      </div>

      <div className="relative w-full max-w-[420px]">

        {/* Brand header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {logo ? (
            <img src={logo} alt="logo" className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}99)` }}
            >
              {brandName[0]}
            </div>
          )}
          <span className="text-xl font-bold text-white">{brandName}</span>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `0 0 80px ${tc}14, 0 32px 64px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Sign in to your {brandName} account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <IconMail />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                  onFocus={(e) => (e.target.style.borderColor = tc)}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <IconLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                  onFocus={(e) => (e.target.style.borderColor = tc)}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseOut={(e)  => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs hover:underline"
                style={{ color: tc, opacity: 0.8 }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${tc} 0%, ${tc}cc 100%)`,
                color: "#fff",
                boxShadow: `0 4px 24px ${tc}40`,
              }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-5 mt-6">
          {[
            { icon: <IconZap />,     label: "Instant Delivery" },
            { icon: <IconShield />,  label: "Secure" },
            { icon: <IconSupport />, label: "24/7 Support" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-5">
          <p className="text-center text-xs mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>
            Accepted payment methods
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m}
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} {brandName} · All rights reserved
        </p>
      </div>
    </div>
  );
    }
