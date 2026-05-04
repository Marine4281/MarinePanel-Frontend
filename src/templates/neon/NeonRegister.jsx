// src/templates/neon/NeonRegister.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiLock, FiEye, FiEyeOff, FiMail } from "react-icons/fi";

export default function NeonRegister() {
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
    color: childPanel?.themeColor || "#00ff88",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };
  const neon = brand.color;

  const inputStyle = {
    background: "#0d0d1a",
    border: `1px solid ${neon}25`,
    color: "#c4c4e0",
    width: "100%",
    padding: "12px 16px 12px 42px",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone || !pw || !confirm)
      return toast.error("Please fill all fields");
    if (pw !== confirm)
      return toast.error("Keys don't match");
    if (pw.length < 6)
      return toast.error("Min 6 chars");

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
      toast.success("Account initialized");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Init failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0a0a14, #0d0d20)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grid bg */}
      <div className="pointer-events-none fixed inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(${neon}40 1px, transparent 1px), linear-gradient(90deg, ${neon}40 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative w-full max-w-sm">
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: "#0d0d1a",
            border: `1px solid ${neon}20`,
            boxShadow: `0 0 60px ${neon}10`,
          }}
        >
          {/* Header */}
          <div className="text-center">
            {brand.logo ? (
              <img src={brand.logo} alt="" className="w-12 h-12 rounded-xl mx-auto object-contain mb-2" />
            ) : (
              <div
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-xl font-black mb-2"
                style={{ background: `${neon}14`, color: neon, boxShadow: `0 0 20px ${neon}40`, border: `1px solid ${neon}35` }}
              >
                {brand.name[0]}
              </div>
            )}
            <h1 className="text-lg font-black" style={{ color: neon, textShadow: `0 0 12px ${neon}80` }}>
              Initialize Account
            </h1>
            <p className="text-xs mt-1" style={{ color: "#3a3a5a" }}>{brand.name} System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="relative">
              <FiMail size={13} className="absolute left-4 top-3.5" style={{ color: `${neon}55` }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = neon)}
                onBlur={(e) => (e.target.style.borderColor = `${neon}25`)}
              />
            </div>

            {/* Phone */}
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
                background: "#0d0d1a",
                border: `1px solid ${neon}25`,
                borderRadius: 12,
                color: "#c4c4e0",
                fontSize: 14,
                height: 46,
                paddingLeft: 52,
              }}
              buttonStyle={{
                background: "#0d0d1a",
                border: `1px solid ${neon}25`,
                borderRight: "none",
                borderRadius: "12px 0 0 12px",
              }}
              dropdownStyle={{ background: "#0d0d1a", color: "#c4c4e0" }}
            />

            {/* Password */}
            <div className="relative">
              <FiLock size={13} className="absolute left-4 top-3.5" style={{ color: `${neon}55` }} />
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Access key"
                required
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={(e) => (e.target.style.borderColor = neon)}
                onBlur={(e) => (e.target.style.borderColor = `${neon}25`)}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-3.5" style={{ color: `${neon}55` }}>
                {showPw ? <FiEyeOff size={13} /> : <FiEye size={13} />}
              </button>
            </div>

            {/* Confirm */}
            <div className="relative">
              <FiLock size={13} className="absolute left-4 top-3.5" style={{ color: `${neon}55` }} />
              <input
                type={showCon ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm key"
                required
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={(e) => (e.target.style.borderColor = neon)}
                onBlur={(e) => (e.target.style.borderColor = `${neon}25`)}
              />
              <button type="button" onClick={() => setShowCon((s) => !s)} className="absolute right-4 top-3.5" style={{ color: `${neon}55` }}>
                {showCon ? <FiEyeOff size={13} /> : <FiEye size={13} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black mt-1 disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${neon}cc, ${neon}88)`,
                color: "#0a0a14",
                boxShadow: `0 0 20px ${neon}40`,
              }}
            >
              {loading ? "Initializing…" : "INITIALIZE"}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: "#3a3a5a" }}>
            Have access?{" "}
            <Link to="/login" className="font-bold hover:underline" style={{ color: neon }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
