// src/templates/neon/NeonLayout.jsx
//
// Neon template — persistent left sidebar, dark background, glowing neon accents.
// Sidebar is a real flex sibling (not position:fixed), so no manual margin-push
// hack is needed and the reveal breakpoint matches Tide's (md, 768px).

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import API from "../../api/axios";
import { io } from "socket.io-client";
import {
  FiHome, FiList, FiDollarSign, FiGlobe, FiUser,
  FiCode, FiLogOut, FiMenu, FiX, FiShare2, FiHeadphones,
} from "react-icons/fi";
import NeonCurrencySelector from "./NeonCurrencySelector";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const NAV = [
  { label: "Home",     to: "/home",       icon: <FiHome size={17} /> },
  { label: "Orders",   to: "/orders",     icon: <FiList size={17} /> },
  { label: "Wallet",   to: "/wallet",     icon: <FiDollarSign size={17} /> },
  { label: "Services", to: "/services",   icon: <FiGlobe size={17} /> },
  { label: "Reseller", to: "/resellers",  icon: <FiShare2 size={17} /> },
  { label: "Support",  to: "/support",    icon: <FiHeadphones size={17} /> },
  { label: "API",      to: "/api-access", icon: <FiCode size={17} /> },
  { label: "Profile",  to: "/profile",    icon: <FiUser size={17} /> },
];

const SIDEBAR_W = 220;

export default function NeonLayout({ children }) {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const { formatMoney } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#00ff88",
    name:  childPanel?.brandName  || "Panel",
    logo:  childPanel?.logo       || null,
  };

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
        background: "#101018",
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
          className="font-black text-sm tracking-tight truncate"
          style={{ color: neon, textShadow: `0 0 12px ${neon}88` }}
        >
          {brand.name}
        </span>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto flex-shrink-0" style={{ color: neon }}>
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Balance + currency */}
      <div className="px-5 py-3 space-y-2" style={{ borderBottom: `1px solid ${neon}12` }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "#5c5c82" }}>Balance</p>
          <NeonCurrencySelector brandColor={neon} compact />
        </div>
        <p
          className="text-lg font-black"
          style={{ color: neon, textShadow: `0 0 10px ${neon}66` }}
        >
          {formatMoney(balance, 2)}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold"
              style={{
                background: active ? `${neon}14` : "transparent",
                color: active ? neon : "#6c6c92",
                boxShadow: active ? `inset 0 0 16px ${neon}10` : "none",
                border: `1px solid ${active ? neon + "30" : "transparent"}`,
              }}
            >
              <span style={{ color: active ? neon : "#5c5c82", filter: active ? `drop-shadow(0 0 6px ${neon})` : "none" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4" style={{ borderTop: `1px solid ${neon}12` }}>
        <p className="text-xs px-4 mb-3 truncate" style={{ color: "#5c5c82" }}>{user?.email}</p>
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
      style={{ background: "#15151f", color: "#c4c4e0", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Desktop sidebar — real flex sibling, no position:fixed, no manual margin hack */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex flex-col" style={{ width: 260 }}>
            <Sidebar mobile />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile topbar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{
            background: "#101018",
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
            {formatMoney(balance, 2)}
          </span>
        </div>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div style={{ maxWidth: 860, marginLeft: "auto", marginRight: "auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
