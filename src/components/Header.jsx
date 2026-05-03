// src/components/Header.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import API from "../api/axios";
import { io } from "socket.io-client";

const Header = () => {
  const { user } = useAuth();
  const { reseller, loading: resellerLoading } = useReseller();
  const { childPanel, loading: cpLoading } = useChildPanel();
  const { domainType } = useCachedServices();
  const [balance, setBalance] = useState(0);

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const res = await API.get("/wallet");
      setBalance(res.data.balance);
    } catch (error) {
      console.error("HEADER WALLET ERROR:", error);
      setBalance(0);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchBalance();

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      { query: { userId: user._id } }
    );

    socket.on("wallet:update", (data) => {
      if (data.userId === user._id) {
        setBalance(data.balance ?? data.newBalance ?? balance);
      }
    });

    return () => socket.disconnect();
  }, [user]);

  // ======================= BRANDING =======================
  // Child panel domain → use child panel branding
  // Reseller domain    → use reseller branding
  // Main platform      → use defaults

  const brand =
    domainType === "childPanel" && childPanel
      ? {
          brandName: childPanel.brandName || "Panel",
          logo: childPanel.logo || null,
          themeColor: childPanel.themeColor || "#1e40af",
        }
      : reseller || {
          brandName: "Marine Panel",
          logo: null,
          themeColor: "#ff6b00",
        };

  // ======================= LOADING =======================
  // Show skeleton while branding is being fetched
  // Waits for whichever context is relevant to the domain

  const isLoading =
    domainType === "childPanel" ? cpLoading
    : domainType === "reseller" ? resellerLoading
    : false;

  if (isLoading) {
    return (
      <nav className="w-full bg-gray-200 sticky top-0 z-50 animate-pulse">
        <div className="flex justify-between p-2 items-center">
          <div className="flex items-center">
            <h1 className="text-gray-400 font-semibold mx-4 text-xl">
              Loading...
            </h1>
          </div>
          <div className="bg-gray-300 rounded-2xl p-2 shadow-lg text-gray-400 text-center w-24">
            <p className="text-sm">Balance</p>
            <h2 className="text-xl font-bold">0.0000</h2>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="w-full sticky top-0 z-50"
      style={{ backgroundColor: brand.themeColor }}
    >
      <div className="flex justify-between p-2 items-center">
        <div className="flex items-center">
          {brand.logo && (
            <img src={brand.logo} alt="Logo" className="h-10 mr-3" />
          )}
          <h1 className="text-white font-semibold mx-4 text-xl">
            {brand.brandName}
          </h1>
        </div>
        <div
          className="bg-gradient-to-r rounded-2xl p-2 shadow-lg text-white text-center"
          style={{
            background: `linear-gradient(to right, ${brand.themeColor}, #ff3b00)`,
          }}
        >
          <p className="text-sm">Balance</p>
          <h2 className="text-xl font-bold">${Number(balance).toFixed(4)}</h2>
        </div>
      </div>
    </nav>
  );
};

export default Header;
