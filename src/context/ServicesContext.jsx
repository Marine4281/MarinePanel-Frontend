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
        // Reseller / reseller users
        servicesData = res.data.services || [];
        commissionData = res.data.commission || 0;
      } else {
        // Main panel users (admin commission baked in)
        servicesData = res.data || [];
        commissionData = 0;
      }

      // ✅ Normalize platform and category strings
      servicesData = servicesData.map((s) => ({
        ...s,
        platform: (s.platform || "General").toString().trim(),
        category: (s.category || "General").toString().trim(),
      }));

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
    const unique = [...new Set(services.map((s) => s.platform))];
    return ["All", ...unique]; // ✅ Ensure "All" is first
  }, [services]);

  const getCategoriesByPlatform = (platform) => {
    if (platform === "All") {
      return [...new Set(services.map((s) => s.category))];
    }
    return [
      ...new Set(
        services
          .filter((s) => s.platform === platform)
          .map((s) => s.category)
      ),
    ];
  };

  const getServicesByCategory = (platform, category) =>
    services.filter((s) => {
      const platformMatch = platform === "All" ? true : s.platform === platform;
      const categoryMatch = s.category === category;
      return platformMatch && categoryMatch;
    });

  const getGlobalDefault = () =>
    services.find((s) => s.isDefaultCategoryGlobal);

  const getPlatformDefault = (platform) =>
    services.find(
      (s) =>
        (s.platform || "General") === platform &&
        s.isDefaultCategoryPlatform
    );

  const refreshServices = async () => await fetchServices();

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
