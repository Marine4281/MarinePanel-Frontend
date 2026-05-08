// src/pages/login/MainLogin.jsx
// Shown on the main platform (domainType === "main")
// Clean, light, modern design — welcoming and professional.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const BRAND_COLOR = "#f97316"; // main platform orange

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

const FEATURES = [
  { emoji: "⚡", title: "Instant Delivery",    desc: "Orders processed in seconds, 24/7." },
  { emoji: "💰", title: "Cheapest Prices",     desc: "Industry-low rates with bulk discounts." },
  { emoji: "🔒", title: "Secure & Private",    desc: "Your data is always safe with us." },
  { emoji: "🌍", title: "All Payment Methods", desc: "M-Pesa, MTN MoMo, Cards, Crypto & more." },
];

export default function MainLogin() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

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
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>

      {/* ── LEFT — feature showcase (desktop only) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] px-16 py-14 relative overflow-hidden"
        style={{ background: `linear-gradient(145deg, #fff7ed 0%, #fff 60%, #f0fdf4 100%)` }}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-30"
          style={{ background: `${BRAND_COLOR}22` }} />
        <div className="absolute bottom-10 -left-16 w-48 h-48 rounded-full opacity-20"
          style={{ background: "#6366f122" }} />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLOR}, #fb923c)` }}
          >
            M
          </div>
          <span className="text-lg font-bold text-gray-800">MarinePanel</span>
        </div>

        {/* Hero text */}
        <div className="space-y-8 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-snug mb-3">
              Your Complete<br />
              <span style={{ color: BRAND_COLOR }}>SMM Platform</span>
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm">
              Grow any social media account with the fastest, cheapest, and most
              reliable SMM services — plus a full reseller &amp; child panel ecosystem.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-3 max-w-sm">
            {FEATURES.map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <span className="text-xl mt-0.5">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-300 relative z-10">
          Trusted by thousands of resellers worldwide · Instant activation
        </p>
      </div>

      {/* ── RIGHT — login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLOR}, #fb923c)` }}
          >
            M
          </div>
          <span className="text-lg font-bold text-gray-800">MarinePanel</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 p-8">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-400">Welcome back! Enter your details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 outline-none transition-all focus:bg-white"
                onFocus={(e) => {
                  e.target.style.borderColor = BRAND_COLOR;
                  e.target.style.boxShadow   = `0 0 0 3px ${BRAND_COLOR}18`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow   = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 outline-none transition-all focus:bg-white"
                  onFocus={(e) => {
                    e.target.style.borderColor = BRAND_COLOR;
                    e.target.style.boxShadow   = `0 0 0 3px ${BRAND_COLOR}18`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow   = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                className="text-xs font-medium hover:underline transition-opacity hover:opacity-80"
                style={{ color: BRAND_COLOR }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #fb923c 100%)`,
                boxShadow: `0 4px 16px ${BRAND_COLOR}40`,
              }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Register */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: BRAND_COLOR }}
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Payment pills */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">Accepted payment methods</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["M-Pesa", "MTN MoMo", "Airtel Money", "Crypto", "Visa/MC", "PayPal", "Stripe"].map((m) => (
              <span
                key={m}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-400 bg-white"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center mt-5 text-xs text-gray-300">
          © {new Date().getFullYear()} MarinePanel · All rights reserved
        </p>
      </div>
    </div>
  );
        }
