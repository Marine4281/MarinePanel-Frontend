// src/context/ChildPanelContext.jsx
//
// Detects if the current domain belongs to a child panel
// and loads its branding. Mirrors ResellerContext.jsx exactly.
// Used by Header, FloatingSupport, and ServicesContext
// to show the right brand and fetch the right services.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import API from "../api/axios";

const ChildPanelContext = createContext();

export const useChildPanel = () => useContext(ChildPanelContext);

// Returns the child panel slug from the current hostname
// e.g. "mybrand.marinepanel.online" → "mybrand"
// e.g. custom domain → null (backend detects via domain header)
const getChildPanelSlug = () => {
  const host = window.location.hostname;
  const mainDomain = "marinepanel.online";

  if (host === mainDomain || host === `www.${mainDomain}`) return null;
  if (host.endsWith(`.${mainDomain}`)) {
    return host.replace(`.${mainDomain}`, "");
  }

  // Custom domain — not a subdomain but still a child panel
  // Backend detects via Origin/Host header so we just return true
  return "__custom__";
};

export const ChildPanelProvider = ({ children }) => {
  const [childPanel, setChildPanel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = getChildPanelSlug();

    // Not on a child panel domain — skip
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchBranding = async () => {
      try {
        const res = await API.get("/child-panel/branding");
        setChildPanel(res.data);
      } catch (err) {
        console.error("Child panel branding fetch failed:", err);
        setChildPanel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  const isChildPanelDomain = useMemo(() => !!getChildPanelSlug(), []);

  return (
    <ChildPanelContext.Provider
      value={{ childPanel, loading, isChildPanelDomain }}
    >
      {children}
    </ChildPanelContext.Provider>
  );
};
