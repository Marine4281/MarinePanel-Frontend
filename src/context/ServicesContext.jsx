// src/context/CachedServicesContext.jsx

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const CachedServicesContext = createContext();

const MAIN_DOMAIN = "marinepanel.online";

/**
 * Detects domain type with NO silent fallback.
 *
 * Strategy:
 * 1. If the hostname is the main platform → "main" immediately (no network call).
 * 2. Otherwise we are on a custom/subdomain — ask the backend which type it is.
 *    - /child-panel/branding returns 200  → "childPanel"
 *    - /end-user/branding   returns 200  → "reseller"
 *    - Both fail with network error       → RETRY up to 3 times before giving up.
 *    - Both return 404                    → unknown non-main domain; keep as
 *                                           "childPanel" or "reseller" based on
 *                                           which one returned a non-404 status,
 *                                           or stay as "unknown" so UI can show
 *                                           a proper error instead of main panel.
 *
 * The key change vs the old version: we NEVER return "main" for a non-main domain.
 * An unknown non-main domain shows an error page rather than the main landing page.
 */
const detectDomainType = async () => {
  const host = window.location.hostname;

  // ── 1. Main platform — instant, no network call ──────────────────────────
  if (
    host === MAIN_DOMAIN ||
    host === `www.${MAIN_DOMAIN}` ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "main";
  }

  // ── 2. Non-main domain — ask the backend ─────────────────────────────────
  // We retry up to 3 times to survive cold-start latency on Render / Railway.
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1200;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await API.get("/child-panel/branding");
      return "childPanel";
    } catch (cpErr) {
      // 404 = backend confirmed this is NOT a child panel domain.
      // Any other status = backend reached but said no.
      // Network error = backend unreachable → retry.
      const cpStatus = cpErr.response?.status;

      if (cpStatus && cpStatus !== 404) {
        // Backend responded but rejected — not a child panel.
        // Fall through to reseller check immediately.
      } else if (!cpStatus) {
        // No response at all (network error / CORS / timeout).
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue; // retry the whole loop
        }
        // Exhausted retries — we cannot reach the backend.
        // Return "unreachable" so the UI shows a friendly error
        // instead of the main landing page.
        return "unreachable";
      }

      // ── Try reseller ──────────────────────────────────────────────────────
      try {
        await API.get("/end-user/branding");
        return "reseller";
      } catch (reErr) {
        const reStatus = reErr.response?.status;

        if (!reStatus) {
          // Network error on reseller check too.
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          return "unreachable";
        }

        // Both endpoints responded with errors (likely both 404).
        // This domain exists in DNS but is not registered in the platform.
        return "unknown";
      }
    }
  }

  return "unreachable";
};

export const CachedServicesProvider = ({ children }) => {
  const [services,       setServices]       = useState([]);
  const [commission,     setCommission]     = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [domainType,     setDomainType]     = useState(null);
  const [domainResolved, setDomainResolved] = useState(false);

  const fetchData = async (type) => {
    try {
      setLoading(true);

      let servicesData   = [];
      let commissionData = 0;

      if (type === "reseller") {
        const res  = await API.get("/reseller/services");
        servicesData   = res.data.services  || [];
        commissionData = res.data.commission || 0;
      } else if (type === "main" || type === "childPanel") {
        const res  = await API.get("/services");
        servicesData = res.data || [];
        commissionData = 0;
      }
      // For "unknown" / "unreachable" — don't attempt a services fetch.

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
      setDomainResolved(true); // unblocks App.jsx router

      await fetchData(type);

      // Socket only makes sense for real panel types
      if (type === "main" || type === "reseller" || type === "childPanel") {
        socket = io("https://marinepanel-backend.onrender.com", {
          transports: ["websocket"],
        });

        socket.on("connect", () =>
          console.log("✅ Socket connected:", socket.id)
        );

        socket.on("servicesUpdated", () => {
          fetchData(type);
        });

        socket.on("commissionUpdated", (data) => {
          if (type === "reseller") setCommission(data.commission);
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
    if (domainType) await fetchData(domainType);
  };

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
        domainType,
        domainResolved,
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
