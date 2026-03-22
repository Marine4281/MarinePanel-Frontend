// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();
export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState({
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#f97316",
    domain: "marinepanel.online",

    // ✅ ADD SAFE DEFAULT SUPPORT
    support: {
      whatsapp: "",
      telegram: "",
      whatsappChannel: "",
    },
  });

  const [ready, setReady] = useState(false);

  const applyTheme = (color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  };

  const updateTitle = (name) => {
    document.title = name || "MarinePanel";
  };

  // ✅ FIXED NORMALIZER (never breaks)
  const normalizeBranding = (data = {}) => ({
    brandName: data?.brandName || "Reseller Panel",
    logo: data?.logo || null,
    themeColor: data?.themeColor || "#16a34a",
    domain: data?.domain || data?.resellerDomain || "marinepanel.online",

    support: {
      whatsapp: data?.support?.whatsapp || "",
      telegram: data?.support?.telegram || "",
      whatsappChannel: data?.support?.whatsappChannel || "",
    },
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const hostname = window.location.hostname;

        const res = await API.get("/branding/public", {
          headers: { "x-reseller-domain": hostname },
          withCredentials: true,
        });

        if (res.data) {
          const branding = normalizeBranding(res.data);

          // ✅ CRITICAL FIX: MERGE instead of replace
          setReseller((prev) => ({
            ...prev,
            ...branding,
            support: {
              ...prev.support,
              ...branding.support,
            },
          }));

          applyTheme(branding.themeColor);
          updateTitle(branding.brandName);
        }
      } catch (err) {
        console.error("Branding fetch failed:", err);
      } finally {
        setReady(true);
      }
    };

    fetchBranding();
  }, []);

  useEffect(() => {
    applyTheme(reseller?.themeColor);
    updateTitle(reseller?.brandName);
  }, [reseller]);

  return (
    <ResellerContext.Provider value={{ reseller, setReseller }}>
      <div style={{ visibility: ready ? "visible" : "hidden" }}>
        {children}
      </div>
    </ResellerContext.Provider>
  );
};
