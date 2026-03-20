// src/context/CachedServicesContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const CachedServicesContext = createContext();

export const CachedServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0); // optional (can remove later)
  const [loading, setLoading] = useState(true);

  /*
  ========================================
  FETCH SERVICES (UNIFIED)
  ========================================
  */
  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ ALWAYS use public endpoint
      const res = await API.get("/services");

      setServices(res.data || []);

      // ✅ Commission no longer needed (backend already applied pricing)
      setCommission(0);

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
    fetchData();

    const socket = io("https://marinepanel-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () =>
      console.log("✅ Socket connected:", socket.id)
    );

    socket.on("servicesUpdated", () => {
      console.log("🔄 Services updated — refreshing cache...");
      fetchData();
    });

    // ✅ Optional: keep if you use reseller dashboard live updates
    socket.on("commissionUpdated", (data) => {
      console.log("💰 Commission updated:", data?.commission);
      setCommission(data?.commission || 0);
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

  const platforms = useMemo(
    () => [...new Set(services.map((s) => s.platform || "General"))],
    [services]
  );

  const getCategoriesByPlatform = (platform) =>
    [
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

  const refreshServices = async () => {
    await fetchData();
  };

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
