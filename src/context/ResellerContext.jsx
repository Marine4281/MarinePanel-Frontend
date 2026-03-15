import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { getResellerSlug } from "../utils/domain";

const ResellerContext = createContext();

export const useReseller = () => useContext(ResellerContext);

export const ResellerProvider = ({ children }) => {

  const [reseller, setReseller] = useState(null);
  const [loading, setLoading] = useState(true);

  const slug = getResellerSlug();

  useEffect(() => {

    const fetchBranding = async () => {
      try {

        if (!slug) {
          setLoading(false);
          return;
        }

        const res = await API.get("/branding");

        setReseller(res.data);

      } catch (err) {
        console.error("Reseller branding error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();

  }, [slug]);

  return (
    <ResellerContext.Provider value={{ reseller, slug, loading }}>
      {children}
    </ResellerContext.Provider>
  );
};
