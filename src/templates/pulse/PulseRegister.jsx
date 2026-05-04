// src/templates/pulse/PulseRegister.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiLock, FiEye, FiEyeOff, FiMail, FiArrowRight } from "react-icons/fi";

export default function PulseRegister() {
  const { login } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();

  const [email, setEmail]               = useState("");
  const [phone, setPhone]               = useState("");
  const [phoneCountry, setPhoneCountry] = useState("us");
  const [country, setCountry]           = useState({ name: "United States", code: "US" });
  const [pw, setPw]                     = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#6366f1",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone || !pw || !confirm)
      return toast.error("Please fill all fields");
    if (pw !== confirm)
      return toast.error("Passwords don't match");
    if (pw.length < 6)
      return toast.error("Min 6 characters");

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        email,
        phone,
        country: country.name,
        countryCode: country.code,
        password: pw,
      });
      login(res.data);
      toast.success("Welcome!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors";

  const PwField = ({ label, value, onChange, show, toggle, placeholder }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`${inputClass} pr-10`}
          onFocus={(e) => (e.target.style.borderColor = brand.color)}
          onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
        />
        <button type="button" onClick={toggle} className="absolute right-3.5 top-3.5 text-gray-300">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f8faff", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top decoration */}
      <div
        className="h-48 w-full flex flex-col items-center justify-end pb-6"
        style={{
          background: `linear-gradient(160deg, ${brand.color} 0%, ${brand.color}cc 100%)`,
          borderRadius: "0 0 40px 40px",
        }}
      >
        {brand.logo ? (
          <img src={brand.logo} alt="" className="w-12 h-12 rounded-2xl object-contain mb-2 shadow-lg" />
        ) : (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-2 shadow-lg"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {brand.name[0]}
          </div>
        )}
        <h1 className="text-white text-xl font-black">Join {brand.name}</h1>
      </div>

      {/* Form card */}
      <div className="flex-1 px-6 -mt-6 relative z-10 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-4 top-3.5 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={`${inputClass} pl-10`}
                  onFocus={(e) => (e.target.style.borderColor = brand.color)}
                  onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
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
                inputStyle={{
                  width: "100%",
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRadius: 12,
                  fontSize: 14,
                  height: 46,
                  paddingLeft: 52,
                  color: "#1f2937",
                }}
                buttonStyle={{
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRight: "none",
                  borderRadius: "12px 0 0 12px",
                }}
                dropdownStyle={{ background: "#fff", color: "#1f2937" }}
              />
            </div>

            <PwField
              label="Password"
              value={pw}
              onChange={setPw}
              placeholder="Min 6 characters"
              show={showPw}
              toggle={() => setShowPw((s) => !s)}
            />
            <PwField
              label="Confirm Password"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat password"
              show={showConfirm}
              toggle={() => setShowConfirm((s) => !s)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
              style={{
                background: brand.color,
                boxShadow: `0 4px 20px ${brand.color}44`,
              }}
            >
              {loading ? "Creating..." : <><span>Create Account</span> <FiArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-bold" style={{ color: brand.color }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
