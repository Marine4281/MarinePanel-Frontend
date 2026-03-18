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
      const token = localStorage.getItem("token"); // check login

      let endpoint = "/services";
      if ((slug && token)) {
        endpoint = "/reseller/services";
      }

      const res = await API.get(endpoint);

      let servicesData = [];
      let commissionData = 0;

      if (endpoint === "/reseller/services") {
        servicesData = res.data.services || [];
        commissionData = res.data.commission || 0;
      } else {
        servicesData = res.data || [];
        try {
          const commissionRes = await API.get("/settings/commission");
          commissionData = commissionRes.data?.commission || 0;
        } catch {
          commissionData = 0;
        }
      }

      setServices(servicesData);
      setCommission(commissionData);
    } catch (error) {
      console.error("Failed to fetch services or commission", error);
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
      console.log("💰 Commission updated via socket:", data.commission);
      setCommission(data.commission);
    });

    socket.on("disconnect", () => console.log("❌ Socket disconnected"));

    return () => socket.disconnect();
  }, []);

  const platforms = useMemo(
    () => [...new Set(services.map((s) => s.platform || "General"))],
    [services]
  );

  const getCategoriesByPlatform = (platform) =>
    [...new Set(
      services
        .filter((s) => (s.platform || "General") === platform)
        .map((s) => s.category)
    )];

  const getServicesByCategory = (platform, category) =>
    services.filter(
      (s) => (s.platform || "General") === platform && s.category === category
    );

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
