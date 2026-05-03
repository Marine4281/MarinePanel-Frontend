// src/templates/aurora/AuroraLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function AuroraLogin() {
  const { login } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const brand = {
    name:  childPanel?.brandName  || "Panel",
    color: childPanel?.themeColor || "#a78bfa",
    logo:  childPanel?.logo       || null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
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
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* Glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: brand.color }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "#6366f1" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-3xl p-8 space-y-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `0 0 60px ${brand.color}18`,
          }}
        >
          {/* Logo + brand */}
          <div className="text-center space-y-2">
            {brand.logo ? (
              <img src={brand.logo} alt="" className="w-14 h-14 rounded-2xl object-contain mx-auto" />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black"
                style={{ background: `${brand.color}22`, color: brand.color }}
              >
                {brand.name[0]}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">{brand.name}</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <FiMail
                size={15}
                className="absolute left-4 top-3.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                }}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock
                size={15}
                className="absolute left-4 top-3.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                }}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-4 top-3.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            {/* Forgot */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs hover:underline"
                style={{ color: brand.color }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)`,
                color: "#fff",
                boxShadow: `0 4px 20px ${brand.color}44`,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: brand.color }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
