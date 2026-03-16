// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();
export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  // Use window.__BRANDING__ as initial state
  const initial = window.__BRANDING__ || {
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#f97316",
    domain: "marinepanel.online",
  };

  const [reseller, setReseller] = useState(initial);

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
