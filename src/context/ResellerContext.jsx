// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const ResellerContext = createContext();

export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState({
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#2563eb", // default platform color
    domain: "marinepanel.online",
  });

  const [loading, setLoading] = useState(true);

  // Apply theme color globally
  const applyTheme = (color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  };

  // Update page title dynamically
  const updateTitle = (name) => {
    document.title = name || "MarinePanel";
  };

  // Normalize branding data from API
  const normalizeBranding = (data) => {
    return {
      brandName: data.brandName || "Reseller Panel",
      logo: data.logo || null,
      themeColor: data.themeColor || "#16a34a",
      domain: data.domain || data.resellerDomain || "marinepanel.online",
    };
  };

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        // Use the browser host as the reseller identifier
        const hostname = window.location.hostname; // e.g., smmlord.marinepanel.online

        const res = await API.get("/branding", {
          headers: { "x-reseller-domain": hostname },
          withCredentials: true,
        });

        if (res.data) {
          const branding = normalizeBranding(res.data);

          setReseller(branding);

          // Apply global theme
          applyTheme(branding.themeColor);

          // Update browser title dynamically
          updateTitle(branding.brandName);
        }
      } catch (err) {
        console.error("Reseller branding fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  // Watch for live updates when `setReseller` changes
  useEffect(() => {
    applyTheme(reseller.themeColor);
    updateTitle(reseller.brandName);
  }, [reseller]);

  return (
    <ResellerContext.Provider
      value={{
        reseller,
        setReseller,
        loading,
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
};
