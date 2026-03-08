// src/context/CachedServicesContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const CachedServicesContext = createContext();

export const CachedServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch services + commission from backend
  // =========================
  const fetchData = async () => {
    try {
      const [servicesRes, commissionRes] = await Promise.all([
        API.get("/services"),
        API.get("/settings/commission"), // commission.js public endpoint
      ]);

      setServices(servicesRes.data || []);
      setCommission(commissionRes.data?.commission || 0);
    } catch (error) {
      console.error("Failed to fetch services or commission", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount / login
    fetchData();

    // =========================
    // Socket.IO for live updates
    // =========================
    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));

    // Update services in real-time
    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing cache...");
      fetchData();
    });

    // Update commission in real-time
    socket.on("commissionUpdated", (data) => {
      console.log("💰 Commission updated via socket:", data.commission);
      setCommission(data.commission);
    });

    socket.on("disconnect", () => console.log("❌ Socket disconnected"));

    return () => socket.disconnect();
  }, []);

  // =========================
  // Memoized derived data
  // =========================
  const platforms = useMemo(() => [...new Set(services.map((s) => s.platform))], [services]);

  const getCategoriesByPlatform = (platform) =>
    [...new Set(services.filter((s) => s.platform === platform).map((s) => s.category))];

  const getServicesByCategory = (platform, category) =>
    services.filter((s) => s.platform === platform && s.category === category);

  // Manual refresh if needed
  const refreshServices = async () => await fetchData();

  return (
    <CachedServicesContext.Provider
      value={{
        services,
        loading,
        commission,
        platforms,
        getCategoriesByPlatform,
        getServicesByCategory,
        refreshServices,
      }}
    >
      {children}
    </CachedServicesContext.Provider>
  );
};

export const useCachedServices = () => useContext(CachedServicesContext);
