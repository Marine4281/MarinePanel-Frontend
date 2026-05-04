// src/templates/pulse/PulseLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

export default function PulseLogin() {
  const { login } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();

  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#6366f1",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password: pw });
      login(res.data);
      toast.success("Welcome back!");
      navigate(res.data.isAdmin || res.data.isChildPanel ? "/child-panel/dashboard" : "/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f8faff", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top decoration */}
      <div
        className="h-56 w-full flex flex-col items-center justify-end pb-8"
        style={{
          background: `linear-gradient(160deg, ${brand.color} 0%, ${brand.color}cc 100%)`,
          borderRadius: "0 0 40px 40px",
        }}
      >
        {brand.logo ? (
          <img src={brand.logo} alt="" className="w-16 h-16 rounded-2xl object-contain mb-3 shadow-lg" />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-3 shadow-lg"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {brand.name[0]}
          </div>
        )}
        <h1 className="text-white text-2xl font-black">{brand.name}</h1>
        <p className="text-white/70 text-sm mt-1">Sign in to continue</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-4 top-3.5 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none focus:border-indigo-300 text-gray-800 transition-colors"
                  style={{ "--tw-ring-color": brand.color }}
                  onFocus={(e) => (e.target.style.borderColor = brand.color)}
                  onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-4 top-3.5 text-gray-300" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors"
                  onFocus={(e) => (e.target.style.borderColor = brand.color)}
                  onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-3.5 text-gray-300">
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-semibold" style={{ color: brand.color }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg"
              style={{
                background: brand.color,
                boxShadow: `0 4px 20px ${brand.color}44`,
              }}
            >
              {loading ? "Signing in..." : <>Sign In <FiArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{" "}
          <Link to="/register" className="font-bold" style={{ color: brand.color }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
    }
