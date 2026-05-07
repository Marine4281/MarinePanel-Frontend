// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import API from "../api/axios";
import toast from "react-hot-toast";

/* ─── tiny inline SVG icons (no extra dep needed) ─── */
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCreditCard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

/* ─── payment gateway pill logos (text-based) ─── */
const PAYMENT_GATEWAYS = ["PayPal", "Stripe", "Crypto", "Payeer", "PerfectMoney", "CoinGate"];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { reseller, loading: resellerLoading } = useReseller();
  const { childPanel, loading: cpLoading } = useChildPanel();
  const { domainType } = useCachedServices();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ======================= BRANDING =======================
  const branding =
    domainType === "childPanel" && childPanel
      ? {
          brandName: childPanel.brandName || "Panel",
          logo: childPanel.logo || null,
          themeColor: childPanel.themeColor || "#1e40af",
        }
      : reseller || {
          brandName: "MarinePanel",
          logo: null,
          themeColor: "#ff6b00",
        };

  const tc = branding.themeColor;

  // ======================= LOADING =======================
  const isLoading =
    domainType === "childPanel" ? cpLoading
    : domainType === "reseller" ? resellerLoading
    : false;

  // ======================= SUBMIT =======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      toast.success("Login successful!");
      if (res.data.isAdmin) {
        navigate("/admin");
      } else if (res.data.isChildPanel) {
        navigate("/child-panel/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email first");
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    }
  };

  // ======================= SKELETON =======================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="animate-pulse w-full max-w-md p-8 rounded-3xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-12 w-12 rounded-2xl bg-white/10 mx-auto mb-4" />
          <div className="h-7 bg-white/10 rounded-xl mb-3 mx-8" />
          <div className="h-4 bg-white/5 rounded-xl mb-6 mx-16" />
          <div className="h-12 bg-white/10 rounded-xl mb-3" />
          <div className="h-12 bg-white/10 rounded-xl mb-3" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  // ======================= CHILD PANEL LOGIN PAGE =======================
  if (domainType === "childPanel") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${tc}ee 0%, ${tc}99 50%, #0f172a 100%)`,
        }}
      >
        {/* Top brand bar */}
        <div className="flex items-center justify-center pt-10 pb-6 gap-3">
          {branding.logo && (
            <img src={branding.logo} alt="logo" className="h-12 w-12 rounded-xl object-contain bg-white/20 p-1" />
          )}
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{branding.brandName}</h1>
        </div>

        <p className="text-center text-white/70 text-sm mb-8">
          Your trusted SMM panel — fast, secure, and reliable
        </p>

        <div className="flex-1 flex items-start justify-center px-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white text-center mb-6">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/30 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/30 text-white placeholder-white/40 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-white/60 text-xs hover:text-white hover:underline">
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-60"
                style={{ backgroundColor: "white", color: tc }}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="text-center text-white/60 text-sm mt-5">
              Don't have an account?{" "}
              <Link to="/register" className="text-white font-semibold hover:underline">Register</Link>
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["⚡ Fast Delivery", "🔒 Secure", "💬 24/7 Support"].map((f) => (
                <span key={f} className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs py-6">
          © {new Date().getFullYear()} {branding.brandName}. All rights reserved.
        </p>
      </div>
    );
  }

  // ======================= MAIN / RESELLER LOGIN — REDESIGNED =======================
  // Dark, premium full-screen layout matching the Aurora template's quality level.
  // Left panel = marketing copy about reseller & child panel ecosystem.
  // Right panel = login form card with glass morphism.

  const isReseller = domainType === "reseller";

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)" }}
    >
      {/* ── Ambient glow orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-60 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: tc }}
        />
        <div
          className="absolute -bottom-60 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: "#6366f1" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-3xl"
          style={{ background: tc }}
        />
      </div>

      {/* ══════════════════════════════════════
          LEFT PANEL — marketing / feature copy
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-14 relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {branding.logo ? (
            <img src={branding.logo} alt="logo" className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}99)` }}
            >
              {branding.brandName?.[0] ?? "M"}
            </div>
          )}
          <span className="text-xl font-bold text-white">{branding.brandName}</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              The Smartest<br />
              <span style={{ color: tc }}>SMM Platform</span><br />
              for Resellers
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Power your business with a complete white-label ecosystem.
              Launch your own branded panel, manage sub-resellers, and
              deliver orders at unbeatable prices — all from one place.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-4 max-w-md">
            {/* Reseller panel */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: `${tc}30` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tc}22`, color: tc }}>
                  <IconUsers />
                </div>
                <span className="text-white font-semibold text-sm">Reseller Panel</span>
              </div>
              <p className="text-white/45 text-xs leading-relaxed">
                Get your own branded reseller panel with a custom domain,
                logo, and theme. Manage your own user base, set custom pricing,
                and grow your brand independently.
              </p>
            </div>

            {/* Child panel */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(99,102,241,0.3)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                  <IconShield />
                </div>
                <span className="text-white font-semibold text-sm">Child Panel</span>
              </div>
              <p className="text-white/45 text-xs leading-relaxed">
                Create fully isolated child panels under your account — each
                with its own domain, branding, and user management. Perfect for
                scaling your operation across multiple brands or markets.
              </p>
            </div>

            {/* Pricing */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(16,185,129,0.3)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                  <IconZap />
                </div>
                <span className="text-white font-semibold text-sm">Industry-Lowest Prices</span>
              </div>
              <p className="text-white/45 text-xs leading-relaxed">
                Access thousands of SMM services at the cheapest rates in the market.
                Bulk pricing, instant delivery, and zero hidden fees — maximise your
                profit margin on every order.
              </p>
            </div>
          </div>

          {/* Payment gateways */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <IconCreditCard />
              <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">All Payment Gateways Supported</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_GATEWAYS.map((gw) => (
                <span
                  key={gw}
                  className="text-xs px-3 py-1.5 rounded-full font-medium border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {gw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom testimonial / trust */}
        <p className="text-white/20 text-xs">
          Trusted by thousands of resellers worldwide · Instant activation · 24/7 support
        </p>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — login form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">

        {/* Mobile-only logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          {branding.logo ? (
            <img src={branding.logo} alt="logo" className="h-9 w-9 rounded-xl object-contain" />
          ) : (
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-base font-black text-white"
              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}99)` }}
            >
              {branding.brandName?.[0] ?? "M"}
            </div>
          )}
          <span className="text-lg font-bold text-white">{branding.brandName}</span>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[420px] rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `0 0 80px ${tc}14, 0 32px 64px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1">
              {isReseller ? `Welcome to ${branding.brandName}` : "Welcome back"}
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              {isReseller
                ? "Sign in to your reseller dashboard"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  <IconMail />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e8f0",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = tc)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  <IconLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e8f0",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = tc)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs hover:underline transition-opacity hover:opacity-100"
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Register */}
          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: tc }}
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Trust badges below card */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          {[
            { icon: <IconZap />, label: "Instant Delivery" },
            { icon: <IconShield />, label: "Secure & Private" },
            { icon: <IconUsers />, label: "Reseller & Child Panel" },
            { icon: <IconCreditCard />, label: "All Gateways" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <span style={{ color: "rgba(255,255,255,0.2)" }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Mobile payment gateways */}
        <div className="flex lg:hidden flex-wrap justify-center gap-2 mt-5">
          {PAYMENT_GATEWAYS.map((gw) => (
            <span
              key={gw}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {gw}
            </span>
          ))}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} {branding.brandName} · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
