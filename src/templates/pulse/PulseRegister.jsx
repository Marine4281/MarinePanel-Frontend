// src/templates/pulse/PulseRegister.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

export default function PulseRegister() {
  const { login } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();

  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [pw, setPw]                   = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#6366f1",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone || !pw || !confirm) return toast.error("All fields required");
    if (pw !== confirm) return toast.error("Passwords don't match");
    if (pw.length < 6) return toast.error("Min 6 characters");
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { email, phone, password: pw });
      login(res.data);
      toast.success("Welcome!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, type, value, onChange, placeholder, showState, toggleShow }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={type === "password" ? (showState ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors"
          onFocus={(e) => (e.target.style.borderColor = brand.color)}
          onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
        />
        {type === "password" && (
          <button type="button" onClick={toggleShow} className="absolute right-4 top-3.5 text-gray-300">
            {showState ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
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
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
              <PhoneInput
                country="us"
                value={phone}
                onChange={setPhone}
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
              />
            </div>

            <Field
              label="Password"
              type="password"
              value={pw}
              onChange={setPw}
              placeholder="Min 6 characters"
              showState={showPw}
              toggleShow={() => setShowPw((s) => !s)}
            />
            <Field
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat password"
              showState={showConfirm}
              toggleShow={() => setShowConfirm((s) => !s)}
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
              {loading ? "Creating..." : <>Create Account <FiArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-bold" style={{ color: brand.color }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
