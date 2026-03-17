// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();
export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  // ✅ Use backend-injected branding instantly
  const initialBranding = window.__BRANDING__ || {
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#f97316", // default orange
    domain: "marinepanel.online",
  };

  const [reseller, setReseller] = useState(initialBranding);

  // Apply theme + title immediately on first load
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-color",
      initialBranding.themeColor
    );
    document.title = initialBranding.brandName;
  }, []);

  // Normalize backend response
  const normalizeBranding = (data) => ({
    brandName: data.brandName || "Reseller Panel",
    logo: data.logo || null,
    themeColor: data.themeColor || "#16a34a",
    domain: data.domain || data.resellerDomain || window.location.hostname,
  });

  // 🔄 Fetch latest branding in background (no UI blocking)
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const hostname = window.location.hostname;

        const res = await API.get("/branding", {
          headers: { "x-reseller-domain": hostname },
          withCredentials: true,
        });

        if (res.data) {
          const branding = normalizeBranding(res.data);

          setReseller(branding);

          // Apply updated branding instantly
          document.documentElement.style.setProperty(
            "--theme-color",
            branding.themeColor
          );
          document.title = branding.brandName;
        }
      } catch (err) {
        console.error("Branding fetch failed:", err);
      }
    };

    fetchBranding();
  }, []);

  return (
    <ResellerContext.Provider value={{ reseller, setReseller }}>
      {children}
    </ResellerContext.Provider>
  );
};
