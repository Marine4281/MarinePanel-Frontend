import { Link } from "react-router-dom";

const STEPS = [
  { n: "01", title: "Create Account", desc: "Sign up free in under 30 seconds. No credit card required." },
  { n: "02", title: "Add Funds",      desc: "Top up your wallet with any payment method we support." },
  { n: "03", title: "Place Order",    desc: "Pick a service, enter your link, and submit. Done." },
  { n: "04", title: "Track & Grow",   desc: "Watch your order deliver in real time from your dashboard." },
];

const PLATFORMS = [
  { e: "📸", n: "Instagram",  s: "Followers · Likes · Views · Reels" },
  { e: "🎵", n: "TikTok",     s: "Views · Followers · Likes · Shares" },
  { e: "▶️", n: "YouTube",    s: "Subs · Views · Watchtime · Likes" },
  { e: "🐦", n: "Twitter/X",  s: "Followers · Likes · Retweets" },
  { e: "👍", n: "Facebook",   s: "Page Likes · Post Likes · Followers" },
  { e: "✈️", n: "Telegram",   s: "Members · Views · Reactions" },
];

export default function SunriseLanding({ brandName, themeColor, logo }) {
  const tc = themeColor || "#f97316";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-9 w-9 rounded-xl object-contain" />
            : <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-base"
                style={{ backgroundColor: tc }}>{brandName[0]}</div>
          }
          <span className="font-black text-gray-900 text-lg">{brandName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm font-black text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: tc }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO — split layout ── */}
      <section className="flex-1 px-8 md:px-16 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 border"
              style={{ borderColor: `${tc}40`, backgroundColor: `${tc}10`, color: tc }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tc }} />
              Trusted by 10,000+ marketers worldwide
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-gray-900">
              Grow Your<br />
              Social Media<br />
              <span style={{ color: tc }}>On Autopilot.</span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
              {brandName} delivers real engagement for Instagram, TikTok, YouTube and more. Instant start, unbeatable prices, zero risk.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/register"
                className="px-8 py-4 rounded-2xl font-black text-white text-base hover:opacity-90 hover:scale-105 transition-all shadow-xl"
                style={{ backgroundColor: tc }}>
                Start for Free →
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-base">
                Sign In
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex gap-8">
              {[
                { n: "2.2M+", l: "Orders Delivered" },
                { n: "100+",  l: "Services" },
                { n: "99.9%", l: "Uptime" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-gray-900">{s.n}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative card stack */}
          <div className="hidden md:flex flex-col gap-4">
            {/* Order card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-900">Latest Order</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: tc }}>
                  Delivered ✓
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">📸</div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">Instagram Followers</div>
                  <div className="text-xs text-gray-400">1,000 followers · Started in 0.3s</div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: tc }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="text-3xl font-black text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-400">Live Support</div>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: tc }}>
                <div className="text-3xl font-black mb-1">⚡</div>
                <div className="text-sm font-semibold opacity-90">Instant Start</div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
              <div className="text-3xl">🔒</div>
              <div>
                <div className="font-bold text-gray-900 text-sm">100% Safe</div>
                <div className="text-xs text-gray-400">No password needed · Account-safe methods</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section className="bg-gray-50 px-8 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Every Platform. Every Metric.</h2>
            <p className="text-gray-400">One panel to manage all your social growth needs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {PLATFORMS.map((p) => (
              <div key={p.n}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4">{p.e}</div>
                <div className="font-black text-gray-900 mb-1">{p.n}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{p.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-8 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Up and running in 4 steps</h2>
            <p className="text-gray-400">Simple enough for beginners. Powerful enough for agencies.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg mx-auto mb-5 shadow-lg"
                  style={{ backgroundColor: tc }}>
                  {s.n}
                </div>
                <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-8 md:px-16 pb-20">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative"
          style={{ backgroundColor: tc }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
          </div>
          <div className="relative z-10 px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Start growing with {brandName}</h2>
              <p className="text-white/70">Free account · No credit card · Instant activation</p>
            </div>
            <Link to="/register"
              className="shrink-0 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl"
              style={{ backgroundColor: "white", color: tc }}>
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-8 md:px-16 py-6 flex items-center justify-between text-sm text-gray-400">
        <span className="font-bold text-gray-900">{brandName}</span>
        <span>&copy; {new Date().getFullYear()}. All rights reserved.</span>
      </footer>
    </div>
  );
      }
