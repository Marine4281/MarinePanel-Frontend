// src/context/CachedServicesContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const CachedServicesContext = createContext();

export const CachedServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const slug = getResellerSlug();
      const token = localStorage.getItem("token");

      let endpoint = "/services";
      if (slug && token) {
        endpoint = "/reseller/services";
      }

      const res = await API.get(endpoint);

      let servicesData = [];
      let commissionData = 0;

      if (endpoint === "/reseller/services") {
        // ✅ Reseller / reseller users
        servicesData = res.data.services || [];
        commissionData = res.data.commission || 0;
      } else {
        // ✅ Main panel users
        servicesData = res.data || [];
        commissionData = 0; // main panel already precomputed
      }

      // ✅ Normalize platform strings
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
    fetchData();

    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing cache...");
      fetchData();
    });
    socket.on("commissionUpdated", (data) => {
      console.log("💰 Commission updated:", data.commission);
      setCommission(data.commission);
    });
    socket.on("disconnect", () => console.log("❌ Socket disconnected"));

    return () => socket.disconnect();
  }, []);

  // ✅ Platforms with 'All' first
  const platforms = useMemo(() => {
    const unique = [...new Set(services.map((s) => s.platform))];
    return ["All", ...unique];
  }, [services]);

  // ✅ Get categories for a platform
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

  // ✅ Get services by platform + category
  const getServicesByCategory = (platform, category) => {
    return services.filter((s) => {
      const platformMatch = platform === "All" ? true : s.platform === platform;
      const categoryMatch = s.category === category;
      return platformMatch && categoryMatch;
    });
  };

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
