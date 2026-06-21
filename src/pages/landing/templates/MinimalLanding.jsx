// src/pages/landing/templates/MinimalLanding.jsx
import { Link } from "react-router-dom";

export default function MinimalLanding({ brandName, themeColor, logo }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {logo
            ? <img src={logo} alt={brandName} className="h-8 w-8 rounded-lg object-contain" />
            : <div className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: themeColor }}>{brandName[0]}</div>
          }
          <span className="font-bold text-gray-900">{brandName}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Log in</Link>
          <Link to="/register" className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90" style={{ backgroundColor: themeColor }}>
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight max-w-3xl">
          The SMM panel that just works
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
          {brandName} delivers fast, affordable social media growth services. No fluff, no delays — just results.
        </p>

        <div className="flex gap-3">
          <Link to="/register" className="px-7 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: themeColor }}>
            Get started →
          </Link>
          <Link to="/login" className="px-7 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
            Log in
          </Link>
        </div>

        {/* Simple checklist */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { title: "Instant delivery", desc: "Orders processed automatically with no delays." },
            { title: "Transparent pricing", desc: "No hidden fees. Pay only for what you order." },
            { title: "All platforms", desc: "Instagram, TikTok, YouTube, Twitter, and more." },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 text-white font-bold text-xs" style={{ backgroundColor: themeColor }}>✓</div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 px-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
        <span>&copy; {new Date().getFullYear()} {brandName}</span>
        <span>All rights reserved.</span>
      </footer>
    </div>
  );
}
