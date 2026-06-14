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

IMPORTANT: Checks window.__DOMAIN_TYPE__ first so that
ChildPanelContext (which runs in parallel) can short-
circuit this function and prevent a duplicate branding
fetch on child panel domains.
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

  // ── Short-circuit: ChildPanelContext already resolved the domain ──
  // ChildPanelContext runs in parallel and sets this global as soon as
  // it gets a response. If it beat us here, trust it — no second fetch.
  if (window.__DOMAIN_TYPE__) {
    return window.__DOMAIN_TYPE__;
  }

  try {
    await API.get("/child-panel/branding");
    window.__DOMAIN_TYPE__ = "childPanel";
    window.__CHILD_PANEL_DETECTED__ = true;
    return "childPanel";
  } catch {
    try {
      await API.get("/end-user/branding");
      window.__DOMAIN_TYPE__ = "reseller";
      return "reseller";
    } catch {
      window.__DOMAIN_TYPE__ = "main";
      return "main";
    }
  }
};

/* =====================================================
WAIT FOR CHILD PANEL BRANDING
On child panel domains, ChildPanelContext is fetching
branding in parallel. We wait for it to finish before
setting domainResolved=true, so the router never unblocks
before the brand name/logo/theme are in context.

Resolves immediately if already done, times out safely
after 3s so a branding error never hangs the whole app.
===================================================== */
const waitForChildPanelBranding = () =>
  new Promise((resolve) => {
    // Already done
    if (window.__CHILD_PANEL_DETECTED__) return resolve();

    const interval = setInterval(() => {
      if (window.__CHILD_PANEL_DETECTED__) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 20);

    // Safety timeout — never block the app forever
    const timeout = setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 3000);
  });

export const CachedServicesProvider = ({ children }) => {
  const [services,       setServices]       = useState([]);
  const [commission,     setCommission]     = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [domainType,     setDomainType]     = useState(null);
  const [domainResolved, setDomainResolved] = useState(false);

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
      setDomainType(type);

      // On child panel domains, hold the gate until ChildPanelContext
      // has finished loading branding. This ensures the router never
      // unblocks with a blank logo/brand name.
      if (type === "childPanel") {
        await waitForChildPanelBranding();
      }

      // NOW unblock the router — branding is guaranteed to be in context
      setDomainResolved(true);

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
        domainResolved, // boolean, gates the entire router in App.jsx
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
