// src/pages/LandingPage.jsx

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  // Reseller and child panel domains skip the landing page entirely
  useEffect(() => {
    if (domainType === "reseller" || domainType === "childPanel") {
      navigate("/login", { replace: true });
    }
  }, [domainType, navigate]);

  if (domainType === "reseller" || domainType === "childPanel") return null;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── NAVBAR ── */}
      <nav className="w-full flex items-center justify-between px-6 md:px-16 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
          >
            M
          </div>
          <span className="text-lg font-bold text-gray-900">MarinePanel</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors px-4 py-2 rounded-xl hover:bg-orange-50"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", boxShadow: "0 4px 14px #f9731640" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 relative overflow-hidden">
        {/* Soft background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl" style={{ background: "#f97316" }} />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl" style={{ background: "#6366f1" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.03] blur-3xl" style={{ background: "#f97316" }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          Trusted by 10,000+ resellers worldwide
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6 max-w-4xl">
          The Smartest{" "}
          <span
            className="relative"
            style={{ color: "#f97316" }}
          >
            SMM Platform
          </span>
          <br />
          for Serious Resellers
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Grow any social media account with instant delivery, industry-lowest prices,
          and a complete white-label reseller &amp; child panel ecosystem — all in one place.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="text-base font-bold text-white px-8 py-4 rounded-2xl transition hover:opacity-90 hover:scale-[1.02] shadow-lg"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", boxShadow: "0 8px 24px #f9731640" }}
          >
            Start for Free →
          </Link>
          <Link
            to="/login"
            className="text-base font-semibold text-gray-600 bg-white px-8 py-4 rounded-2xl border border-gray-200 hover:border-orange-200 hover:text-orange-500 transition shadow-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-10 text-center">
          {[
            { value: "2.2M+",  label: "Orders Completed" },
            { value: "10K+",   label: "Active Resellers" },
            { value: "24/7",   label: "Customer Support" },
            { value: "99.9%",  label: "Uptime" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

      {/* ── FEATURES ── */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Everything you need to scale
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              One platform. Full control. Built for growth at every level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                emoji: "🏪",
                title: "Reseller Panel",
                desc: "Launch your own branded SMM panel with a custom domain, logo, and theme. Manage users and pricing independently.",
                color: "#f97316",
              },
              {
                emoji: "🧩",
                title: "Child Panel",
                desc: "Create isolated sub-panels under your account — each with its own domain, branding, and user base.",
                color: "#6366f1",
              },
              {
                emoji: "⚡",
                title: "Instant Delivery",
                desc: "Orders are processed in seconds, around the clock. No delays, no excuses.",
                color: "#10b981",
              },
              {
                emoji: "💰",
                title: "Cheapest Prices",
                desc: "Industry-lowest rates with bulk discounts. Maximise your profit margin on every single order.",
                color: "#f59e0b",
              },
              {
                emoji: "💳",
                title: "All Payment Gateways",
                desc: "M-Pesa, MTN MoMo, Airtel Money, Crypto, Visa/Mastercard, PayPal, Stripe, Payeer and more.",
                color: "#ec4899",
              },
              {
                emoji: "🔒",
                title: "Secure & Private",
                desc: "Enterprise-grade security. Your data and your customers' data are always protected.",
                color: "#3b82f6",
              },
            ].map(({ emoji, title, desc, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: `${color}12` }}
                >
                  {emoji}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENTS STRIP ── */}
      <section className="px-6 md:px-16 py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
            Accepted Payment Methods
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["M-Pesa", "MTN MoMo", "Airtel Money", "Crypto", "Visa / Mastercard", "PayPal", "Stripe", "Payeer", "PerfectMoney", "CoinGate"].map((m) => (
              <span
                key={m}
                className="text-sm font-medium text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-6 md:px-16 py-20">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fff 50%, #fef3c7 100%)", border: "1px solid #fed7aa" }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-3xl" style={{ background: "#f97316" }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: "#f59e0b" }} />

          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 relative z-10">
            Ready to grow your business?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto relative z-10">
            Join thousands of resellers already earning with MarinePanel.
            Free account. Instant activation. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              to="/register"
              className="text-base font-bold text-white px-8 py-4 rounded-2xl transition hover:opacity-90 hover:scale-[1.02] shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", boxShadow: "0 8px 24px #f9731640" }}
            >
              Create Free Account →
            </Link>
            <Link
              to="/login"
              className="text-base font-semibold text-orange-500 bg-white px-8 py-4 rounded-2xl border border-orange-200 hover:bg-orange-50 transition shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-auto w-full border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
            >
              M
            </div>
            <span className="font-bold text-gray-800">MarinePanel</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MarinePanel. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm text-gray-400">
            <Link to="/terms-public" className="hover:text-orange-500 transition-colors">Terms</Link>
            <a href="mailto:support@marinepanel.online" className="hover:text-orange-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;
