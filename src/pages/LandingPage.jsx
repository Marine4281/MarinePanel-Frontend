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

  // Redirect reseller and child panel domains straight to login — no landing page for them
  useEffect(() => {
    if (domainType === "reseller" || domainType === "childPanel") {
      navigate("/login", { replace: true });
    }
  }, [domainType, navigate]);

  // Render nothing while redirecting to avoid flash
  if (domainType === "reseller" || domainType === "childPanel") return null;

  // ── Branding — falls back gracefully for any domain type ──
  const brandName =
    domainType === "childPanel" && childPanel?.brandName
      ? childPanel.brandName
      : domainType === "reseller" && reseller?.brandName
      ? reseller.brandName
      : "MarinePanel";

  const themeColor =
    domainType === "childPanel" && childPanel?.themeColor
      ? childPanel.themeColor
      : domainType === "reseller" && reseller?.themeColor
      ? reseller.themeColor
      : "#f97316";

  const logo =
    domainType === "childPanel" && childPanel?.logo
      ? childPanel.logo
      : domainType === "reseller" && reseller?.logo
      ? reseller.logo
      : null;

  // Derive Tailwind-compatible inline gradient from themeColor
  const heroBg = `linear-gradient(to bottom right, ${themeColor}cc, ${themeColor}88, ${themeColor}44)`;
  const cardBgA = `${themeColor}bb`;
  const cardBgB = `${themeColor}dd`;
  const footerBg = themeColor;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="flex-1 flex flex-col justify-center items-center text-center text-white px-6 py-20 relative overflow-hidden"
        style={{ background: heroBg }}
      >
        {/* Hero Illustration */}
        <div className="absolute -top-10 -left-10 opacity-20 animate-spin-slow">
          <svg width="200" height="200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Logo — shown if branding has one */}
        {logo && (
          <img
            src={logo}
            alt={`${brandName} logo`}
            className="h-16 w-16 rounded-2xl object-contain mb-4 shadow-lg"
          />
        )}

        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Welcome to {brandName}
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl drop-shadow-md">
          Grow your social media accounts effortlessly with our SMM panel. Fast, secure, and reliable services for likes, views, followers, and more.
        </p>

        {/* Buttons */}
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

        {/* Stats / Features Cards */}
        <div className="flex flex-wrap justify-center gap-8">
          <div
            className="rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: cardBgA }}
          >
            <h2 className="text-3xl font-bold text-white drop-shadow-md">2,200,000+</h2>
            <p className="text-white mt-2 text-center font-semibold">Total Orders Completed</p>
          </div>
          <div
            className="rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: cardBgB }}
          >
            <h2 className="text-3xl font-bold text-white drop-shadow-md">✔️</h2>
            <p className="text-white mt-2 text-center font-semibold">We're the Real Providers</p>
          </div>
          <div
            className="rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: cardBgA }}
          >
            <h2 className="text-3xl font-bold text-white drop-shadow-md">24/7</h2>
            <p className="text-white mt-2 text-center font-semibold">Customer Support</p>
          </div>
          <div
            className="rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: cardBgB }}
          >
            <h2 className="text-3xl font-bold text-white drop-shadow-md">💳</h2>
            <p className="text-white mt-2 text-center font-semibold">All Payments Supported</p>
          </div>
        </div>
      </section>

      {/* Sticky Footer */}
      <footer
        className="mt-auto w-full text-center py-6 text-white font-medium"
        style={{ backgroundColor: footerBg }}
      >
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </footer>

      {/* Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 30s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LandingPage;
