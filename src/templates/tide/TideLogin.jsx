// src/templates/tide/TideLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function TideLogin() {
  const { login } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel", logo: childPanel?.logo || null };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password: pw });
      login(res.data);
      toast.success("Welcome back!");
      navigate(res.data.isAdmin || res.data.isChildPanel ? "/child-panel/dashboard" : "/home");
    } catch (err) { toast.error(err.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f7ff", fontFamily: "'Inter', sans-serif" }}>
      {/* Header bar */}
      <div className="h-2 w-full" style={{ background: brand.color }} />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Top banner */}
            <div className="px-8 py-8 text-center" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}>
              {brand.logo ? (
                <img src={brand.logo} alt="" className="w-16 h-16 rounded-2xl object-contain mx-auto mb-3 shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto mb-3 flex items-center justify-center text-3xl font-black text-white shadow-lg">
                  {brand.name[0]}
                </div>
              )}
              <h1 className="text-2xl font-black text-white">{brand.name}</h1>
              <p className="text-white/70 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-4 top-3.5 text-gray-300" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors"
                    onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-4 top-3.5 text-gray-300" />
                  <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" required
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors"
                    onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-3.5 text-gray-300">
                    {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded" style={{ accentColor: brand.color }} />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: brand.color }}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all"
                style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}>
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-bold hover:underline" style={{ color: brand.color }}>Create one</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className="h-1 w-full" style={{ background: brand.color }} />
    </div>
  );
}
