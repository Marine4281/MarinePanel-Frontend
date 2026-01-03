// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { io } from "socket.io-client";

const Header = () => {
  const { user } = useAuth();
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

    // Connect to Socket.IO
    const socket = io("http://localhost:5000", {
      query: { userId: user._id }, // 🔑 pass userId to server if needed
    });

    // Listen for wallet updates
    socket.on("wallet:update", (data) => {
      // Check if the update is for this user
      // Some backends send { userId, balance } or { balance, userId, transactions }
      if (data.userId === user._id) {
        setBalance(data.balance ?? data.newBalance ?? balance); // fallback just in case
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <nav className="w-full bg-orange-500 sticky top-0 z-50">
      <div className="flex justify-between p-2 items-center">
        <div className="flex items-center">
          <h1 className="text-white font-semibold mx-4 text-xl">MARINE PANEL</h1>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-2 shadow-lg text-white text-center">
          <p className="text-sm">Balance</p>
          <h2 className="text-xl font-bold">${Number(balance).toFixed(2)}</h2>
        </div>
      </div>
    </nav>
  );
};

export default Header;