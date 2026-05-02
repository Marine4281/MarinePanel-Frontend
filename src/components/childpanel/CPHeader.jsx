// src/components/childpanel/CPHeader.jsx
//
// Header shown to end users on a child panel domain.
// Mirrors Header.jsx but uses child panel branding
// instead of reseller branding.
// Shows: brand logo + name, nav links, wallet balance.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import API from "../../api/axios";
import { io } from "socket.io-client";
import { FiMenu, FiX } from "react-icons/fi";

export default function CPHeader() {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = {
    brandName: childPanel?.brandName || "Panel",
    logo: childPanel?.logo || null,
    themeColor: childPanel?.themeColor || "#1e40af",
  };

  // Fetch wallet balance
  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      try {
        const res = await API.get("/wallet");
        setBalance(res.data.balance || 0);
      } catch {
        setBalance(0);
      }
    };

    fetchBalance();

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      { query: { userId: user._id } }
    );

    socket.on("wallet:update", (data) => {
      if (data.userId === user?._id) {
        setBalance(data.balance ?? 0);
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const navLinks = user
    ? [
        { to: "/home", label: "New Order" },
        { to: "/orders", label: "Orders" },
        { to: "/wallet", label: "Wallet" },
        { to: "/services", label: "Services" },
        { to: "/profile", label: "Profile" },
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];

  return (
    <nav
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: brand.themeColor }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          {brand.logo && (
            <img
              src={brand.logo}
              alt="logo"
              className="h-8 w-8 rounded object-contain bg-white/20 p-0.5"
            />
          )}
          <span className="text-white font-bold text-lg truncate max-w-[160px]">
            {brand.brandName}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              {label}
            </Link>
          ))}

          {user && (
            <>
              {/* Balance pill */}
              <Link
                to="/wallet"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition"
              >
                ${Number(balance).toFixed(2)}
              </Link>

              {/* Logout */}
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="text-white/80 hover:text-white text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden text-white"
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 space-y-2"
          style={{ backgroundColor: brand.themeColor }}
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block text-white/90 hover:text-white text-sm font-medium py-1.5"
            >
              {label}
            </Link>
          ))}

          {user && (
            <>
              <div className="text-white/80 text-sm py-1.5">
                Balance:{" "}
                <span className="font-bold">${Number(balance).toFixed(2)}</span>
              </div>
              <button
                onClick={() => { logout(); navigate("/login"); setMobileOpen(false); }}
                className="text-white/80 hover:text-white text-sm block py-1.5"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
