// src/templates/aurora/AuroraLayout.jsx
//
// Shared layout for all Aurora template pages.
// - No top header, no footer
// - Full-screen dark gradient background
// - Hidden slide-in drawer triggered by ≡ (hamburger) button
// - Drawer overlays content from the left
// - Wallet balance shown as a pill in the top-right corner
// - Reseller link added so child panel users can access API + Reseller Panel

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import { io } from "socket.io-client";
import {
  FiMenu, FiX, FiHome, FiShoppingBag, FiList,
  FiUser, FiLogOut, FiGlobe, FiCode, FiDollarSign,
  FiShare2,
} from "react-icons/fi";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const NAV = [
  { label: "Home",     to: "/home",      icon: <FiHome size={18} /> },
  { label: "Orders",   to: "/orders",    icon: <FiList size={18} /> },
  { label: "Services", to: "/services",  icon: <FiGlobe size={18} /> },
  { label: "Wallet",   to: "/wallet",    icon: <FiDollarSign size={18} /> },
  { label: "Reseller", to: "/resellers", icon: <FiShare2 size={18} /> },
  { label: "API",      to: "/api-access", icon: <FiCode size={18} /> },
  { label: "Profile",  to: "/profile",   icon: <FiUser size={18} /> },
];

export default function AuroraLayout({ children }) {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  const brand = {
    name:  childPanel?.brandName  || "Panel",
    color: childPanel?.themeColor || "#a78bfa",
    logo:  childPanel?.logo       || null,
  };

  // Fetch + live wallet
  useEffect(() => {
    if (!user) return;
    API.get("/wallet").then((r) => setBalance(r.data.balance || 0)).catch(() => {});
    const socket = io(baseURL, { query: { userId: user._id } });
    socket.on("wallet:update", (d) => {
      if (d.userId === user._id) setBalance(d.balance ?? 0);
    });
    return () => socket.disconnect();
  }, [user]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── TOP BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3">
        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}
        >
          <FiMenu size={20} color="#e2e8f0" />
        </button>

        {/* Brand center */}
        <div className="flex items-center gap-2">
          {brand.logo && (
            <img src={brand.logo} alt="" className="w-6 h-6 rounded object-contain" />
          )}
          <span className="font-bold text-sm" style={{ color: brand.color }}>
            {brand.name}
          </span>
        </div>

        {/* Balance pill */}
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(167,139,250,0.15)",
            color: brand.color,
            border: `1px solid ${brand.color}40`,
          }}
        >
          ${Number(balance).toFixed(2)}
        </div>
      </div>

      {/* ── DRAWER OVERLAY ── */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── DRAWER ── */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 270,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          background: "linear-gradient(180deg, #1a1730 0%, #0f0c29 100%)",
          borderRight: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
          <div className="flex items-center gap-2">
            {brand.logo && (
              <img src={brand.logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
            )}
            <span className="font-bold text-base" style={{ color: brand.color }}>
              {brand.name}
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(167,139,250,0.10)" }}>
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            <div
              className="mt-2 inline-block text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: `${brand.color}22`, color: brand.color }}
            >
              ${Number(balance).toFixed(2)} balance
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
                style={{
                  background: active ? `${brand.color}22` : "transparent",
                  color: active ? brand.color : "#94a3b8",
                  borderLeft: active ? `3px solid ${brand.color}` : "3px solid transparent",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(167,139,250,0.12)" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <FiLogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="pt-16 pb-6 px-4 min-h-screen">
        {children}
      </div>
    </div>
  );
        }
