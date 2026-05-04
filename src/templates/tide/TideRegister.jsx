// src/templates/tide/TideRegister.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiLock, FiEye, FiEyeOff, FiMail } from "react-icons/fi";

export default function TideRegister() {
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
  const [showCon, setShowCon]           = useState(false);
  const [loading, setLoading]           = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#0ea5e9",
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
      toast.success("Account created!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors";

  const PwField = ({ label, value, onChange, show, toggle, placeholder }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <FiLock size={14} className="absolute left-4 top-3.5 text-gray-300" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`${inputClass} pl-10 pr-10`}
          onFocus={(e) => (e.target.style.borderColor = brand.color)}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <button type="button" onClick={toggle} className="absolute right-4 top-3.5 text-gray-300">
          {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f0f7ff", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="h-2 w-full" style={{ background: brand.color }} />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Banner */}
            <div
              className="px-8 py-6 text-center"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
            >
              {brand.logo ? (
                <img src={brand.logo} alt="" className="w-12 h-12 rounded-xl object-contain mx-auto mb-2 shadow" />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl bg-white/20 mx-auto mb-2 flex items-center justify-center text-2xl font-black text-white shadow"
                >
                  {brand.name[0]}
                </div>
              )}
              <h1 className="text-xl font-black text-white">Create Account</h1>
              <p className="text-white/70 text-sm mt-1">{brand.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

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
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 14,
                    height: 46,
                    paddingLeft: 52,
                    color: "#1f2937",
                  }}
                  buttonStyle={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
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
                show={showCon}
                toggle={() => setShowCon((s) => !s)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{
                  background: brand.color,
                  boxShadow: `0 4px 16px ${brand.color}44`,
                }}
              >
                {loading ? "Creating…" : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already registered?{" "}
                <Link to="/login" className="font-bold hover:underline" style={{ color: brand.color }}>
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className="h-1 w-full" style={{ background: brand.color }} />
    </div>
  );
}
