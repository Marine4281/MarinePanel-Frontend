// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center 
        bg-gradient-to-br from-orange-400 via-orange-300 to-yellow-200 
        text-white px-6 py-20 relative overflow-hidden">

        {/* Hero Illustration */}
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

        {/* Stats / Features Cards */}
        <div className="flex flex-wrap justify-center gap-8">
          <div className="bg-orange-500 rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">2,200,000+</h2>
            <p className="text-white mt-2 text-center font-semibold">Total Orders Completed</p>
          </div>
          <div className="bg-orange-600 rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">✔️</h2>
            <p className="text-white mt-2 text-center font-semibold">We’re the Real Providers</p>
          </div>
          <div className="bg-orange-500 rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">24/7</h2>
            <p className="text-white mt-2 text-center font-semibold">Customer Support</p>
          </div>
          <div className="bg-orange-600 rounded-2xl p-6 w-48 flex flex-col items-center animate-float shadow-2xl hover:scale-110 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">💳</h2>
            <p className="text-white mt-2 text-center font-semibold">All Payments Supported</p>
          </div>
        </div>
      </section>

      {/* Sticky Footer */}
      <footer className="mt-auto w-full text-center py-6 bg-orange-500 text-white font-medium">
        &copy; 2026 MarinePanel. All rights reserved.
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
