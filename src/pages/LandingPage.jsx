// src/pages/LandingPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReseller }   from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import PanelLandingPage from "./landing/PanelLandingPage";

const LandingPage = () => {
  const navigate = useNavigate();
  const { reseller }   = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  // ── Unknown domain ───────────────────────────────────────────────
  if (domainType === "unknown") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", flexDirection:"column", background:"#0f172a",
        color:"#f1f5f9", textAlign:"center", padding:"2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Panel Not Found</h1>
        <p style={{ color:"#94a3b8", maxWidth:400 }}>
          This domain is not registered on MarinePanel. If you are the panel owner, please contact platform support.
        </p>
      </div>
    );
  }

  // ── Backend unreachable ──────────────────────────────────────────
  if (domainType === "unreachable") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", flexDirection:"column", background:"#0f172a",
        color:"#f1f5f9", textAlign:"center", padding:"2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>⚠️</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Service Unavailable</h1>
        <p style={{ color:"#94a3b8", maxWidth:400, marginBottom:"1.5rem" }}>
          We could not reach the server. This is usually a temporary issue. Please wait a moment and refresh the page.
        </p>
        <button onClick={() => window.location.reload()}
          style={{ padding:"0.6rem 1.5rem", background:"#f97316", color:"#fff",
            border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:"0.95rem" }}>
          Retry
        </button>
      </div>
    );
  }

  // ── Child panel landing ──────────────────────────────────────────
  if (domainType === "childPanel" && childPanel) {
    return (
      <PanelLandingPage
        brandName={childPanel.brandName}
        themeColor={childPanel.themeColor}
        logo={childPanel.logo}
        landingTemplate={childPanel.landingTemplate || "default"}
      />
    );
  }

  // ── Reseller landing ─────────────────────────────────────────────
  if (domainType === "reseller" && reseller) {
    return (
      <PanelLandingPage
        brandName={reseller.brandName}
        themeColor={reseller.themeColor}
        logo={reseller.logo}
        landingTemplate={reseller.landingTemplate || "default"}
      />
    );
  }

  // ── Still loading (context not ready yet) — render nothing to avoid flash ──
  if (domainType === "childPanel" || domainType === "reseller") return null;

  // ── Platform domain — original landing page ──────────────────────
  const themeColor = "#f97316";
  const heroBg   = `linear-gradient(to bottom right, ${themeColor}cc, ${themeColor}88, ${themeColor}44)`;
  const cardBgA  = `${themeColor}bb`;
  const cardBgB  = `${themeColor}dd`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section
        className="flex-1 flex flex-col justify-center items-center text-center text-white px-6 py-20 relative overflow-hidden"
        style={{ background: heroBg }}
      >
        <div className="absolute -top-10 -left-10 opacity-20 animate-spin-slow">
          <svg width="200" height="200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Welcome to MarinePanel
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl drop-shadow-md">
          Grow your social media accounts effortlessly with our SMM panel. Fast, secure, and reliable services for likes, views, followers, and more.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <Link
            to="/login"
            className="bg-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:opacity-90 transition duration-300 transform hover:-translate-y-1"
            style={{ color: themeColor }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:opacity-90 transition duration-300 transform hover:-translate-y-1"
            style={{ backgroundColor: `${themeColor}99`, border: "1px solid rgba(255,255,255,0.3)" }}
          >
            Register
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            { val: "2,200,000+", label: "Total Orders Completed", bg: cardBgA },
            { val: "✔️",         label: "We're the Real Providers", bg: cardBgB },
            { val: "24/7",       label: "Customer Support",         bg: cardBgA },
            { val: "💳",         label: "All Payments Supported",   bg: cardBgB },
          ].map((c) => (
            <div key={c.label}
              className="rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: c.bg }}>
              <h2 className="text-3xl font-bold text-white drop-shadow-md">{c.val}</h2>
              <p className="text-white mt-2 text-center font-semibold">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto w-full text-center py-6 text-white font-medium"
        style={{ backgroundColor: themeColor }}>
        &copy; {new Date().getFullYear()} MarinePanel. All rights reserved.
      </footer>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes spin-slow { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;
