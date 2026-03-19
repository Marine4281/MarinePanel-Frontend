// src/context/ServicesContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  ========================================
  FETCH SERVICES (UNIFIED)
  - Backend handles:
    • Main panel
    • Reseller domain
  ========================================
  */
  const fetchServices = async () => {
    try {
      setLoading(true);

      // ✅ ALWAYS use public endpoint
      const res = await API.get("/services");

      setServices(res.data || []);

    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================================
  INITIAL LOAD + SOCKET
  ========================================
  */
  useEffect(() => {
    fetchServices();

    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () =>
      console.log("✅ Socket connected:", socket.id)
    );

    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing...");
      fetchServices();
    });

    socket.on("disconnect", () =>
      console.log("❌ Socket disconnected")
    );

    return () => socket.disconnect();
  }, []);

  /*
  ========================================
  DERIVED DATA
  ========================================
  */

  const platforms = useMemo(() => {
    return [...new Set(services.map((s) => s.platform || "General"))];
  }, [services]);

  const getCategoriesByPlatform = (platform) => [
    ...new Set(
      services
        .filter((s) => (s.platform || "General") === platform)
        .map((s) => s.category)
    ),
  ];

  const getServicesByCategory = (platform, category) =>
    services.filter(
      (s) =>
        (s.platform || "General") === platform &&
        s.category === category
    );

  const getGlobalDefault = () =>
    services.find((s) => s.isDefaultCategoryGlobal);

  const getPlatformDefault = (platform) =>
    services.find(
      (s) =>
        (s.platform || "General") === platform &&
        s.isDefaultCategoryPlatform
    );

  const refreshServices = async () => {
    await fetchServices();
  };

  return (
    <ServicesContext.Provider
      value={{
        services,
        loading,
        platforms,
        getCategoriesByPlatform,
        getServicesByCategory,
        getGlobalDefault,
        getPlatformDefault,
        refreshServices,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);
