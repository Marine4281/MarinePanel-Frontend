// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ResellerContext = createContext();

export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState({
    brandName: "Reseller Panel",
    logo: null,
    themeColor: "#ff6b00",
    domain: null,
  });

  const [loading, setLoading] = useState(true);

  // Detect subdomain if present
  const slug = getResellerSlug();

  // Function to apply theme color globally
  const applyTheme = (color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  };

  // Function to update page title
  const updateTitle = (name) => {
    document.title = name || "Reseller Panel";
  };

  // Fetch branding info
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await API.get("/branding", { withCredentials: true });

        if (res.data) {
          const branding = {
            brandName: res.data.brandName || "Reseller Panel",
            logo: res.data.logo || null,
            themeColor: res.data.themeColor || "#ff6b00",
            domain: res.data.domain || null,
          };

          setReseller(branding);

          // Apply global theme
          applyTheme(branding.themeColor);

          // Update browser title dynamically
          updateTitle(branding.brandName);
        }
      } catch (err) {
        console.error("Reseller branding error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [slug]);

  // Watch for live updates (if setReseller changes)
  useEffect(() => {
    applyTheme(reseller.themeColor);
    updateTitle(reseller.brandName);
  }, [reseller]);

  return (
    <ResellerContext.Provider
      value={{
        reseller,
        setReseller,
        slug,
        loading,
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
};
