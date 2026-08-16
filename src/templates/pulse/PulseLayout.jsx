// src/templates/pulse/PulseLayout.jsx
//
// Pulse template shared layout.
// - Clean white/light background
// - NO top header, NO traditional footer
// - Floating pill-shaped bottom navigation bar
// - Minimal, card-based, mobile-first feel
// - A "More" sheet surfaces Services/Support/API/Logout so the
//   bottom bar itself stays at 5 items and doesn't get cramped.

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import API from "../../api/axios";
import { io } from "socket.io-client";
import { FiMoreHorizontal, FiX, FiLogOut, FiGlobe, FiHeadphones, FiCode } from "react-icons/fi";
import PulseCurrencySelector from "./PulseCurrencySelector";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const NAV = [
  { label: "Home",     to: "/home",      icon: "fas fa-home" },
  { label: "Orders",   to: "/orders",    icon: "fa-solid fa-cart-shopping" },
  { label: "Wallet",   to: "/wallet",    icon: "fas fa-wallet" },
  { label: "Reseller", to: "/resellers", icon: "fas fa-network-wired" },
  { label: "Profile",  to: "/profile",   icon: "fas fa-user" },
];

const MORE_ITEMS = [
  { label: "Services",      to: "/services",   icon: FiGlobe },
  { label: "Support",       to: "/support",    icon: FiHeadphones },
  { label: "API Access",    to: "/api-access", icon: FiCode },
];

export default function PulseLayout({ children }) {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const { formatMoney } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#6366f1",
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

  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#f8faff", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── SLIM TOP BAR ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 gap-2"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          {brand.logo ? (
            <img src={brand.logo} alt="" className="w-7 h-7 rounded-lg object-contain flex-shrink-0" />
          ) : (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: brand.color }}
            >
              {brand.name[0]}
            </div>
          )}
          <span className="font-bold text-sm text-gray-800 truncate">{brand.name}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <PulseCurrencySelector brandColor={brand.color} />

          {/* Balance */}
          <div
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: `${brand.color}14`, color: brand.color }}
          >
            {formatMoney(balance, 2)}
          </div>

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#f3f4f6", color: "#6b7280" }}
          >
            <FiMoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pt-4">{children}</div>

      {/* ── FLOATING BOTTOM NAV ── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          }}
        >
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200"
                style={{
                  background: active ? `${brand.color}15` : "transparent",
                  color: active ? brand.color : "#9ca3af",
                  minWidth: 48,
                }}
              >
                <i
                  className={`${item.icon} text-base`}
                  style={{ color: active ? brand.color : "#9ca3af" }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: active ? brand.color : "#9ca3af" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MORE SHEET ── */}
      {moreOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 space-y-1 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-black text-gray-900 text-sm">More</p>
              <button onClick={() => setMoreOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                <FiX size={16} />
              </button>
            </div>

            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                  style={{ color: "#1f2937" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brand.color}12`, color: brand.color }}>
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="px-3 text-xs text-gray-400 mb-2 truncate">{user?.email}</p>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                style={{ color: "#ef4444" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fef2f2" }}>
                  <FiLogOut size={16} />
                </div>
                <span className="text-sm font-bold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
