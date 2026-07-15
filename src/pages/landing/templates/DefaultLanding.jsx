// src/pages/landing/templates/DefaultLanding.jsx
// Login-first landing page for child panel / reseller domains.
// Leads with a real login form (like most SMM panels) but still sells the
// panel with a hero pitch, stats, platform icons, and feature highlights.
// A discreet top-right menu button reveals Services / Terms / Sign Up.

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useChildPanel } from "../../../context/ChildPanelContext";
import { useReseller } from "../../../context/ResellerContext";
import { useCachedServices } from "../../../context/CachedServicesContext";
import API from "../../../api/axios";
import toast from "react-hot-toast";

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);
const IconDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="12" cy="19" r="1.5"/>
  </svg>
);

const PLATFORMS = [
  { emoji: "📸", name: "Instagram" },
  { emoji: "🎵", name: "TikTok" },
  { emoji: "▶️", name: "YouTube" },
  { emoji: "🐦", name: "Twitter/X" },
  { emoji: "👍", name: "Facebook" },
  { emoji: "✈️", name: "Telegram" },
];

const FEATURES = [
  { icon: "⚡", title: "Instant Delivery", desc: "Orders start within seconds, fully automated." },
  { icon: "💰", title: "Lowest Prices", desc: "Wholesale rates with room to resell for profit." },
  { icon: "🔒", title: "100% Safe", desc: "No passwords needed. Your accounts stay secure." },
];

export default function LoginFirstLanding({ brandName, themeColor, logo }) {
  const { login }        = useAuth();
  const navigate          = useNavigate();
  const { domainType }    = useCachedServices();
  const { childPanel }    = useChildPanel();
  const { reseller }      = useReseller();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);

  const menuRef = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const tc = themeColor || "#1e40af";
  const name = brandName || "Panel";
  const bg = `linear-gradient(135deg, ${tc}ee 0%, ${tc}88 50%, #0f172a 100%)`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/auth/login", { email, password });

      if (domainType === "childPanel" && res.data.isAdmin) {
        toast.error("Please log in through the main platform.");
        setSubmitting(false);
        return;
      }

      login(res.data);
      toast.success("Login successful!");

      if (res.data.isAdmin)           navigate("/admin");
      else if (res.data.isCpAdmin)    navigate("/child-panel/users");
      else if (res.data.isChildPanel) navigate("/child-panel/dashboard");
      else                            navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email first");
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: bg }}>
      {/* Slim top bar — brand left, hidden menu right */}
      <div className="flex items-center justify-between px-5 py-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={name} className="h-8 w-8 rounded-lg object-contain bg-white/20 p-0.5" />
          ) : (
            <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              {name[0]}
            </div>
          )}
          <span className="text-white/90 font-semibold text-sm">{name}</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More"
            className="h-8 w-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconDots />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-2xl border border-white/10 z-20"
              style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)" }}>
              <Link to="/services-public" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors">
                Services & Pricing
              </Link>
              <Link to="/terms-public" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors border-t border-white/10">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── HERO: pitch left, login card right ── */}
      <section className="flex-1 max-w-6xl w-full mx-auto px-5 pb-16 pt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        {/* Pitch column */}
        <div className="text-white order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Instant Delivery · Lowest Prices · 24/7 Support
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            Grow your socials with {name}
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-lg opacity-90 leading-relaxed">
            Real followers, likes, and views for every major platform — delivered fast, priced fair, and backed by support that never sleeps.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-md mb-10">
            {[
              { n: "2.2M+", l: "Orders Delivered" },
              { n: "100+",  l: "Services" },
              { n: "24/7",  l: "Live Support" },
            ].map((s) => (
              <div key={s.l} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-xl font-black">{s.n}</div>
                <div className="text-[11px] opacity-80 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Platform icons */}
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-3">Supported platforms</p>
            <div className="flex flex-wrap gap-2.5">
              {PLATFORMS.map((p) => (
                <div key={p.name}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors border border-white/15 rounded-full px-3 py-1.5 text-xs font-medium">
                  <span>{p.emoji}</span>{p.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="order-1 lg:order-2">
          <div
            className="w-full max-w-md mx-auto rounded-3xl p-8"
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            }}
          >
            <h2 className="text-xl font-bold text-white text-center mb-1">Sign in to {name}</h2>
            <p className="text-center text-white/55 text-sm mb-6">Enter your details to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/65 text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-white/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/65 text-xs font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-white/35 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-white/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-55 disabled:cursor-not-allowed"
                style={{ backgroundColor: "white", color: tc }}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="text-center text-white/55 text-sm mt-5">
              Don't have an account?{" "}
              <Link to="/register" className="text-white font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-16 px-6 bg-white/[0.04] backdrop-blur-sm border-t border-white/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center p-6 rounded-2xl border border-white/10 hover:border-white/25 transition-all">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-white/40 text-xs border-t border-white/10">
        © {new Date().getFullYear()} {name}. All rights reserved.
      </footer>
    </div>
  );
                    }
