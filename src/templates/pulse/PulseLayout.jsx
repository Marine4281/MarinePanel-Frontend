// src/templates/pulse/PulseLayout.jsx
//
// Pulse template shared layout.
// - Clean white/light background
// - NO top header, NO traditional footer
// - Floating pill-shaped bottom navigation bar
// - Minimal, card-based, mobile-first feel

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import { io } from "socket.io-client";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const NAV = [
  { label: "Home",     to: "/home",     icon: "fas fa-home" },
  { label: "Orders",   to: "/orders",   icon: "fa-solid fa-cart-shopping" },
  { label: "Wallet",   to: "/wallet",   icon: "fas fa-wallet" },
  { label: "Services", to: "/services", icon: "fas fa-list" },
  { label: "Profile",  to: "/profile",  icon: "fas fa-user" },
];

export default function PulseLayout({ children }) {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const location = useLocation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);

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

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#f8faff", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── SLIM TOP BAR ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          {brand.logo ? (
            <img src={brand.logo} alt="" className="w-7 h-7 rounded-lg object-contain" />
          ) : (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ background: brand.color }}
            >
              {brand.name[0]}
            </div>
          )}
          <span className="font-bold text-sm text-gray-800">{brand.name}</span>
        </div>

        {/* Balance */}
        <div
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: `${brand.color}14`, color: brand.color }}
        >
          ${Number(balance).toFixed(2)}
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
    </div>
  );
}
