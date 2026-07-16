import { Link } from "react-router-dom";
import { Zap, Wallet, ShieldCheck, LineChart, Plug, Headset, ArrowRight, Star } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Orders start fast", desc: "Processing begins the moment you submit — no manual queue on our end." },
  { icon: Wallet, title: "Wholesale pricing", desc: "We work off direct provider rates, so you're rarely paying more than you need to." },
  { icon: ShieldCheck, title: "Nothing risky", desc: "No passwords, ever. We only need a link or username." },
  { icon: LineChart, title: "Live order tracking", desc: "Progress updates in your dashboard as the order runs." },
  { icon: Plug, title: "Full API access", desc: "Wire it into your own tools with our REST API." },
  { icon: Headset, title: "Real support", desc: "A person answers, not a bot loop — any time of day." },
];

const REVIEWS = [
  { name: "Marcus D.",  role: "Agency Owner",   text: "I run 12 client accounts through this panel. Saves me hours every single day." },
  { name: "Lena K.",    role: "Influencer",     text: "Prices are good. I've tried a handful of other panels and kept coming back to this one." },
  { name: "Tyler R.",   role: "Freelancer",     text: "Set up in five minutes and my first order was already moving before I refreshed the page." },
];

export default function BoldLanding({ brandName, themeColor, logo }) {
  const tc = themeColor || "#f97316";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-9 w-9 rounded-xl object-contain" />
            : <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white"
                style={{ backgroundColor: tc }}>{brandName[0]}</div>
          }
          <span className="font-black text-xl">{brandName}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
            Log in
          </Link>
          <Link to="/register"
            className="text-sm font-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all"
            style={{ backgroundColor: tc }}>
            Sign up free
          </Link>
        </div>
      </nav>

      {/* ── HERO — editorial / magazine ── */}
      <section className="px-8 md:px-16 pt-12 pb-0 border-b-4 border-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 w-12 rounded" style={{ backgroundColor: tc }} />
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: tc }}>
              SMM Panel
            </span>
          </div>

          {/* Giant headline */}
          <h1 className="text-7xl md:text-[120px] font-black leading-none tracking-tight mb-8 text-gray-900">
            SOCIAL<br />
            MEDIA<br />
            <span style={{ WebkitTextStroke: `3px ${tc}`, color: "transparent" }}>GROWTH.</span>
          </h1>

          {/* Sub + CTA row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12">
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              {brandName} is built for people who order in volume — agencies, resellers, and anyone tired of paying retail for social growth.
            </p>
            <div className="flex gap-4 shrink-0">
              <Link to="/register"
                className="px-8 py-4 rounded-xl font-black text-white text-base hover:opacity-90 transition-all shadow-xl inline-flex items-center gap-2"
                style={{ backgroundColor: tc }}>
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-xl font-black text-gray-900 text-base border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                Sign In
              </Link>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-4 border-t-2 border-gray-900">
            {[
              { n: "2.2M+",  l: "Orders Completed" },
              { n: "100+",   l: "Services Available" },
              { n: "0.4s",   l: "Avg Start Time" },
              { n: "99.9%",  l: "Platform Uptime" },
            ].map((s, i) => (
              <div key={s.l}
                className={`py-6 px-4 ${i < 3 ? "border-r-2 border-gray-900" : ""}`}>
                <div className="text-3xl font-black" style={{ color: tc }}>{s.n}</div>
                <div className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="px-8 md:px-16 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <h2 className="text-4xl font-black text-gray-900">Why {brandName}?</h2>
            <Link to="/register" className="hidden md:block text-sm font-bold hover:underline" style={{ color: tc }}>
              See all features →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-white rounded-2xl p-7 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group">
                <div className="mb-5" style={{ color: tc }}>
                  <f.icon size={34} strokeWidth={1.75} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2 group-hover:text-opacity-80">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM MARQUEE ROW ── */}
      <section className="px-8 md:px-16 py-12 border-y-2 border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-8 rounded" style={{ backgroundColor: tc }} />
            <span className="text-xs font-black tracking-widest uppercase text-gray-400">Supported Platforms</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "Telegram", "Pinterest", "LinkedIn", "Spotify", "Snapchat", "Discord", "Twitch"].map((p) => (
              <span key={p}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-8 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-14">What people say after using it.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl p-7 border-2 border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex gap-1 mb-4" style={{ color: tc }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} fill={tc} strokeWidth={0} />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">"{r.text}"</p>
                <div>
                  <div className="font-black text-gray-900 text-sm">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── big editorial block ── */}
      <section className="px-8 md:px-16 pb-20">
        <div className="max-w-6xl mx-auto rounded-3xl p-12 md:p-16 relative overflow-hidden border-2"
          style={{ backgroundColor: tc, borderColor: tc }}>
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <div className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4">Free to start</div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Your growth<br />starts now.
              </h2>
            </div>
            <Link to="/register"
              className="shrink-0 px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl inline-flex items-center gap-2"
              style={{ backgroundColor: "white", color: tc }}>
              Create Account <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-gray-900 px-8 md:px-16 py-6 flex items-center justify-between text-sm">
        <span className="font-black text-gray-900">{brandName}</span>
        <span className="text-gray-400">&copy; {new Date().getFullYear()}. All rights reserved.</span>
      </footer>
    </div>
  );
                }
