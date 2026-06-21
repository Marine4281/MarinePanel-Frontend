// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();
export const useReseller = () => useContext(ResellerContext);

// ── Normalizer — guaranteed complete shape every time ──────────────────
const normalizeBranding = (data = {}) => ({
  brandName:  data?.brandName  || "Reseller Panel",
  logo:       data?.logo       || null,
  themeColor: data?.themeColor || "#16a34a",
  domain:     data?.domain     || data?.resellerDomain || "marinepanel.online",
  landingTemplate:  data?.landingTemplate  || "default",
  support: {
    whatsapp:        data?.supportWhatsapp        || data?.support?.whatsapp        || "",
    telegram:        data?.supportTelegram        || data?.support?.telegram        || "",
    whatsappChannel: data?.supportWhatsappChannel || data?.support?.whatsappChannel || "",
  },
});

const DEFAULT_BRANDING = {
  brandName:  "MarinePanel",
  logo:       null,
  themeColor: "#f97316",
  domain:     "marinepanel.online",
  support: {
    whatsapp:        "",
    telegram:        "",
    whatsappChannel: "",
  },
};

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState(DEFAULT_BRANDING);
  const [ready,    setReady]    = useState(false);

  const applyTheme = (color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  };

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        // If ChildPanelContext already claimed this domain, skip —
        // this is not a reseller domain.
        if (window.__DOMAIN_TYPE__ === "childPanel") {
          setReady(true);
          return;
        }

        const hostname = window.location.hostname;

        const res = await API.get("/branding/public", {
          headers: { "x-reseller-domain": hostname },
          withCredentials: true,
        });

        if (res.data) {
          const branding = normalizeBranding(res.data);

          setReseller((prev) => ({
            ...prev,
            ...branding,
            support: {
              ...prev.support,
              ...branding.support,
            },
          }));

          applyTheme(branding.themeColor);
          document.title = branding.brandName || "MarinePanel";

          // Signal domain type so other contexts don't re-fetch
          if (!window.__DOMAIN_TYPE__) {
            window.__DOMAIN_TYPE__ = "reseller";
          }
        }
      } catch (err) {
        // Branding fetch failed — fall back to defaults silently.
        // Don't crash the app over a missing brand.
        console.error("Reseller branding fetch failed:", err);
      } finally {
        // Always unblock — never leave the app stuck on a fetch error
        setReady(true);
      }
    };

    fetchBranding();
  }, []);

  // Keep theme in sync if reseller state changes after initial load
  // (e.g. after a reseller updates their branding from settings)
  useEffect(() => {
    if (ready) {
      applyTheme(reseller?.themeColor);
    }
  }, [reseller?.themeColor, ready]);

  return (
    <ResellerContext.Provider value={{ reseller, setReseller, ready }}>
      {children}
    </ResellerContext.Provider>
  );
};
