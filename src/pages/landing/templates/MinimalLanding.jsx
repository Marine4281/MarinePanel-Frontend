// src/pages/landing/templates/MinimalLanding.jsx
import { Link } from "react-router-dom";

export default function MinimalLanding({ brandName, themeColor, logo }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-8 md:px-16 py-6">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-8 w-8 rounded-lg object-contain" />
            : <div className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: themeColor }}>{brandName[0]}</div>
          }
          <span className="font-bold text-gray-900">{brandName}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">Log in</Link>
          <Link to="/register"
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
            style={{ backgroundColor: themeColor }}>
            Sign up free
          </Link>
        </div>
      </header>

      {/* ── HERO ── asymmetric, text-heavy */}
      <section className="flex-1 px-8 md:px-16 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto] gap-16 items-start">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10" style={{ backgroundColor: themeColor }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: themeColor }}>
                SMM Panel
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-10 text-gray-900">
              Social<br />
              Media<br />
              Growth<br />
              <span style={{ color: themeColor }}>Simplified.</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg mb-10 leading-relaxed">
              {brandName} gives you access to the most reliable SMM services on the market. No fluff, no delays — just real growth for real accounts.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register"
                className="px-8 py-4 rounded-xl font-bold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: themeColor }}>
                Get started →
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                Log in
              </Link>
            </div>
          </div>

          {/* Right: vertical stat column */}
          <div className="hidden md:flex flex-col gap-0 pt-4 min-w-[160px]">
            {[
              { n: "2.2M", l: "Orders" },
              { n: "100+", l: "Services" },
              { n: "8",    l: "Platforms" },
              { n: "24/7", l: "Support" },
            ].map((s, i) => (
              <div key={s.l} className={`py-8 ${i < 3 ? "border-b border-gray-100" : ""}`}>
                <div className="text-4xl font-black text-gray-900">{s.n}</div>
                <div className="text-sm text-gray-400 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL MARQUEE-STYLE PLATFORM LIST ── */}
      <div className="border-y border-gray-100 py-5 overflow-hidden">
        <div className="flex gap-10 px-8 flex-wrap">
          {["Instagram", "TikTok", "YouTube", "Twitter / X", "Facebook", "Telegram", "Pinterest", "LinkedIn", "Spotify", "Snapchat"].map((p) => (
            <span key={p} className="text-sm font-semibold text-gray-300 whitespace-nowrap">{p}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── numbered steps */}
      <section className="px-8 md:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black mb-16">How it works.</h2>
          <div className="space-y-0">
            {[
              { n: "01", title: "Create your account",  desc: "Sign up in seconds. No credit card required to get started." },
              { n: "02", title: "Add funds",            desc: "Top up your balance using any supported payment method." },
              { n: "03", title: "Place an order",       desc: "Browse 100+ services and place your order with one click." },
              { n: "04", title: "Watch it grow",        desc: "Your order starts in seconds and you track progress live." },
            ].map((s, i) => (
              <div key={s.n} className={`flex gap-8 items-start py-8 ${i < 3 ? "border-b border-gray-100" : ""}`}>
                <div className="text-5xl font-black text-gray-100 select-none w-16 shrink-0">{s.n}</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMPLE CTA ── */}
      <section className="px-8 md:px-16 pb-24">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-3xl border border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Start growing today.</h2>
            <p className="text-gray-400 mt-1">Free account · Instant activation</p>
          </div>
          <Link to="/register"
            className="shrink-0 px-8 py-4 rounded-xl font-bold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: themeColor }}>
            Create account →
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-8 md:px-16 py-6 flex items-center justify-between text-sm text-gray-400">
        <span className="font-semibold text-gray-900">{brandName}</span>
        <span>&copy; {new Date().getFullYear()}. All rights reserved.</span>
      </footer>
    </div>
  );
}
