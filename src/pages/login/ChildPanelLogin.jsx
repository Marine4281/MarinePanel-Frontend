// src/pages/login/ChildPanelLogin.jsx
// Shown only on child panel domains (domainType === "childPanel")
// Branded gradient card — clean and focused.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

export default function ChildPanelLogin() {
  const { login }                       = useAuth();
  const navigate                        = useNavigate();
  const { childPanel, loading }         = useChildPanel();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  const brandName = childPanel?.brandName  || "Panel";
  const logo      = childPanel?.logo       || null;
  const tc        = childPanel?.themeColor || "#1e40af";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="animate-pulse w-full max-w-sm p-8 rounded-3xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-12 w-12 rounded-2xl bg-white/10 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded-xl mb-3 mx-8" />
          <div className="h-4 bg-white/5 rounded-xl mb-6 mx-16" />
          {[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-white/10 rounded-xl mb-3" />)}
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${tc}ee 0%, ${tc}88 50%, #0f172a 100%)` }}
    >
      {/* Brand top bar */}
      <div className="flex items-center justify-center pt-12 pb-5 gap-3">
        {logo ? (
          <img src={logo} alt="logo" className="h-12 w-12 rounded-xl object-contain bg-white/20 p-1" />
        ) : (
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-white text-xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {brandName[0]}
          </div>
        )}
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">{brandName}</h1>
      </div>

      <p className="text-center text-white/65 text-sm mb-8">
        Fast, secure, and reliable SMM services
      </p>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div
          className="w-full max-w-md rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          }}
        >
          <h2 className="text-xl font-bold text-white text-center mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white/65 text-xs font-semibold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/25 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/65 text-xs font-semibold mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-white/35 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-white/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-white/55 text-xs hover:text-white hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-55 disabled:cursor-not-allowed"
              style={{ backgroundColor: "white", color: tc }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-white/55 text-sm mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-white font-semibold hover:underline">
              Register
            </Link>
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["⚡ Fast Delivery", "🔒 Secure", "💬 24/7 Support"].map((f) => (
              <span key={f} className="text-xs bg-white/10 text-white/65 px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-white/25 text-xs pb-6">
        © {new Date().getFullYear()} {brandName}. All rights reserved.
      </p>
    </div>
  );
            }
