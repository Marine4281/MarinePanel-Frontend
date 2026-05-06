// src/pages/Register.jsx

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
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
      login(res.data); // navigation handled inside login()
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-4">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // ======================= SHARED FORM FIELDS =======================
  // Used by both CP and default layouts to avoid duplication

  const FormFields = () => (
    <>
      {/* Email */}
      <div>
        <label className="block font-semibold mb-1 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-xl focus:ring-2 outline-none text-sm"
          style={{ "--tw-ring-color": branding.themeColor }}
          placeholder="Enter your email"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block font-semibold mb-1 text-sm">Phone</label>
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
          inputClass="!w-full !pl-14 !pr-3 !py-3 !rounded-xl !border !text-sm"
          buttonClass="!border !rounded-l-xl !px-2 !bg-white"
          dropdownClass="!rounded-xl !shadow-lg"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block font-semibold mb-1 text-sm">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-xl focus:ring-2 outline-none text-sm"
          placeholder="Enter password"
        />
        <button
          type="button"
          className="absolute right-3 top-10 text-xs text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label className="block font-semibold mb-1 text-sm">
          Confirm Password
        </label>
        <input
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border rounded-xl focus:ring-2 outline-none text-sm"
          placeholder="Confirm password"
        />
        <button
          type="button"
          className="absolute right-3 top-10 text-xs text-gray-500"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? "Hide" : "Show"}
        </button>
      </div>
    </>
  );

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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{
                  backgroundColor: "white",
                  color: branding.themeColor,
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-white/60 text-sm mt-5">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white font-semibold hover:underline"
              >
                Sign In
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
        <p className="text-center text-white/30 text-xs py-4">
          © {new Date().getFullYear()} {branding.brandName}. All rights reserved.
        </p>
      </div>
    );
  }

  // ======================= DEFAULT REGISTER (MAIN + RESELLER) =======================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Enter your email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold mb-1">Phone</label>
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
            inputClass="!w-full !pl-14 !pr-3 !py-3 !rounded-xl !border focus:!ring-2 focus:!ring-orange-400"
            buttonClass="!border !rounded-l-xl !px-2 !bg-white"
            dropdownClass="!rounded-xl !shadow-lg"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block font-semibold mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Enter password"
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-sm text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="block font-semibold mb-1">Confirm Password</label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Confirm password"
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-sm text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

                {/* ── Terms notice (default layout) ── */}
        <p className="text-gray-400 text-xs text-center leading-relaxed">
          By registering you accept our{" "}
          <Link
            to="/terms-public"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: branding.themeColor }}
            className="underline underline-offset-2 font-medium hover:opacity-80"
          >
            Terms & Conditions
          </Link>
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-3 rounded-xl font-semibold transition ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90 hover:scale-[1.02]"
          }`}
          style={{ backgroundColor: branding.themeColor }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Login link */}
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: branding.themeColor }}
            className="font-semibold"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
