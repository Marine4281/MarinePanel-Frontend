import { Link } from "react-router-dom";

const SERVICES = [
  { emoji: "📸", platform: "Instagram",  metrics: ["Followers", "Likes", "Views", "Story Views"] },
  { emoji: "🎵", platform: "TikTok",     metrics: ["Views", "Followers", "Likes", "Shares"] },
  { emoji: "▶️", platform: "YouTube",    metrics: ["Subscribers", "Views", "Watch Time"] },
  { emoji: "🐦", platform: "Twitter/X",  metrics: ["Followers", "Likes", "Retweets"] },
  { emoji: "👍", platform: "Facebook",   metrics: ["Page Likes", "Post Likes"] },
  { emoji: "✈️", platform: "Telegram",   metrics: ["Members", "Views", "Reactions"] },
  { emoji: "📌", platform: "Pinterest",  metrics: ["Followers", "Repins"] },
  { emoji: "💼", platform: "LinkedIn",   metrics: ["Connections", "Followers"] },
];

export default function NeonLanding({ brandName, themeColor, logo }) {
  const tc = themeColor || "#f97316";

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: "#050914", color: "white" }}>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b"
        style={{ borderColor: `${tc}20` }}>
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-9 w-9 rounded-xl object-contain" />
            : <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-base"
                style={{ backgroundColor: tc, boxShadow: `0 0 20px ${tc}60` }}>{brandName[0]}</div>
          }
          <span className="font-black text-white text-lg tracking-tight">{brandName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl border transition-all"
            style={{ borderColor: `${tc}30`, color: `${tc}cc` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = tc; e.currentTarget.style.color = tc; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${tc}30`; e.currentTarget.style.color = `${tc}cc`; }}>
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm font-black text-white px-6 py-2.5 rounded-xl transition-all"
            style={{ backgroundColor: tc, boxShadow: `0 0 24px ${tc}50` }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-8 md:px-16 py-24 md:py-32 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${tc}08 1px, transparent 1px), linear-gradient(90deg, ${tc}08 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }} />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: tc }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold mb-10 border"
            style={{ borderColor: `${tc}30`, backgroundColor: `${tc}10`, color: tc }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tc }} />
            All systems operational · 99.9% uptime
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-8">
            <span className="text-white">The</span>{" "}
            <span style={{
              color: tc,
              textShadow: `0 0 40px ${tc}80, 0 0 80px ${tc}40`,
            }}>Fastest</span>
            <br />
            <span className="text-white">SMM Panel</span>
            <br />
            <span className="text-white/30">on Earth.</span>
          </h1>

          <p className="text-white/40 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            {brandName} powers social media growth for agencies, freelancers, and brands across 8+ platforms. Instant delivery, real results.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Link to="/register"
              className="px-10 py-4 rounded-2xl font-black text-white text-lg transition-all hover:scale-105"
              style={{ backgroundColor: tc, boxShadow: `0 0 40px ${tc}50, 0 8px 32px ${tc}40` }}>
              Start for Free →
            </Link>
            <Link to="/login"
              className="px-10 py-4 rounded-2xl font-bold text-white/60 text-lg border transition-all hover:text-white"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { n: "2.2M+",  l: "Orders Delivered" },
              { n: "0.4s",   l: "Avg Start Time" },
              { n: "100+",   l: "Services" },
              { n: "24/7",   l: "Support" },
            ].map((s) => (
              <div key={s.l}
                className="rounded-2xl p-5 border text-center"
                style={{ borderColor: `${tc}20`, backgroundColor: `${tc}08` }}>
                <div className="text-3xl font-black mb-1" style={{ color: tc }}>{s.n}</div>
                <div className="text-xs text-white/30">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="px-8 md:px-16 py-20 border-t" style={{ borderColor: `${tc}15` }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1" style={{ backgroundColor: `${tc}30` }} />
            <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: tc }}>
              Supported Platforms
            </h2>
            <div className="h-px flex-1" style={{ backgroundColor: `${tc}30` }} />
          </div>
          <p className="text-white/30 text-center text-sm mb-12">Order services across every major platform from one dashboard.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <div key={s.platform}
                className="rounded-2xl p-5 border transition-all group cursor-default"
                style={{ borderColor: `${tc}15`, backgroundColor: `${tc}05` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${tc}40`; e.currentTarget.style.backgroundColor = `${tc}10`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${tc}15`; e.currentTarget.style.backgroundColor = `${tc}05`; }}>
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="font-black text-white text-sm mb-2">{s.platform}</div>
                <div className="flex flex-wrap gap-1">
                  {s.metrics.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tc}15`, color: `${tc}cc` }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 FEATURE CARDS ── */}
      <section className="px-8 md:px-16 py-20 border-t" style={{ borderColor: `${tc}15` }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Lightning Delivery",
              desc: "Orders start processing in under half a second. Fully automated — no human bottlenecks, ever.",
              big: true,
            },
            {
              icon: "💰",
              title: "Lowest Prices",
              desc: "Direct provider rates with zero markup. More profit on every single order you place.",
            },
            {
              icon: "🔒",
              title: "Zero Risk",
              desc: "No passwords required. Your accounts are always safe. We only need your public profile link.",
            },
          ].map((f) => (
            <div key={f.title}
              className="rounded-3xl p-8 border relative overflow-hidden"
              style={{ borderColor: `${tc}20`, backgroundColor: `${tc}06` }}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ backgroundColor: tc }} />
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="font-black text-white text-lg mb-3">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-8 md:px-16 py-20 border-t" style={{ borderColor: `${tc}15` }}>
        <div className="max-w-4xl mx-auto rounded-3xl p-14 text-center relative overflow-hidden border"
          style={{ borderColor: `${tc}30`, backgroundColor: `${tc}08` }}>
          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: tc }} />
          </div>
          <div className="relative z-10">
            <div className="text-4xl mb-6">🚀</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Ready to launch?
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Free account · No credit card · Instant access to all services.
            </p>
            <Link to="/register"
              className="inline-block px-12 py-5 rounded-2xl font-black text-white text-xl transition-all hover:scale-105"
              style={{
                backgroundColor: tc,
                boxShadow: `0 0 50px ${tc}50, 0 8px 32px ${tc}40`,
              }}>
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t px-8 md:px-16 py-6 flex items-center justify-between text-xs"
        style={{ borderColor: `${tc}15` }}>
        <span className="font-bold text-white/40">{brandName} · SMM Panel</span>
        <span className="text-white/20">&copy; {new Date().getFullYear()}. All rights reserved.</span>
      </footer>
    </div>
  );
}
