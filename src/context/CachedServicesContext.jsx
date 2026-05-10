// src/context/CachedServicesContext.jsx

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const CachedServicesContext = createContext();

/* =====================================================
DOMAIN TYPE DETECTION
Returns:
  "main"       — marinepanel.online or localhost
  "reseller"   — reseller subdomain / custom domain
  "childPanel" — child panel subdomain / custom domain
===================================================== */
const detectDomainType = async () => {
  const host = window.location.hostname;
  const mainDomain = "marinepanel.online";

  if (
    host === mainDomain ||
    host === `www.${mainDomain}` ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "main";
  }

  try {
    await API.get("/child-panel/branding");
    return "childPanel";
  } catch {
    try {
      await API.get("/end-user/branding");
      return "reseller";
    } catch {
      return "main";
    }
  }
};

export const CachedServicesProvider = ({ children }) => {
  const [services,       setServices]       = useState([]);
  const [commission,     setCommission]     = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [domainType,     setDomainType]     = useState(null);
  const [domainResolved, setDomainResolved] = useState(false); // ← NEW: true once domain detection is complete

  /* =====================================================
  FETCH DATA
  Route depends on domain type:
    reseller   → /reseller/services
    main       → /services
    childPanel → /services (backend scopes via middleware)
  ===================================================== */
  const fetchData = async (type) => {
    try {
      setLoading(true);

      let servicesData   = [];
      let commissionData = 0;

      if (type === "reseller") {
        const res  = await API.get("/reseller/services");
        servicesData   = res.data.services  || [];
        commissionData = res.data.commission || 0;
      } else {
        // main or childPanel
        const res  = await API.get("/services");
        servicesData = res.data || [];
        commissionData = 0;
      }

      setServices(servicesData);
      setCommission(commissionData);
    } catch (error) {
      console.error("Failed to fetch services", error);
      setServices([]);
      setCommission(0);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
  INIT
  ===================================================== */
  useEffect(() => {
    let socket;

    const init = async () => {
      const type = await detectDomainType();

      // Set domain type first, then immediately mark as resolved.
      // This is what unblocks the router — no page renders until this fires.
      setDomainType(type);
      setDomainResolved(true); // ← unblocks App.jsx router

      await fetchData(type);

      socket = io("https://marinepanel-backend.onrender.com", {
        transports: ["websocket"],
      });

      socket.on("connect", () =>
        console.log("✅ Socket connected:", socket.id)
      );

      socket.on("servicesUpdated", () => {
        console.log("🔄 Services updated — refreshing cache...");
        fetchData(type);
      });

      // Only relevant for reseller dashboard
      socket.on("commissionUpdated", (data) => {
        console.log("💰 Commission updated:", data.commission);
        if (type === "reseller") {
          setCommission(data.commission);
        }
      });

      socket.on("disconnect", () => console.log("❌ Socket disconnected"));
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const refreshServices = async () => {
    if (domainType) await fetchData(domainType);
  };

  // ======================= DERIVED DATA =======================

  const platforms = useMemo(
    () => [...new Set(services.map((s) => s.platform || "General"))],
    [services]
  );

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
        (s.platform || "General") === platform && s.category === category
    );

  return (
    <CachedServicesContext.Provider
      value={{
        services,
        loading,
        commission,
        domainType,     // "main" | "reseller" | "childPanel"
        domainResolved, // ← NEW: boolean, gates the entire router in App.jsx
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
