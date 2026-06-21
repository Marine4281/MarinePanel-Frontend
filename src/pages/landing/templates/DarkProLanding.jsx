// src/pages/landing/templates/DarkProLanding.jsx
import { Link } from "react-router-dom";

export default function DarkProLanding({ brandName, themeColor, logo }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-9 w-9 rounded-xl object-contain" />
            : <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-lg" style={{ backgroundColor: themeColor }}>{brandName[0]}</div>
          }
          <span className="font-bold text-lg tracking-tight">{brandName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-5 py-2 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: themeColor }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-24 relative">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: themeColor }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border"
            style={{ borderColor: `${themeColor}44`, backgroundColor: `${themeColor}15`, color: themeColor }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
            Live Panel — Orders Processing Now
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Grow Faster with<br />
            <span style={{ color: themeColor }}>{brandName}</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            The most powerful SMM panel. Automate your social growth with our premium services, instant delivery, and 24/7 support.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Link to="/register" className="px-8 py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: themeColor }}>
              Create Account →
            </Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl font-bold text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all">
              Sign In
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "Telegram"].map((p) => (
              <span key={p} className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-gray-300">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-t border-white/5 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: "2M+", t: "Orders Delivered" },
            { n: "50K+", t: "Happy Customers" },
            { n: "0.3s", t: "Avg Start Time" },
            { n: "24/7", t: "Support" },
          ].map((s) => (
            <div key={s.t}>
              <div className="text-2xl font-black" style={{ color: themeColor }}>{s.n}</div>
              <div className="text-xs text-gray-500 mt-1">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-5 px-6 border-t border-white/5 text-center text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </footer>
    </div>
  );
}
