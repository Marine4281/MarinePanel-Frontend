// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { reseller, loading: resellerLoading } = useReseller();
  const { childPanel, loading: cpLoading } = useChildPanel();
  const { domainType } = useCachedServices();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // ======================= LOADING =======================
  const isLoading =
    domainType === "childPanel" ? cpLoading
    : domainType === "reseller" ? resellerLoading
    : false;

  // ======================= SUBMIT =======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      toast.success("Login successful!");

      if (res.data.isAdmin) {
        navigate("/admin");
      } else if (res.data.isChildPanel) {
        // Child panel owner logging into their own panel
        navigate("/child-panel/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email first");
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset link"
      );
    }
  };

  // ======================= SKELETON =======================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse w-full max-w-md p-6 bg-white rounded-2xl shadow">
          <div className="h-8 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-6 bg-gray-200 rounded mb-2" />
        </div>
      </div>
    );
  }

  // ======================= CHILD PANEL LOGIN PAGE =======================
  // Attractive full-screen branded login for child panel domains.
  // The child panel owner can later pick a style from Settings.

  if (domainType === "childPanel") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${branding.themeColor}ee 0%, ${branding.themeColor}99 50%, #0f172a 100%)`,
        }}
      >
        {/* Top brand bar */}
        <div className="flex items-center justify-center pt-10 pb-6 gap-3">
          {branding.logo && (
            <img
              src={branding.logo}
              alt="logo"
              className="h-12 w-12 rounded-xl object-contain bg-white/20 p-1"
            />
          )}
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {branding.brandName}
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-center text-white/70 text-sm mb-8">
          Your trusted SMM panel — fast, secure, and reliable
        </p>

        {/* Login card */}
        <div className="flex-1 flex items-start justify-center px-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white text-center mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/30 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/30 text-white placeholder-white/40 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-white/60 text-xs hover:text-white hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02] active:scale-100"
                style={{
                  backgroundColor: "white",
                  color: branding.themeColor,
                }}
              >
                Sign In
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-white/60 text-sm mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-white font-semibold hover:underline"
              >
                Register
              </Link>
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["⚡ Fast Delivery", "🔒 Secure", "💬 24/7 Support"].map(
                (f) => (
                  <span
                    key={f}
                    className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full"
                  >
                    {f}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs py-6">
          © {new Date().getFullYear()} {branding.brandName}. All rights reserved.
        </p>
      </div>
    );
  }

  // ======================= DEFAULT LOGIN (MAIN + RESELLER) =======================

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{ color: branding.themeColor }}
    >
      <form
        className="w-full max-w-md p-6 bg-white rounded-2xl shadow"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-center mb-6">
          {branding.logo && (
            <img src={branding.logo} alt="Logo" className="h-10 mr-3" />
          )}
          <h2 className="text-2xl font-bold text-center">
            {branding.brandName} Login
          </h2>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl"
          required
        />

        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="text-right mb-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 text-sm hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full text-white p-3 rounded-xl hover:opacity-90 hover:scale-105 mb-4"
          style={{ backgroundColor: branding.themeColor }}
        >
          Login
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: branding.themeColor }}
            className="font-semibold"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
