// src/context/ServicesContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0); // ✅ FIX
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch Services
  // =========================
  const fetchServices = async () => {
    try {
      setLoading(true);

      const slug = getResellerSlug();
      const token = localStorage.getItem("token");

      // ✅ Decide endpoint properly
      let endpoint = "/services";

      if (slug && token) {
        endpoint = "/reseller/services";
      }

      const res = await API.get(endpoint);

      let data = [];

      if (endpoint === "/reseller/services") {
        // ✅ Reseller response
        data = res.data.services || [];
        setCommission(res.data.commission || 0); // ✅ FIX
      } else {
        // ✅ Public response
        data = res.data || [];
        setCommission(0);
      }

      setServices(data);

    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();

    // =========================
    // SOCKET CONNECTION
    // =========================
    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing...");
      fetchServices();
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // =========================
  // Derived Data
  // =========================

  const platforms = useMemo(() => {
    return [...new Set(services.map((s) => s.platform || "General"))];
  }, [services]);

  const getCategoriesByPlatform = (platform) => {
    return [
      ...new Set(
        services
          .filter((s) => (s.platform || "General") === platform)
          .map((s) => s.category)
      ),
    ];
  };

  const getServicesByCategory = (platform, category) => {
    return services.filter(
      (s) =>
        (s.platform || "General") === platform &&
        s.category === category
    );
  };

  const getGlobalDefault = () => {
    return services.find((s) => s.isDefaultCategoryGlobal);
  };

  const getPlatformDefault = (platform) => {
    return services.find(
      (s) =>
        (s.platform || "General") === platform &&
        s.isDefaultCategoryPlatform
    );
  };

  const refreshServices = async () => {
    await fetchServices();
  };

  return (
    <ServicesContext.Provider
      value={{
        services,
        commission, // ✅ FIX
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
