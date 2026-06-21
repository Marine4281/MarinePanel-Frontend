// src/pages/landing/templates/VibrantLanding.jsx
import { Link } from "react-router-dom";

export default function VibrantLanding({ brandName, themeColor, logo }) {
  const darkerColor = themeColor;
  const bg = `linear-gradient(160deg, #fff 0%, ${themeColor}18 50%, ${themeColor}35 100%)`;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: bg }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-10 w-10 rounded-2xl object-contain shadow-md" />
            : <div className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-white shadow-md" style={{ backgroundColor: themeColor }}>{brandName[0]}</div>
          }
          <span className="font-extrabold text-xl text-gray-900">{brandName}</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-white shadow-sm hover:shadow-md transition-all text-sm">Login</Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm" style={{ backgroundColor: darkerColor }}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ backgroundColor: themeColor }} />
          <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl text-4xl bg-white">
            {logo ? <img src={logo} alt={brandName} className="w-16 h-16 object-contain" /> : "🚀"}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-5 leading-tight">
          Supercharge Your<br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}>
            Social Media
          </span>
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed">
          {brandName} powers thousands of accounts daily. Get likes, followers, views and more — delivered instantly at unbeatable prices.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link to="/register" className="px-10 py-4 rounded-2xl font-black text-white text-lg shadow-2xl hover:scale-105 hover:shadow-3xl transition-all" style={{ backgroundColor: themeColor }}>
            Start Growing 🚀
          </Link>
          <Link to="/login" className="px-10 py-4 rounded-2xl font-black text-gray-700 text-lg bg-white shadow-md hover:shadow-xl hover:scale-105 transition-all">
            I have an account
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
          {[
            { emoji: "📸", label: "Instagram" },
            { emoji: "🎵", label: "TikTok" },
            { emoji: "▶️", label: "YouTube" },
            { emoji: "🐦", label: "Twitter/X" },
            { emoji: "👍", label: "Facebook" },
            { emoji: "✈️", label: "Telegram" },
            { emoji: "📌", label: "Pinterest" },
            { emoji: "💼", label: "LinkedIn" },
          ].map((p) => (
            <div key={p.label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-gray-500 border-t border-white/60 bg-white/40">
        &copy; {new Date().getFullYear()} <span className="font-semibold">{brandName}</span>. All rights reserved.
      </footer>
    </div>
  );
}
