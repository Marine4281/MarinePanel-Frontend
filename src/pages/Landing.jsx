import React from "react";
import { Link } from "react-router-dom";

const Landing = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2144] to-[#0a3060] text-white overflow-x-hidden" style={{ fontFamily: "Poppins, sans-serif" }}>

    {/* NAV */}
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <i className="fas fa-wave-square text-white text-sm"></i>
        </div>
        <span className="font-extrabold text-lg tracking-tight">Marine<span className="text-cyan-400">Ads</span></span>
      </div>
      <div className="flex gap-3">
        <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition px-4 py-2">Login</Link>
        <Link to="/register" className="text-sm font-bold bg-cyan-500 hover:bg-cyan-400 transition text-white px-5 py-2 rounded-xl">Get Started</Link>
      </div>
    </nav>

    {/* HERO */}
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
      <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs text-cyan-300 font-semibold mb-6">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        Kenya's #1 Ad Network
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
        Advertise Smarter.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Earn Every Day.</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
        Run ads across our publisher network or earn by displaying ads on your platform. Deposits via M-Pesa. Instant setup.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition font-bold text-white px-8 py-4 rounded-2xl text-base shadow-lg shadow-cyan-500/20">
          Start for Free <i className="fas fa-arrow-right ml-2"></i>
        </Link>
        <Link to="/login" className="border border-gray-600 hover:border-cyan-500 transition font-semibold text-gray-300 px-8 py-4 rounded-2xl text-base">
          View Dashboard
        </Link>
      </div>

      {/* STATS */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "12K+", label: "Publishers" },
          { value: "KES 2M+", label: "Paid Out" },
          { value: "500+", label: "Advertisers" },
          { value: "99.9%", label: "Uptime" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-2xl font-extrabold text-cyan-400">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="bg-white/5 border-t border-white/10 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "fa-user-plus", title: "Create Account", desc: "Register with your phone number. No email verification needed." },
            { icon: "fa-money-bill-wave", title: "Deposit via M-Pesa", desc: "Top up your wallet instantly using your Safaricom M-Pesa line." },
            { icon: "fa-chart-line", title: "Run or Display Ads", desc: "Launch your campaigns or earn by hosting ads on your platform." },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${item.icon} text-cyan-400 text-xl`}></i>
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* RESELLER */}
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl p-10">
          <i className="fas fa-store text-cyan-400 text-3xl mb-4"></i>
          <h2 className="text-2xl font-extrabold mb-3">Become a Reseller</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Create your own mini ad panel. Resell our ad inventory to your clients and earn a commission on every campaign.</p>
          <Link to="/register" className="inline-block bg-cyan-500 hover:bg-cyan-400 transition font-bold text-white px-8 py-3 rounded-xl">
            Open Your Panel
          </Link>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-xs">
      © 2025 MarineAds. Built for the Kenyan market.
    </footer>
  </div>
);

export default Landing;
