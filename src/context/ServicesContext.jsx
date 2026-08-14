// src/context/ServicesContext.jsx

import { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";
import { useAuth } from "./AuthContext";

const ServicesContext = createContext();

const MAIN_DOMAIN = "marinepanel.online";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const detectDomainType = async () => {
  const host = window.location.hostname;

  if (
    host === MAIN_DOMAIN ||
    host === `www.${MAIN_DOMAIN}` ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "main";
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1200;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await API.get("/child-panel/branding");
      return "childPanel";
    } catch (cpErr) {
      const cpStatus = cpErr.response?.status;

      if (!cpStatus) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        return "unreachable";
      }

      try {
        await API.get("/end-user/branding");
        return "reseller";
      } catch (reErr) {
        const reStatus = reErr.response?.status;

        if (!reStatus) {
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          return "unreachable";
        }

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

  // Logged-in user — used only to detect the "just logged in" transition
  // so a reseller-domain fetch that 401'd before the token existed gets
  // retried automatically, instead of requiring a manual page refresh.
  const { user } = useAuth() || {};
  const domainTypeRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const lastUserIdRef = useRef(null);

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
      domainTypeRef.current = type;

      await fetchServices(type);
      hasInitializedRef.current = true;

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

        // For reseller domains: a commission change means all pre-baked
        // prices in the services array are stale — full refetch needed.
        socket.on("commissionUpdated", () => {
          if (type === "reseller") {
            console.log("💰 Commission updated — refreshing reseller services...");
            fetchServices(type);
          }
        });

        socket.on("disconnect", () => console.log("❌ Socket disconnected"));
      }
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  /* =====================================================
  RE-FETCH ON LOGIN
  /reseller/services is an authenticated route. If this
  provider's initial fetch ran before the login token was
  in place (e.g. the user was mid-login when the app
  mounted), it 401s and services stays empty forever —
  the only fix used to be a hard refresh. Watch for the
  user identity actually appearing (null/undefined -> a
  real _id) and retry the fetch once that happens.
  ===================================================== */
  useEffect(() => {
    const currentUserId = user?._id || null;

    if (
      hasInitializedRef.current &&
      domainTypeRef.current === "reseller" &&
      !lastUserIdRef.current &&
      currentUserId
    ) {
      fetchServices("reseller");
    }

    lastUserIdRef.current = currentUserId;
  }, [user?._id]);

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
