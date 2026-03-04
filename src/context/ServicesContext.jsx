import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch Services (Always Fresh)
  // =========================
  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      const data = res.data || [];
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchServices();

    // =========================
    // 🔥 SOCKET CONNECTION
    // =========================
    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    // Listen for service updates from backend
    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing...");
      fetchServices();
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  // =========================
  // Memoized Derived Data
  // =========================
  const platforms = useMemo(() => {
    return [...new Set(services.map((s) => s.platform))];
  }, [services]);

  const getCategoriesByPlatform = (platform) => {
    return [
      ...new Set(
        services
          .filter((s) => s.platform === platform)
          .map((s) => s.category)
      ),
    ];
  };

  const getServicesByCategory = (platform, category) => {
    return services.filter(
      (s) => s.platform === platform && s.category === category
    );
  };

  const getGlobalDefault = () => {
    return services.find((s) => s.isDefaultCategoryGlobal);
  };

  const getPlatformDefault = (platform) => {
    return services.find(
      (s) => s.platform === platform && s.isDefaultCategoryPlatform
    );
  };

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
