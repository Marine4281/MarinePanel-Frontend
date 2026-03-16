// src/context/ResellerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ResellerContext = createContext();

export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState({
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#ff6b00",
  });
  const [loading, setLoading] = useState(true);

  const slug = getResellerSlug(); // detects subdomain

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        if (!slug) {
          setLoading(false);
          return;
        }

        const res = await API.get("/branding", { withCredentials: true });

        if (res.data) {
          setReseller({
            brandName: res.data.brandName || "MarinePanel",
            logo: res.data.logo || null,
            themeColor: res.data.themeColor || "#ff6b00",
          });
        }
      } catch (err) {
        console.error("Reseller branding error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [slug]);

  // ✅ Include setReseller in context so components can update dynamically
  return (
    <ResellerContext.Provider value={{ reseller, setReseller, slug, loading }}>
      {children}
    </ResellerContext.Provider>
  );
};
