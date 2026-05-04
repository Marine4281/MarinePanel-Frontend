// src/templates/neon/NeonLayout.jsx
//
// Neon template — persistent left sidebar, dark background,
// glowing neon accents. No floating nav, no top header bar.

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import { io } from "socket.io-client";
import {
  FiHome, FiList, FiDollarSign, FiGlobe, FiUser,
  FiCode, FiLogOut, FiMenu, FiX,
} from "react-icons/fi";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const NAV = [
  { label: "Home",     to: "/home",       icon: <FiHome size={17} /> },
  { label: "Orders",   to: "/orders",     icon: <FiList size={17} /> },
  { label: "Wallet",   to: "/wallet",     icon: <FiDollarSign size={17} /> },
  { label: "Services", to: "/services",   icon: <FiGlobe size={17} /> },
  { label: "API",      to: "/api-access", icon: <FiCode size={17} /> },
  { label: "Profile",  to: "/profile",    icon: <FiUser size={17} /> },
];

const SIDEBAR_W = 220;

export default function NeonLayout({ children }) {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const location = useLocation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#00ff88",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };

  // Use a neon-ified version of the theme color for glow
  const neon = brand.color;

  useEffect(() => {
    if (!user) return;
    API.get("/wallet").then((r) => setBalance(r.data.balance || 0)).catch(() => {});
    const socket = io(baseURL, { query: { userId: user._id } });
    socket.on("wallet:update", (d) => {
      if (d.userId === user._id) setBalance(d.balance ?? 0);
    });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const Sidebar = ({ mobile = false }) => (
    <div
      className="flex flex-col h-full"
      style={{
        width: mobile ? "100%" : SIDEBAR_W,
        background: "#080810",
        borderRight: `1px solid ${neon}22`,
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: `1px solid ${neon}18` }}
      >
        {brand.logo ? (
          <img src={brand.logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{
              background: `${neon}18`,
              color: neon,
              boxShadow: `0 0 12px ${neon}44`,
              border: `1px solid ${neon}44`,
            }}
          >
            {brand.name[0]}
          </div>
        )}
        <span
          className="font-black text-sm tracking-tight"
          style={{ color: neon, textShadow: `0 0 12px ${neon}88` }}
        >
          {brand.name}
        </span>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto" style={{ color: neon }}>
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Balance */}
      <div className="px-5 py-3" style={{ borderBottom: `1px solid ${neon}10` }}>
        <p className="text-xs" style={{ color: `${neon}66` }}>Balance</p>
        <p
          className="text-lg font-black"
          style={{ color: neon, textShadow: `0 0 16px ${neon}88` }}
        >
          ${Number(balance).toFixed(2)}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? `${neon}14` : "transparent",
                color: active ? neon : "#4a4a6a",
                boxShadow: active ? `inset 0 0 16px ${neon}10` : "none",
                border: `1px solid ${active ? neon + "30" : "transparent"}`,
              }}
            >
              <span style={{ color: active ? neon : "#3a3a5a", filter: active ? `drop-shadow(0 0 6px ${neon})` : "none" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4" style={{ borderTop: `1px solid ${neon}12` }}>
        <p className="text-xs px-4 mb-3 truncate" style={{ color: "#3a3a5a" }}>{user?.email}</p>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ color: "#f87171" }}
        >
          <FiLogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0a14", color: "#c4c4e0", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-30" style={{ width: SIDEBAR_W }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex flex-col"
            style={{ width: 260 }}
          >
            <Sidebar mobile />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 0 }}
      >
        {/* Mobile topbar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{
            background: "#080810",
            borderBottom: `1px solid ${neon}18`,
          }}
        >
          <button onClick={() => setMobileOpen(true)} style={{ color: neon }}>
            <FiMenu size={20} />
          </button>
          <span className="font-black text-sm" style={{ color: neon, textShadow: `0 0 10px ${neon}88` }}>
            {brand.name}
          </span>
          <span
            className="text-xs font-black px-3 py-1 rounded-full"
            style={{ background: `${neon}14`, color: neon, border: `1px solid ${neon}33` }}
          >
            ${Number(balance).toFixed(2)}
          </span>
        </div>

        {/* Page */}
        <main
          className="flex-1 p-4 lg:p-6 overflow-y-auto"
          style={{ paddingLeft: undefined }}
        >
          <div style={{ maxWidth: 860, marginLeft: "auto", marginRight: "auto" }}>
            {children}
          </div>
        </main>
      </div>

      {/* Desktop left margin */}
      <style>{`
        @media (min-width: 1024px) {
          main { margin-left: ${SIDEBAR_W}px; }
        }
      `}</style>
    </div>
  );
          }
