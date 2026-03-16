// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();
export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  // Use preloaded branding from index.html
  const initial = window.__BRANDING__ || {
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#f97316", // default orange
    domain: "marinepanel.online",
  };

  const [reseller, setReseller] = useState(initial);

  // Apply initial theme and title immediately
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", reseller.themeColor);
    document.title = reseller.brandName;
  }, []); // only once on mount

  // Fetch latest branding from backend (async update)
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const hostname = window.location.hostname;

        const res = await API.get("/branding", {
          headers: { "x-reseller-domain": hostname },
          withCredentials: true,
        });

        if (res.data) {
          const branding = {
            brandName: res.data.brandName || "Reseller Panel",
            logo: res.data.logo || null,
            themeColor: res.data.themeColor || "#16a34a",
            domain: res.data.domain || hostname,
          };

          setReseller(branding);

          // Apply theme & title instantly
          document.documentElement.style.setProperty("--theme-color", branding.themeColor);
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
