// src/pages/landing/templates/DefaultLanding.jsx
import { Link } from "react-router-dom";

export default function DefaultLanding({ brandName, themeColor, logo }) {
  const bg = `linear-gradient(135deg, ${themeColor}ee 0%, ${themeColor}99 60%, ${themeColor}44 100%)`;

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center text-white px-6 py-28 overflow-hidden" style={{ background: bg }}>
        {/* decorative rings */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border border-white/10" />
        </div>

        {logo && (
          <img src={logo} alt={brandName} className="h-20 w-20 rounded-3xl object-contain mb-6 shadow-2xl ring-4 ring-white/20" />
        )}

        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Instant Delivery · Lowest Prices · 24/7 Support
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-5 leading-tight tracking-tight">
          Welcome to<br />{brandName}
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-xl opacity-90 leading-relaxed">
          The fastest SMM panel for Instagram, TikTok, YouTube, and more. Real results, instant start, unbeatable prices.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link to="/register"
            className="px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all"
            style={{ backgroundColor: "white", color: themeColor }}>
            Get Started Free
          </Link>
          <Link to="/login"
            className="px-10 py-4 rounded-2xl font-bold text-lg border-2 border-white/50 hover:bg-white/10 transition-all">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          {[
            { n: "2.2M+", l: "Orders Delivered" },
            { n: "100+",  l: "Services" },
            { n: "24/7",  l: "Live Support" },
            { n: "99.9%", l: "Uptime" },
          ].map((s) => (
            <div key={s.l} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
              <div className="text-3xl font-black">{s.n}</div>
              <div className="text-sm opacity-80 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-3">All Platforms. One Panel.</h2>
          <p className="text-gray-400 text-center mb-12">Order services for every major platform from one dashboard.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "📸", name: "Instagram", services: "Followers, Likes, Views" },
              { emoji: "🎵", name: "TikTok",    services: "Views, Followers, Likes" },
              { emoji: "▶️", name: "YouTube",   services: "Views, Subs, Watchtime" },
              { emoji: "🐦", name: "Twitter/X", services: "Followers, Likes, RTs" },
              { emoji: "👍", name: "Facebook",  services: "Page Likes, Post Likes" },
              { emoji: "✈️", name: "Telegram",  services: "Members, Views, Reacts" },
              { emoji: "📌", name: "Pinterest", services: "Followers, Repins" },
              { emoji: "💼", name: "LinkedIn",  services: "Connections, Followers" },
            ].map((p) => (
              <div key={p.name} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                <div className="text-xs text-gray-400 mt-1 leading-relaxed">{p.services}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: "⚡", title: "Lightning Fast", desc: "Orders start within seconds of placement. Fully automated, no manual work." },
            { icon: "💰", title: "Lowest Prices", desc: "Wholesale rates with bulk discounts. Maximize your profit on every order." },
            { icon: "🔒", title: "100% Safe", desc: "No passwords needed. Your account security is always our top priority." },
          ].map((f) => (
            <div key={f.title} className="text-center p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
              <div className="text-5xl mb-5">{f.icon}</div>
              <h3 className="text-lg font-black text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 mx-6 mb-10 rounded-3xl text-white text-center" style={{ background: bg }}>
        <h2 className="text-3xl font-black mb-4">Ready to grow?</h2>
        <p className="opacity-90 mb-8">Join thousands already using {brandName} to scale their social presence.</p>
        <Link to="/register"
          className="inline-block px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl"
          style={{ backgroundColor: "white", color: themeColor }}>
          Create Free Account →
        </Link>
      </section>

      <footer className="py-6 text-center text-white text-sm font-medium" style={{ backgroundColor: themeColor }}>
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </footer>
    </div>
  );
}
