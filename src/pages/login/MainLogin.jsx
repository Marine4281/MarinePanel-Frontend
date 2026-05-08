// src/pages/login/MainLogin.jsx
// Shown on the main platform (domainType === "main")
// Premium professional login UI — stronger visual presence + bold branded colors

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const BRAND_COLOR = "#f97316"; // strong orange
const BRAND_DARK = "#ea580c";
const BRAND_LIGHT = "#fff7ed";

const IconEye = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const FEATURES = [
  {
    emoji: "⚡",
    title: "Instant Delivery",
    desc: "Orders processed automatically within seconds, 24/7.",
  },
  {
    emoji: "💰",
    title: "Best Market Pricing",
    desc: "Industry-low pricing with reseller-level profit margins.",
  },
  {
    emoji: "🔒",
    title: "Enterprise Security",
    desc: "Secure payment flow and protected account infrastructure.",
  },
  {
    emoji: "🌍",
    title: "Global Payment Support",
    desc: "Cards, Crypto, M-Pesa, MoMo, Airtel Money and more.",
  },
];

export default function MainLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      login(res.data);
      toast.success("Login successful!");

      if (res.data.isAdmin) {
        navigate("/admin");
      } else if (res.data.isChildPanel) {
        navigate("/child-panel/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.error("Please enter your email first");
    }

    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send reset link"
      );
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, #fff7ed 0%, #ffffff 35%, #fff 100%)",
      }}
    >
      {/* ================= LEFT SIDE ================= */}
      <div
        className="hidden lg:flex w-[54%] relative overflow-hidden px-16 py-14 flex-col justify-between"
        style={{
          background: `linear-gradient(145deg, ${BRAND_COLOR} 0%, ${BRAND_DARK} 100%)`,
        }}
      >
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-black/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center font-black text-lg text-orange-600 shadow-lg">
            M
          </div>

          <div>
            <p className="text-white font-bold text-lg">MarinePanel</p>
            <p className="text-orange-100 text-xs">
              Premium SMM Management Platform
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-semibold text-orange-100 uppercase tracking-[0.2em] mb-4">
            Trusted By Resellers Worldwide
          </p>

          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Scale Your
            <br />
            Digital Business
            <br />
            With Confidence
          </h1>

          <p className="text-orange-50/90 text-base leading-relaxed mb-10">
            Access the fastest, cheapest and most reliable SMM services with
            full reseller infrastructure, child panels, API support and
            automated order management.
          </p>

          <div className="grid gap-4">
            {FEATURES.map((item) => (
              <div
                key={item.title}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex gap-4"
              >
                <div className="text-2xl">{item.emoji}</div>

                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-orange-100 mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-orange-100">
          Thousands of successful resellers • Instant activation • 24/7 support
        </p>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[430px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_DARK})`,
              }}
            >
              M
            </div>

            <div>
              <p className="font-bold text-gray-900">MarinePanel</p>
              <p className="text-xs text-gray-500">
                Premium SMM Platform
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-[28px] border border-orange-100 shadow-2xl shadow-orange-100/50 p-8">
            <div className="mb-8">
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: BRAND_COLOR }}
              >
                Welcome Back
              </p>

              <h2 className="text-3xl font-black text-gray-900 mb-2">
                Sign In
              </h2>

              <p className="text-sm text-gray-500">
                Access your dashboard and manage your platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[54px] px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = BRAND_COLOR;
                    e.target.style.background = "#fff";
                    e.target.style.boxShadow = `0 0 0 4px ${BRAND_COLOR}18`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.background = "#f9fafb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[54px] px-4 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 outline-none transition-all"
                    onFocus={(e) => {
                      e.target.style.borderColor = BRAND_COLOR;
                      e.target.style.background = "#fff";
                      e.target.style.boxShadow = `0 0 0 4px ${BRAND_COLOR}18`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.background = "#f9fafb";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
                  className="text-sm font-semibold hover:underline"
                  style={{ color: BRAND_COLOR }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-[56px] rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_DARK})`,
                  boxShadow: `0 10px 30px ${BRAND_COLOR}35`,
                }}
              >
                {submitting ? "Signing In..." : "Sign In To Dashboard"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Register */}
            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold hover:underline"
                style={{ color: BRAND_COLOR }}
              >
                Create One Free
              </Link>
            </p>
          </div>

          {/* Payment Methods */}
          <div className="mt-7 text-center">
            <p className="text-xs text-gray-500 mb-3 font-medium">
              Accepted Payment Methods
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                "M-Pesa",
                "MTN MoMo",
                "Airtel Money",
                "Crypto",
                "Visa / MC",
                "PayPal",
                "Stripe",
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-white border border-orange-100 text-xs text-gray-600 font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} MarinePanel • All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
    }
