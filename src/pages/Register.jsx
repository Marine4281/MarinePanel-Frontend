// src/pages/Register.jsx

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

const Register = () => {
  const { login } = useAuth();
  const { reseller, loading: resellerLoading } = useReseller();
  const { childPanel, loading: cpLoading } = useChildPanel();
  const { domainType } = useCachedServices();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState({ name: "United States", code: "US" });
  const [phoneCountry, setPhoneCountry] = useState("us");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ======================= RESELLER DOMAIN — HARD REDIRECT =======================
  // Users who arrive on a reseller domain go straight to login.
  // No register form, no fallback — period.
  // We wait until domainType has resolved (not undefined) before redirecting
  // so we don't fire a premature redirect during the initial load.
  if (domainType === "reseller") {
    return <Navigate to="/login" replace />;
  }

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
    : false;

  // ======================= SUBMIT =======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !phone || !password || !confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register", {
        email,
        phone,
        country: country.name,
        countryCode: country.code,
        password,
      });

      toast.success("Registration successful!");
      login(res.data);
    } catch (err) {
      console.error("Registration error:", err.response || err);
      toast.error(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-white/10 rounded-xl mb-3" />
          ))}
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  // ======================= CHILD PANEL REGISTER =======================
  if (domainType === "childPanel") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${branding.themeColor}ee 0%, ${branding.themeColor}99 50%, #0f172a 100%)`,
        }}
      >
        {/* Top brand bar */}
        <div className="flex items-center justify-center pt-10 pb-4 gap-3">
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

        <p className="text-center text-white/70 text-sm mb-6">
          Create your account to get started
        </p>

        {/* Register card */}
        <div className="flex-1 flex items-start justify-center px-4 pb-10">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white text-center mb-6">
              Create Account
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

              {/* Phone */}
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1">
                  Phone
                </label>
                <PhoneInput
                  country={phoneCountry}
                  value={phone}
                  enableSearch
                  searchPlaceholder="Search country..."
                  disableCountryGuess={true}
                  countryCodeEditable={false}
                  preferredCountries={["ke", "us", "gb"]}
                  onChange={(value, data) => {
                    setPhone(value);
                    const iso2 = (data?.countryCode || "us").toLowerCase().trim();
                    setPhoneCountry(iso2);
                    setCountry({
                      name: data?.name || "",
                      code: iso2.toUpperCase(),
                    });
                  }}
                  containerClass="w-full"
                  inputClass="!w-full !pl-14 !pr-3 !py-3 !rounded-xl !border !border-white/30 !bg-white/10 !text-white !text-sm"
                  buttonClass="!border !border-white/30 !rounded-l-xl !px-2 !bg-white/10"
                  dropdownClass="!rounded-xl !shadow-lg"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/30 text-white placeholder-white/40 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs hover:text-white"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <p className="text-white/40 text-xs text-center leading-relaxed">
                By registering you accept our{" "}
                <Link
                  to="/terms-public"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 underline underline-offset-2 hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: "white", color: branding.themeColor }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-white/60 text-sm mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-white font-semibold hover:underline">
                Sign In
              </Link>
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["⚡ Fast Delivery", "🔒 Secure", "💬 24/7 Support"].map((f) => (
                <span
                  key={f}
                  className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs py-4">
          © {new Date().getFullYear()} {branding.brandName}. All rights reserved.
        </p>
      </div>
    );
  }

  // ======================= MAIN PLATFORM REGISTER =======================
  // Dark premium layout matching the Login redesign.

  const tc = branding.themeColor;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)" }}
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-60 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl"
          style={{ background: tc }}
        />
        <div
          className="absolute -bottom-60 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "#6366f1" }}
        />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-7">
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
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `0 0 80px ${tc}14, 0 32px 64px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Join {branding.brandName} and start growing today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                }}
                onFocus={(e) => (e.target.style.borderColor = tc)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Phone Number
              </label>
              <PhoneInput
                country={phoneCountry}
                value={phone}
                enableSearch
                searchPlaceholder="Search country..."
                disableCountryGuess={true}
                countryCodeEditable={false}
                preferredCountries={["ke", "us", "gb"]}
                onChange={(value, data) => {
                  setPhone(value);
                  const iso2 = (data?.countryCode || "us").toLowerCase().trim();
                  setPhoneCountry(iso2);
                  setCountry({ name: data?.name || "", code: iso2.toUpperCase() });
                }}
                containerClass="w-full"
                inputClass="!w-full !pl-14 !pr-3 !py-3 !rounded-xl !text-sm !outline-none"
                buttonClass="!rounded-l-xl !px-2"
                dropdownClass="!rounded-xl !shadow-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-16 rounded-xl text-sm outline-none transition-all"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-16 rounded-xl text-sm outline-none transition-all"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onClick={() => setShowConfirm((s) => !s)}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
              By registering you accept our{" "}
              <Link
                to="/terms-public"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-100"
                style={{ color: tc, opacity: 0.8 }}
              >
                Terms & Conditions
              </Link>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${tc} 0%, ${tc}cc 100%)`,
                color: "#fff",
                boxShadow: `0 4px 24px ${tc}40`,
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Login link */}
          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: tc }}
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} {branding.brandName} · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Register;
