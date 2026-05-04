// src/templates/neon/NeonLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function NeonLogin() {
  const { login } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const brand = { color: childPanel?.themeColor || "#00ff88", name: childPanel?.brandName || "Panel", logo: childPanel?.logo || null };
  const neon = brand.color;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password: pw });
      login(res.data);
      toast.success("Access granted");
      navigate(res.data.isAdmin || res.data.isChildPanel ? "/child-panel/dashboard" : "/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Access denied");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background: "#0d0d1a",
    border: `1px solid ${neon}30`,
    color: "#c4c4e0",
    width: "100%",
    padding: "12px 16px 12px 42px",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0a0a14, #0d0d20)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grid lines decoration */}
      <div className="pointer-events-none fixed inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(${neon}40 1px, transparent 1px), linear-gradient(90deg, ${neon}40 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow spots */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: neon }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{
            background: "#0d0d1a",
            border: `1px solid ${neon}25`,
            boxShadow: `0 0 60px ${neon}12, 0 0 120px ${neon}06`,
          }}
        >
          {/* Brand */}
          <div className="text-center space-y-3">
            {brand.logo ? (
              <img src={brand.logo} alt="" className="w-14 h-14 rounded-xl mx-auto object-contain" />
            ) : (
              <div
                className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center text-2xl font-black"
                style={{ background: `${neon}14`, color: neon, boxShadow: `0 0 24px ${neon}44`, border: `1px solid ${neon}40` }}
              >
                {brand.name[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}88` }}>
                {brand.name}
              </h1>
              <p className="text-xs mt-1" style={{ color: "#4a4a6a" }}>System Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <FiMail size={14} className="absolute left-4 top-3.5" style={{ color: `${neon}60` }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@system.io"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = neon)}
                onBlur={(e) => (e.target.style.borderColor = `${neon}30`)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock size={14} className="absolute left-4 top-3.5" style={{ color: `${neon}60` }} />
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Access key"
                required
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={(e) => (e.target.style.borderColor = neon)}
                onBlur={(e) => (e.target.style.borderColor = `${neon}30`)}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-3.5" style={{ color: `${neon}60` }}>
                {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: `${neon}88` }}>
                Forgot key?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${neon}cc, ${neon}88)`,
                color: "#0a0a14",
                boxShadow: `0 0 24px ${neon}44`,
              }}
            >
              {loading ? "Authenticating…" : "ENTER SYSTEM"}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: "#3a3a5a" }}>
            No account?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: neon }}>
              Initialize
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
