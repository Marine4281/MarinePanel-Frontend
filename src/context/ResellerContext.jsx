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
    themeColor: "#16a34a", // default green to match backend
    domain: null,
  });

  const [loading, setLoading] = useState(true);

  // Detect subdomain if present
  const slug = getResellerSlug();

  // Apply theme color globally
  const applyTheme = (color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  };

  // Update page title dynamically
  const updateTitle = (name) => {
    document.title = name || "Reseller Panel";
  };

  // Normalize branding data from API
  const normalizeBranding = (data) => {
    return {
      brandName:
        data.brandName ||
        data.resellerBrand ||
        data.brandSlug ||
        "Reseller Panel",
      logo: data.logo || null,
      themeColor: data.themeColor || "#16a34a",
      domain: data.domain || data.resellerDomain || null,
    };
  };

  // Fetch branding info from backend
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await API.get("/branding", { withCredentials: true });

        if (res.data) {
          const branding = normalizeBranding(res.data);

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
        slug,
        loading,
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
};
