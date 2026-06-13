// src/pages/ForgotPassword.jsx
// Brand-aware forgot password page.
// Works on main platform, reseller domains, and child panel domains.

import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useCachedServices } from "../context/CachedServicesContext";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";

export default function ForgotPassword() {
  const { domainType }              = useCachedServices();
  const { reseller, loading: rLoading } = useReseller();
  const { childPanel, loading: cLoading } = useChildPanel();

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null); // null | "sent" | "notFound" | "error"
  const [errMsg,  setErrMsg]  = useState("");

  // ── Brand resolution ──────────────────────────────────────────
  let brandName  = "MarinePanel";
  let logo       = null;
  let tc         = "#f97316"; // default orange

  if (domainType === "reseller" && reseller) {
    brandName = reseller.brandName || "Panel";
    logo      = reseller.logo      || null;
    tc        = reseller.themeColor || "#f97316";
  } else if (domainType === "childPanel" && childPanel) {
    brandName = childPanel.brandName || "Panel";
    logo      = childPanel.logo      || null;
    tc        = childPanel.themeColor || "#1e40af";
  }

  const isLoading = rLoading || cLoading;

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setErrMsg("");

    try {
      await API.post("/auth/forgot-password", { email });
      setStatus("sent");
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 404 && data?.notFound) {
        setStatus("notFound");
      } else {
        setStatus("error");
        setErrMsg(data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0f172a" }}
      >
        <div
          className="animate-pulse w-full max-w-sm p-8 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div className="h-12 w-12 rounded-2xl bg-white/10 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded-xl mb-3 mx-8" />
          <div className="h-4 bg-white/5 rounded-xl mb-6 mx-12" />
          <div className="h-12 bg-white/10 rounded-xl mb-3" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Derived styles ────────────────────────────────────────────
  const isDark   = domainType === "reseller" || domainType === "childPanel";
  const pageBg   = isDark
    ? "linear-gradient(135deg, #0a0a0f 0%, #0f172a 55%, #0a0a0f 100%)"
    : "#f3f4f6";
  const cardBg   = isDark
    ? "rgba(255,255,255,0.05)"
    : "#ffffff";
  const cardBorder = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "none";
  const textPrimary   = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#9ca3af";
  const inputBg       = isDark ? "rgba(255,255,255,0.06)" : "#f9fafb";
  const inputBorder   = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: pageBg }}
    >
      {/* Ambient glow for dark panels */}
      {isDark && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.07] blur-3xl"
            style={{ background: tc }}
          />
          <div
            className="absolute -bottom-40 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
            style={{ background: "#6366f1" }}
          />
        </div>
      )}

      <div className="relative w-full max-w-sm">

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
          <span className="text-xl font-bold" style={{ color: textPrimary }}>
            {brandName}
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: cardBg,
            border: cardBorder,
            backdropFilter: isDark ? "blur(32px)" : "none",
            boxShadow: isDark
              ? "0 24px 60px rgba(0,0,0,0.4)"
              : "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <h2 className="text-2xl font-bold mb-1" style={{ color: textPrimary }}>
            Forgot Password
          </h2>
          <p className="text-sm mb-6" style={{ color: textSecondary }}>
            Enter your email and we'll send you a reset link.
          </p>

          {/* ── Success ── */}
          {status === "sent" && (
            <div
              className="rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
            >
              ✅ Reset link sent! Check your inbox and follow the link to reset your password.
            </div>
          )}

          {/* ── Not found ── */}
          {status === "notFound" && (
            <div
              className="rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e" }}
            >
              ⚠️ No account found with that email on{" "}
              <strong>{brandName}</strong>. Double-check your email or{" "}
              <Link
                to="/register"
                className="underline font-semibold"
                style={{ color: tc }}
              >
                create an account
              </Link>
              .
            </div>
          )}

          {/* ── Generic error ── */}
          {status === "error" && (
            <div
              className="rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
            >
              {errMsg}
            </div>
          )}

          {/* ── Form (hide after successful send) ── */}
          {status !== "sent" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm block mb-1" style={{ color: textSecondary }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }}
                  onFocus={(e) => {
                    e.target.style.borderColor = tc;
                    e.target.style.boxShadow   = `0 0 0 3px ${tc}22`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark
                      ? "rgba(255,255,255,0.1)"
                      : "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${tc} 0%, ${tc}cc 100%)`,
                  color: "#fff",
                  boxShadow: `0 4px 20px ${tc}40`,
                }}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: textSecondary }}>
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: tc }}
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
