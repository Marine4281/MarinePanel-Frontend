// src/context/ServicesContext.jsx

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ServicesContext = createContext();

/* =====================================================
DOMAIN TYPE DETECTION
Determines what kind of panel the current domain is.

Returns:
  "main"       — marinepanel.online or localhost
  "reseller"   — reseller subdomain or custom reseller domain
  "childPanel" — child panel subdomain or custom cp domain

We detect by calling the backend branding endpoints:
  /end-user/branding     → reseller
  /child-panel/branding  → child panel
  
We use the slug as a signal first (fast, no network),
then let the backend confirm the type via its own
domain detection middleware.
===================================================== */
const detectDomainType = async () => {
  const host = window.location.hostname;
  const mainDomain = "marinepanel.online";

  // Definitely main platform
  if (
    host === mainDomain ||
    host === `www.${mainDomain}` ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "main";
  }

  // Has a subdomain — could be reseller OR child panel
  // Ask the backend which one it is
  try {
    await API.get("/child-panel/branding");
    return "childPanel";
  } catch (cpErr) {
    // Not a child panel — try reseller
    try {
      await API.get("/end-user/branding");
      return "reseller";
    } catch {
      // Unknown domain — treat as main
      return "main";
    }
  }
};

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [domainType, setDomainType] = useState(null); // "main" | "reseller" | "childPanel"

  /* =====================================================
  FETCH SERVICES
  Route depends on domain type:
    main       → /services          (platform services)
    reseller   → /reseller/services (reseller-scoped)
    childPanel → /services          (backend scopes by
                                     req.childPanel from
                                     detectChildPanelDomain
                                     middleware — same
                                     endpoint, different data)
  ===================================================== */
  const fetchServices = async (type) => {
    try {
      setLoading(true);

      let servicesData = [];
      let commissionData = 0;

      if (type === "reseller") {
        const res = await API.get("/reseller/services");
        servicesData = res.data.services || [];
        commissionData = res.data.commission || 0;
      } else {
        // main or childPanel — both use /services
        // backend already applies the right scope
        const res = await API.get("/services");
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
  INIT — detect domain type first, then fetch services
  ===================================================== */
  useEffect(() => {
    let socket;

    const init = async () => {
      const type = await detectDomainType();
      setDomainType(type);
      await fetchServices(type);

      // Socket for live service updates
      socket = io("https://marinepanel-backend.onrender.com", {
        transports: ["websocket"],
      });

      socket.on("connect", () =>
        console.log("✅ Socket connected:", socket.id)
      );

      socket.on("servicesUpdated", () => {
        console.log("🔄 Services updated — refreshing...");
        fetchServices(type);
      });

      socket.on("disconnect", () => console.log("❌ Socket disconnected"));
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const refreshServices = async () => {
    if (domainType) await fetchServices(domainType);
  };

  // ======================= DERIVED DATA =======================

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
        (s.platform || "General") === platform && s.category === category
    );

  const getGlobalDefault = () =>
    services.find((s) => s.isDefaultCategoryGlobal);

  const getPlatformDefault = (platform) =>
    services.find(
      (s) =>
        (s.platform || "General") === platform && s.isDefaultCategoryPlatform
    );

  return (
    <ServicesContext.Provider
      value={{
        services,
        commission,
        loading,
        domainType,         // "main" | "reseller" | "childPanel"
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
