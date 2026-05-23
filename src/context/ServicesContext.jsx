// src/context/ServicesContext.jsx

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ServicesContext = createContext();

const MAIN_DOMAIN = "marinepanel.online";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Detects domain type with NO silent fallback to "main".
 *
 * Returns:
 *   "main"        — marinepanel.online or localhost
 *   "reseller"    — reseller subdomain / custom domain
 *   "childPanel"  — child panel subdomain / custom domain
 *   "unknown"     — non-main domain not registered on the platform
 *   "unreachable" — backend could not be reached after retries
 */
const detectDomainType = async () => {
  const host = window.location.hostname;

  // ── 1. Main platform — instant, no network call ──
  if (
    host === MAIN_DOMAIN ||
    host === `www.${MAIN_DOMAIN}` ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "main";
  }

  // ── 2. Non-main domain — ask the backend, with retries ──
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1200;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await API.get("/child-panel/branding");
      return "childPanel";
    } catch (cpErr) {
      const cpStatus = cpErr.response?.status;

      if (!cpStatus) {
        // Network error / timeout — retry
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        return "unreachable";
      }

      // Backend responded — not a child panel. Try reseller.
      try {
        await API.get("/end-user/branding");
        return "reseller";
      } catch (reErr) {
        const reStatus = reErr.response?.status;

        if (!reStatus) {
          // Network error on reseller check too — retry
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          return "unreachable";
        }

        // Both endpoints responded but neither matched — unregistered domain
        return "unknown";
      }
    }
  }

  return "unreachable";
};

export const ServicesProvider = ({ children }) => {
  const [services,   setServices]   = useState([]);
  const [commission, setCommission] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [domainType, setDomainType] = useState(null);

  const fetchServices = async (type) => {
    try {
      setLoading(true);

      let servicesData   = [];
      let commissionData = 0;

      if (type === "reseller") {
        const res      = await API.get("/reseller/services");
        servicesData   = res.data.services  || [];
        commissionData = res.data.commission || 0;
      } else if (type === "main" || type === "childPanel") {
        const res    = await API.get("/services");
        servicesData = res.data || [];
      }
      // For "unknown" / "unreachable" — skip the fetch entirely

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

  useEffect(() => {
    let socket;

    const init = async () => {
      const type = await detectDomainType();
      setDomainType(type);
      await fetchServices(type);

      // Socket only makes sense for real panel types
      if (type === "main" || type === "reseller" || type === "childPanel") {
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
      }
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
        domainType,
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
