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

  useEffect(() => {
    if (domainType === "childPanel" || domainType === "reseller") {
      navigate("/login", { replace: true });
    }
  }, [domainType, navigate]);

  // Render nothing while redirecting to avoid flash
  if (domainType === "childPanel" || domainType === "reseller") return null;

  const brandName  = reseller?.brandName  || "MarinePanel";
  const themeColor = reseller?.themeColor || "#f97316";
  const logo       = reseller?.logo       || null;

  return (
    <div className="min-h-screen flex flex-col">
      <section
        className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${themeColor}80, ${themeColor}50, ${themeColor}20)`,
          color: "#fff",
        }}
      >
        <div className="absolute -top-10 -left-10 opacity-20 animate-spin-slow">
          <svg width="200" height="200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <div className="flex items-center justify-center mb-6">
          {logo && <img src={logo} alt="Logo" className="h-12 mr-4" />}
          <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg">
            Welcome to {brandName}
          </h1>
        </div>

        <p className="text-lg md:text-xl mb-10 max-w-2xl drop-shadow-md">
          Grow your social media accounts effortlessly with our SMM panel.
          Fast, secure, and reliable services for likes, views, followers, and more.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/login"
            className="px-8 py-3 rounded-full font-semibold text-white text-lg shadow-lg transition hover:scale-105"
            style={{ backgroundColor: themeColor }}
          >
            Get Started
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition hover:scale-105 bg-white"
            style={{ color: themeColor }}
          >
            Register
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
