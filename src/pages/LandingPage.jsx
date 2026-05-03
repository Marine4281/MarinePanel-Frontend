// src/pages/LandingPage.jsx
//
// Main platform landing page.
// On child panel domains → redirects immediately to /login
// so users land directly on the branded login page.
// Child panel owners can later set a custom landing page
// style from Settings (the login page IS their landing page).

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

  // Child panel domain — redirect to login immediately
  // The login page is the landing page for child panel users
  useEffect(() => {
    if (domainType === "childPanel") {
      navigate("/login", { replace: true });
    }
  }, [domainType, navigate]);

  // Show nothing while redirecting
  if (domainType === "childPanel") return null;

  const brandName = reseller?.brandName || "MarinePanel";
  const themeColor = reseller?.themeColor || "#f97316";
  const logo = reseller?.logo || null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${themeColor}80, ${themeColor}50, ${themeColor}20)`,
          color: "#fff",
        }}
      >
        {/* Decorative ring */}
        <div className="absolute -top-10 -left-10 opacity-20 animate-spin-slow">
          <svg width="200" height="200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Logo + Brand Name */}
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

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <Link
            to="/login"
            className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:bg-orange-100 transition duration-300 transform hover:-translate-y-1"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-orange-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:bg-orange-800 transition duration-300 transform hover:-translate-y-1"
          >
            Register
          </Link>
        </div>

        {/* Stats cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { value: "2,200,000+", label: "Total Orders Completed", bg: "bg-orange-500" },
            { value: "✔️", label: "We're the Real Providers", bg: "bg-orange-600" },
            { value: "24/7", label: "Customer Support", bg: "bg-orange-500" },
            { value: "💳", label: "All Payments Supported", bg: "bg-orange-600" },
          ].map(({ value, label, bg }) => (
            <div
              key={label}
              className={`${bg} rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300`}
            >
              <h2 className="text-3xl font-bold text-white drop-shadow-md">
                {value}
              </h2>
              <p className="text-white mt-2 text-center font-semibold">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
