// src/pages/landing/templates/VibrantLanding.jsx
import { Link } from "react-router-dom";

const REVIEWS = [
  { name: "Alex K.",    text: "Cheapest prices I've found anywhere. Orders start instantly!",      rating: 5 },
  { name: "Sarah M.",   text: "Been using this panel for 6 months. Never had a single issue.",     rating: 5 },
  { name: "James T.",   text: "The reseller features are insane. Built my whole business on this.", rating: 5 },
  { name: "Priya R.",   text: "Support team replies in minutes. Genuinely the best panel out there.", rating: 5 },
];

export default function VibrantLanding({ brandName, themeColor, logo }) {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "#0d0d0d" }}>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-9 w-9 rounded-xl object-contain" />
            : <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>{brandName[0]}</div>
          }
          <span className="font-bold text-white">{brandName}</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm px-5 py-2.5 rounded-xl text-white/50 hover:text-white transition-colors">Login</Link>
          <Link to="/register"
            className="text-sm font-bold px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-6 py-20 md:py-28 text-center relative overflow-hidden">
        {/* bg glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#a855f7" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "#ec4899" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 border"
            style={{ borderColor: "#a855f722", background: "#a855f711", color: "#c084fc" }}>
            🔥 10,000+ resellers already onboard
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Grow Faster.<br />
            <span style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Earn More.
            </span>
          </h1>

          <p className="text-white/40 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {brandName} is your all-in-one SMM engine. Instagram, TikTok, YouTube — supercharged with instant delivery and the lowest prices on the planet.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/register"
              className="px-10 py-4 rounded-2xl font-black text-white text-lg hover:opacity-90 hover:scale-105 transition-all shadow-2xl"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 8px 32px #a855f740" }}>
              Start for Free 🚀
            </Link>
            <Link to="/login"
              className="px-10 py-4 rounded-2xl font-bold text-white/60 text-lg border border-white/10 hover:border-white/20 hover:text-white transition-all">
              Sign In
            </Link>
          </div>

          {/* Platform emoji grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 max-w-2xl mx-auto">
            {[
              { e: "📸", n: "Instagram" },
              { e: "🎵", n: "TikTok" },
              { e: "▶️", n: "YouTube" },
              { e: "🐦", n: "Twitter" },
              { e: "👍", n: "Facebook" },
              { e: "✈️", n: "Telegram" },
              { e: "🎵", n: "Spotify" },
              { e: "💼", n: "LinkedIn" },
            ].map((p) => (
              <div key={p.n}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all cursor-default group">
                <span className="text-2xl group-hover:scale-110 transition-transform">{p.e}</span>
                <span className="text-xs text-white/30">{p.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Big card */}
          <div className="col-span-2 rounded-3xl p-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #a855f720, #ec489910)", border: "1px solid #a855f720" }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-30" style={{ background: "#a855f7" }} />
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-black text-white mb-2">Instant Delivery</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Orders start in under a second. Our fully automated system processes 24/7 — no human delay, no waiting around.
            </p>
          </div>

          <div className="rounded-3xl p-7 flex flex-col justify-between"
            style={{ background: "#161616", border: "1px solid #ffffff08" }}>
            <div className="text-3xl mb-4">💰</div>
            <div>
              <h3 className="font-black text-white mb-1">Cheapest Prices</h3>
              <p className="text-white/30 text-xs leading-relaxed">Wholesale rates · Bulk discounts · Max profit</p>
            </div>
          </div>

          <div className="rounded-3xl p-7 flex flex-col justify-between"
            style={{ background: "#161616", border: "1px solid #ffffff08" }}>
            <div className="text-3xl mb-4">🔒</div>
            <div>
              <h3 className="font-black text-white mb-1">Secure & Safe</h3>
              <p className="text-white/30 text-xs leading-relaxed">No passwords · Enterprise security · Privacy first</p>
            </div>
          </div>

          <div className="rounded-3xl p-7 flex flex-col justify-between"
            style={{ background: "#161616", border: "1px solid #ffffff08" }}>
            <div className="text-3xl mb-4">🎯</div>
            <div>
              <h3 className="font-black text-white mb-1">100+ Services</h3>
              <p className="text-white/30 text-xs leading-relaxed">All platforms · All metrics · One dashboard</p>
            </div>
          </div>

          <div className="rounded-3xl p-7 flex flex-col justify-between col-span-1"
            style={{ background: "#161616", border: "1px solid #ffffff08" }}>
            <div className="text-3xl mb-4">🌍</div>
            <div>
              <h3 className="font-black text-white mb-1">24/7 Support</h3>
              <p className="text-white/30 text-xs leading-relaxed">Real humans · Fast responses · Always online</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-10">What our users say 💬</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl p-6"
                style={{ background: "#161616", border: "1px solid #ffffff08" }}>
                <div className="flex gap-1 mb-3">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} style={{ color: "#a855f7" }}>{s}</span>
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <span className="text-xs font-bold text-white/30">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #a855f730, #ec489918)", border: "1px solid #a855f720" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "#a855f7" }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10">
            Ready to blow up? 💥
          </h2>
          <p className="text-white/40 mb-8 relative z-10">Free account · No credit card · Start in 60 seconds</p>
          <Link to="/register"
            className="inline-block px-12 py-4 rounded-2xl font-black text-white text-lg hover:opacity-90 hover:scale-105 transition-all relative z-10"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 8px 32px #a855f740" }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-5 flex items-center justify-between text-xs text-white/20">
        <span className="font-semibold text-white/40">{brandName}</span>
        <span>&copy; {new Date().getFullYear()}. All rights reserved.</span>
      </footer>
    </div>
  );
}
