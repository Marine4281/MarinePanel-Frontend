// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();
export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState({
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#f97316", // default orange
    domain: "marinepanel.online",
  });

  const [ready, setReady] = useState(false); // instead of loading

  const applyTheme = (color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  };

  const updateTitle = (name) => {
    document.title = name || "MarinePanel";
  };

  const normalizeBranding = (data) => ({
    brandName: data.brandName || "Reseller Panel",
    logo: data.logo || null,
    themeColor: data.themeColor || "#16a34a",
    domain: data.domain || data.resellerDomain || "marinepanel.online",
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

          setReseller(branding);
          applyTheme(branding.themeColor);
          updateTitle(branding.brandName);
        }
      } catch (err) {
        console.error("Branding fetch failed:", err);
      } finally {
        // Mark UI ready AFTER theme is applied
        setReady(true);
      }
    };

    fetchBranding();
  }, []);

  useEffect(() => {
    applyTheme(reseller.themeColor);
    updateTitle(reseller.brandName);
  }, [reseller]);

  return (
    <ResellerContext.Provider value={{ reseller, setReseller }}>
      {/* 👇 Hide UI until branding is ready (no loading screen) */}
      <div style={{ visibility: ready ? "visible" : "hidden" }}>
        {children}
      </div>
    </ResellerContext.Provider>
  );
};
