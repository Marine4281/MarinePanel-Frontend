// src/pages/login/MainLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const BRAND = "#f97316";

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

const STATS = [
  { value: "500K+", label: "Orders Delivered" },
  { value: "12K+",  label: "Active Resellers" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7",  label: "Live Support" },
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Instant Delivery",
    desc: "Orders processed in seconds, around the clock.",
    color: "#f97316",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: "Cheapest Rates",
    desc: "Industry-low pricing with automatic bulk discounts.",
    color: "#22c55e",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Bank-Grade Security",
    desc: "End-to-end encryption. Your data stays private.",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Global Payments",
    desc: "M-Pesa, MTN MoMo, Cards, Crypto & 20+ more.",
    color: "#f59e0b",
  },
];

export default function MainLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      toast.success("Login successful!");
      if (res.data.isAdmin)           navigate("/admin");
      else if (res.data.isChildPanel) navigate("/child-panel/dashboard");
      else                            navigate("/home");
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
    <div className="min-h-screen flex" style={{ background: "#060a12" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[54%] relative overflow-hidden px-14 py-12">

        {/* Dark layered background */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, #0f1623 0%, #0a0f1a 50%, #0d1420 100%)"
        }}/>

        {/* Glowing orbs */}
        <div className="absolute top-[-80px] left-[-60px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)" }}/>
        <div className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}/>
        <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)" }}/>

        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}/>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #fb923c)`, boxShadow: `0 4px 20px ${BRAND}50` }}
          >
            M
          </div>
          <span className="text-white text-lg font-bold tracking-tight">MarinePanel</span>
          <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ color: BRAND, borderColor: `${BRAND}50`, background: `${BRAND}15` }}>
            PRO
          </span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-10">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ borderColor: `${BRAND}40`, background: `${BRAND}12` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BRAND }}/>
              <span className="text-xs font-semibold" style={{ color: BRAND }}>
                #1 SMM Panel in Africa & Beyond
              </span>
            </div>

            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Scale Your<br />
              <span style={{
                background: `linear-gradient(90deg, ${BRAND}, #fb923c, #fbbf24)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Social Media
              </span><br />
              <span className="text-white">Business.</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              The fastest, cheapest, and most reliable SMM platform — built for
              resellers, agencies, and panels who demand results.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {FEATURES.map(({ icon, title, desc, color }) => (
              <div key={title}
                className="group flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-default"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.background  = `${color}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background  = "rgba(255,255,255,0.03)";
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}20`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 pt-2">
            {STATS.map(({ value, label }, i) => (
              <div key={label} className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
                {i < STATS.length - 1 && (
                  <div className="w-px h-8 bg-gray-700/60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} MarinePanel · Enterprise SMM Infrastructure
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ background: "#080d16" }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${BRAND}12 0%, transparent 70%)` }}/>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #fb923c)`, boxShadow: `0 4px 20px ${BRAND}50` }}
          >
            M
          </div>
          <span className="text-white text-lg font-bold">MarinePanel</span>
        </div>

        {/* Card */}
        <div
          className="relative w-full max-w-[420px] rounded-3xl p-8 z-10"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Card glow */}
          <div className="absolute -top-px left-8 right-8 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${BRAND}60, transparent)` }}/>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
              style={{ background: `${BRAND}18`, color: BRAND, border: `1px solid ${BRAND}35` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND }}/>
              Secure Login
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to access your dashboard and services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = `${BRAND}70`;
                  e.target.style.boxShadow   = `0 0 0 3px ${BRAND}18`;
                  e.target.style.background  = "rgba(249,115,22,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.09)";
                  e.target.style.boxShadow   = "none";
                  e.target.style.background  = "rgba(255,255,255,0.05)";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: BRAND }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = `${BRAND}70`;
                    e.target.style.boxShadow   = `0 0 0 3px ${BRAND}18`;
                    e.target.style.background  = "rgba(249,115,22,0.05)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.09)";
                    e.target.style.boxShadow   = "none";
                    e.target.style.background  = "rgba(255,255,255,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="relative w-full py-4 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden mt-2"
              style={{
                background: `linear-gradient(135deg, ${BRAND} 0%, #fb923c 50%, #f97316 100%)`,
                boxShadow: `0 4px 24px ${BRAND}50, 0 1px 0 rgba(255,255,255,0.15) inset`,
              }}
            >
              {/* Shine effect */}
              <span className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)" }}/>
              <span className="relative">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign In →"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }}/>
            <span className="text-xs text-gray-600 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }}/>
          </div>

          {/* Register */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: BRAND }}>
              Create one free →
            </Link>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { icon: "🔒", label: "SSL Secured" },
              { icon: "⚡", label: "Instant Access" },
              { icon: "🛡️", label: "Privacy First" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>
                <span className="text-[11px] text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="relative z-10 mt-7 text-center">
          <p className="text-xs text-gray-600 mb-3 font-medium uppercase tracking-wider">
            Accepted Payments
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["M-Pesa", "MTN MoMo", "Airtel Money", "Crypto", "Visa/MC", "PayPal", "Stripe"].map((m) => (
              <span
                key={m}
                className="text-[11px] font-semibold px-3 py-1 rounded-full text-gray-500"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
        }
