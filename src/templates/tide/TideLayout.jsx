// src/templates/tide/TideLayout.jsx
//
// Tide template — classic header on top, footer on bottom.
// Professional ocean blue, clean white content area.

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import { io } from "socket.io-client";
import { FiMenu, FiX } from "react-icons/fi";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const NAV = [
  { label: "Home",     to: "/home" },
  { label: "Orders",   to: "/orders" },
  { label: "Services", to: "/services" },
  { label: "Wallet",   to: "/wallet" },
  { label: "Profile",  to: "/profile" },
];

export default function TideLayout({ children }) {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const location = useLocation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#0ea5e9",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };

  useEffect(() => {
    if (!user) return;
    API.get("/wallet").then((r) => setBalance(r.data.balance || 0)).catch(() => {});
    const socket = io(baseURL, { query: { userId: user._id } });
    socket.on("wallet:update", (d) => {
      if (d.userId === user._id) setBalance(d.balance ?? 0);
    });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f7ff", fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: brand.color,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/home" className="flex items-center gap-3">
            {brand.logo ? (
              <img src={brand.logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-sm">
                {brand.name[0]}
              </div>
            )}
            <span className="text-white font-black text-lg tracking-tight">{brand.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: active ? "rgba(255,255,255,0.2)" : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.75)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Balance */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-white/70 text-xs">Balance:</span>
              <span className="text-white text-xs font-black">${Number(balance).toFixed(2)}</span>
            </div>

            {/* Logout desktop */}
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="hidden md:block text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
            >
              Sign Out
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="md:hidden text-white"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden" style={{ background: brand.color, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-6 py-3 text-sm font-semibold border-b"
                style={{
                  color: location.pathname === item.to ? "#fff" : "rgba(255,255,255,0.7)",
                  borderColor: "rgba(255,255,255,0.1)",
                  background: location.pathname === item.to ? "rgba(255,255,255,0.1)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="block w-full text-left px-6 py-3 text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: brand.color }} className="mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {NAV.slice(0, 4).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs font-medium hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
