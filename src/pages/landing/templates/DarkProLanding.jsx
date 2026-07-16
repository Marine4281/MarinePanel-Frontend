// src/pages/landing/templates/DarkProLanding.jsx
import { Link } from "react-router-dom";
import { Zap, KeyRound, Settings2, ArrowRight, Terminal } from "lucide-react";

const PLATFORMS = [
  { name: "Instagram", handle: "@instagram" },
  { name: "TikTok",   handle: "@tiktok" },
  { name: "YouTube",  handle: "youtube.com" },
  { name: "Twitter",  handle: "@twitter" },
  { name: "Facebook", handle: "facebook.com" },
  { name: "Telegram", handle: "t.me" },
  { name: "Spotify",  handle: "spotify.com" },
  { name: "LinkedIn", handle: "linkedin.com" },
];

export default function DarkProLanding({ brandName, themeColor, logo }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b10] text-white font-mono">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-8 w-8 rounded-lg object-contain" />
            : <div className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-black text-sm" style={{ backgroundColor: themeColor }}>{brandName[0]}</div>
          }
          <span className="font-bold tracking-widest text-sm uppercase text-white/80">{brandName}</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="text-xs px-5 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all tracking-widest uppercase">Login</Link>
          <Link to="/register" className="text-xs px-5 py-2.5 rounded-lg font-bold tracking-widest uppercase transition-all hover:opacity-80 inline-flex items-center gap-1.5" style={{ backgroundColor: themeColor, color: "#000" }}>
            Start <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex-1 px-8 py-20 md:py-32 max-w-6xl mx-auto w-full">
        {/* terminal header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-white/20 tracking-widest">~/smm/{brandName.toLowerCase().replace(/\s/g, "-")}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs tracking-widest text-white/30 uppercase mb-4 font-sans flex items-center gap-2">
              <Terminal size={12} style={{ color: themeColor }} /> System online, all services running
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 font-sans">
              Automate it.<br />
              Scale it up.<br />
              <span style={{ color: themeColor }}>Keep it running.</span>
            </h1>

            <p className="text-white/40 leading-relaxed mb-8 font-sans text-sm max-w-sm">
              {brandName} is an SMM panel built for people who order in bulk — agencies, freelancers, and resellers who need it to just work.
            </p>

            <div className="flex gap-3">
              <Link to="/register"
                className="px-7 py-3.5 rounded-xl font-bold text-black text-sm font-sans hover:opacity-90 transition-all"
                style={{ backgroundColor: themeColor }}>
                Create an account
              </Link>
              <Link to="/login"
                className="px-7 py-3.5 rounded-xl font-bold text-sm font-sans border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-1.5">
                Login <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Live stats panel */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="text-xs text-white/20 tracking-widest uppercase mb-2">// live stats</div>
            {[
              { key: "total_orders",    val: "2,247,891",  delta: "+1,204 today" },
              { key: "active_services", val: "148",         delta: "across 8 platforms" },
              { key: "avg_start_time",  val: "0.4s",        delta: "last 24h avg" },
              { key: "uptime",          val: "99.97%",      delta: "30-day window" },
            ].map((r) => (
              <div key={r.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-white/30 text-xs">{r.key}</span>
                  <span className="text-white/10 text-xs"> = </span>
                  <span className="font-bold text-sm font-sans" style={{ color: themeColor }}>{r.val}</span>
                </div>
                <span className="text-xs text-white/20">{r.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS GRID ── */}
      <section className="border-t border-white/5 px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs text-white/20 tracking-widest uppercase mb-8 font-mono">// supported_platforms[]</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORMS.map((p) => (
              <div key={p.name}
                className="border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group cursor-default">
                <div className="font-bold text-sm text-white/70 group-hover:text-white transition-colors font-sans">{p.name}</div>
                <div className="text-xs text-white/20 mt-1 font-mono">{p.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ROW ── */}
      <section className="border-t border-white/5 px-8 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {[
            { label: "Fast start",         desc: "Orders begin processing in under a second, most of the time",  icon: Zap },
            { label: "No password needed", desc: "Just your profile URL — nothing you'd need to keep secret",   icon: KeyRound },
            { label: "API access",         desc: "A full REST API if you want to automate or build on top of it", icon: Settings2 },
          ].map((f) => (
            <div key={f.label} className="bg-[#080b10] p-8 hover:bg-white/[0.02] transition-all">
              <div className="mb-4" style={{ color: themeColor }}><f.icon size={26} strokeWidth={1.75} /></div>
              <div className="font-bold text-white/80 mb-2 font-sans text-sm">{f.label}</div>
              <div className="text-xs text-white/30 leading-relaxed font-sans">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/5 px-8 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-xs text-white/20 tracking-widest uppercase mb-4 font-mono">// ready when you are</div>
          <h2 className="text-3xl font-black mb-4 font-sans">Takes about a minute to set up.</h2>
          <p className="text-white/30 text-sm mb-8 font-sans">Free account, no credit card, full access to every service.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-black text-black hover:opacity-90 transition-all font-sans"
            style={{ backgroundColor: themeColor }}>
            Create Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-5 flex items-center justify-between text-xs text-white/20 font-mono">
        <span>{brandName} · SMM Panel</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
