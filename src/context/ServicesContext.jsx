// src/context/ServicesContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0); // Admin or reseller
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);

      const slug = getResellerSlug();
      const token = localStorage.getItem("token");

      let endpoint = "/services";
      if (slug && token) endpoint = "/reseller/services";

      const res = await API.get(endpoint);

      let servicesData = [];
      let commissionData = 0;

      if (endpoint === "/reseller/services") {
        // ✅ Reseller / reseller users
        servicesData = res.data.services || [];
        commissionData = res.data.commission || 0;
      } else {
        // ✅ Main panel users (backend already applied admin commission)
        servicesData = res.data || [];
        commissionData = 0; // optional (since already baked into price)
      }

      setServices(servicesData);
      setCommission(commissionData);

    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();

    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));

    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing...");
      fetchServices();
    });

    socket.on("disconnect", () => console.log("❌ Socket disconnected"));

    return () => socket.disconnect();
  }, []);

  // =========================
  // Derived Data
  // =========================

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
        commission,
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
