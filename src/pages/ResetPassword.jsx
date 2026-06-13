// src/pages/ResetPassword.jsx
// Brand-aware reset password page — opened from email link.

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../api/axios";
import { useCachedServices } from "../context/CachedServicesContext";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const { domainType }              = useCachedServices();
  const { reseller, loading: rLoading } = useReseller();
  const { childPanel, loading: cLoading } = useChildPanel();

  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [message,         setMessage]         = useState("");
  const [error,           setError]           = useState("");

  // ── Brand resolution ──────────────────────────────────────────
  let brandName = "MarinePanel";
  let logo      = null;
  let tc        = "#f97316";

  if (domainType === "reseller" && reseller) {
    brandName = reseller.brandName || "Panel";
    logo      = reseller.logo      || null;
    tc        = reseller.themeColor || "#f97316";
  } else if (domainType === "childPanel" && childPanel) {
    brandName = childPanel.brandName || "Panel";
    logo      = childPanel.logo      || null;
    tc        = childPanel.themeColor || "#1e40af";
  }

  const isPageLoading = rLoading || cLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 6)          return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived styles ────────────────────────────────────────────
  const isDark        = domainType === "reseller" || domainType === "childPanel";
  const pageBg        = isDark
    ? "linear-gradient(135deg, #0a0a0f 0%, #0f172a 55%, #0a0a0f 100%)"
    : "#f3f4f6";
  const cardBg        = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const cardBorder    = isDark ? "1px solid rgba(255,255,255,0.08)" : "none";
  const textPrimary   = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#9ca3af";
  const inputBg       = isDark ? "rgba(255,255,255,0.06)" : "#f9fafb";
  const inputBorder   = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";

  if (isPageLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0f172a" }}
      >
        <div
          className="animate-pulse w-full max-w-sm p-8 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div className="h-10 w-10 rounded-xl bg-white/10 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded-xl mb-3 mx-8" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-white/10 rounded-xl mb-3" />
          ))}
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: pageBg }}
    >
      {isDark && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.07] blur-3xl"
            style={{ background: tc }}
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
            Reset Password
          </h2>
          <p className="text-sm mb-6" style={{ color: textSecondary }}>
            Enter your new password below.
          </p>

          {message && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-sm"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
            >
              ✅ {message} Redirecting to login…
            </div>
          )}
          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-sm"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="text-sm block mb-1" style={{ color: textSecondary }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-3 pr-10 rounded-xl text-sm outline-none transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }}
                  onFocus={(e) => {
                    e.target.style.borderColor = tc;
                    e.target.style.boxShadow   = `0 0 0 3px ${tc}22`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";
                    e.target.style.boxShadow   = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: textSecondary }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm block mb-1" style={{ color: textSecondary }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 pr-10 rounded-xl text-sm outline-none transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }}
                  onFocus={(e) => {
                    e.target.style.borderColor = tc;
                    e.target.style.boxShadow   = `0 0 0 3px ${tc}22`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";
                    e.target.style.boxShadow   = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: textSecondary }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${tc} 0%, ${tc}cc 100%)`,
                color: "#fff",
                boxShadow: `0 4px 20px ${tc}40`,
              }}
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: textSecondary }}>
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
