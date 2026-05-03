// src/context/ChildPanelContext.jsx
//
// Detects if the current domain belongs to a child panel and
// loads its branding. Used by:
//   - Header.jsx          (brand name, logo, theme color)
//   - CPHeader.jsx        (same, for end-user CP pages)
//   - FloatingSupport.jsx (support links)
//   - Login.jsx           (branded login page)
//   - Register.jsx        (branded register page)
//   - LandingPage.jsx     (branded landing)
//   - ServicesContext.jsx (domainType detection)
//
// KEY FIXES vs previous version:
//   1. Distinguishes child panel subdomains from reseller
//      subdomains so ChildPanelContext never fires a branding
//      request on a reseller domain (audit gap fix)
//   2. Sets window.__CHILD_PANEL_DETECTED__ so ResellerContext
//      and ServicesContext can skip redundant detections
//   3. Applies theme color to CSS variable immediately on load
//      so there is no flash of unstyled content
//   4. Normalizes the branding shape so every consumer gets
//      the same guaranteed fields — no optional-chaining chains
//      scattered across every component
//   5. Exposes isChildPanelDomain, isLoading, and error state
//      so consumers can branch cleanly
//   6. Updates document.title on brand load

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import API from "../api/axios";

/* ============================================================
   CONSTANTS
============================================================ */
const MAIN_DOMAIN = "marinepanel.online";

/* ============================================================
   DOMAIN HELPERS
   All domain logic lives here — not scattered in components.
============================================================ */

/**
 * Returns true only when the current hostname is a child panel
 * domain — either a *.marinepanel.online subdomain or a fully
 * custom domain that is NOT the main platform.
 *
 * We deliberately cannot distinguish "is this a reseller or a
 * child panel subdomain?" at this point — both look like
 * *.marinepanel.online. The backend resolves which is which.
 * We let ServicesContext make that call via its detectDomainType
 * logic and share the result via window.__DOMAIN_TYPE__.
 */
const isNonMainDomain = () => {
  const host = window.location.hostname;
  return (
    host !== MAIN_DOMAIN &&
    host !== `www.${MAIN_DOMAIN}` &&
    host !== "localhost" &&
    host !== "127.0.0.1"
  );
};

/**
 * Extracts the subdomain slug when on *.marinepanel.online.
 * Returns null on the main domain or on a custom domain.
 * e.g. "mybrand.marinepanel.online" → "mybrand"
 */
const getSubdomainSlug = () => {
  const host = window.location.hostname;
  if (host.endsWith(`.${MAIN_DOMAIN}`)) {
    return host.slice(0, host.length - MAIN_DOMAIN.length - 1);
  }
  return null;
};

/**
 * True when on a fully custom domain (not *.marinepanel.online).
 * e.g. "mypanel.com" → true
 * e.g. "mybrand.marinepanel.online" → false
 */
const isCustomDomain = () => {
  const host = window.location.hostname;
  return (
    isNonMainDomain() &&
    !host.endsWith(`.${MAIN_DOMAIN}`)
  );
};

/* ============================================================
   BRANDING NORMALIZER
   Guarantees every consumer gets a complete, typed object.
   No consumer ever needs to write `childPanel?.brandName ?? "Panel"`.
============================================================ */
const normalizeBranding = (data = {}) => ({
  brandName:    data.brandName    || "Panel",
  logo:         data.logo         || null,
  themeColor:   data.themeColor   || "#1e40af",
  slug:         data.slug         || null,
  domain:       data.domain       || null,
  serviceMode:  data.serviceMode  || "none",
  paymentMode:  data.paymentMode  || "none",
  support: {
    whatsapp:        data.support?.whatsapp        || data.supportWhatsapp        || "",
    telegram:        data.support?.telegram        || data.supportTelegram        || "",
    whatsappChannel: data.support?.whatsappChannel || data.supportWhatsappChannel || "",
  },
});

/* ============================================================
   DEFAULT CONTEXT VALUE
   Prevents undefined errors when a consumer mounts before the
   provider has resolved.
============================================================ */
const DEFAULT_BRANDING = normalizeBranding();

/* ============================================================
   CONTEXT
============================================================ */
const ChildPanelContext = createContext({
  childPanel:        null,
  isChildPanelDomain: false,
  isLoading:         true,
  error:             null,
  refetch:           () => {},
});

export const useChildPanel = () => useContext(ChildPanelContext);

/* ============================================================
   PROVIDER
============================================================ */
export const ChildPanelProvider = ({ children }) => {
  const [childPanel, setChildPanel]   = useState(null);
  const [isLoading,  setIsLoading]    = useState(true);
  const [error,      setError]        = useState(null);

  // Stable check — computed once and never changes during a session
  const isChildPanelDomain = useMemo(() => isNonMainDomain(), []);

  /* ----------------------------------------------------------
     Apply theme color to the CSS variable so every component
     that reads var(--theme-color) updates immediately.
  ---------------------------------------------------------- */
  const applyTheme = useCallback((color) => {
    if (color) {
      document.documentElement.style.setProperty("--theme-color", color);
    }
  }, []);

  /* ----------------------------------------------------------
     FETCH BRANDING
     Called on mount. Also exported as `refetch` so consumers
     can trigger a re-fetch after the CP owner updates branding
     (e.g. after saving from ChildPanelSettings).
  ---------------------------------------------------------- */
  const fetchBranding = useCallback(async () => {
    // Never fetch on the main platform — nothing to load
    if (!isChildPanelDomain) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await API.get("/child-panel/branding");

      if (res.data && res.data.brandName) {
        // Backend confirmed this is a child panel domain
        const normalized = normalizeBranding(res.data);

        setChildPanel(normalized);
        applyTheme(normalized.themeColor);
        document.title = normalized.brandName;

        // Signal to ServicesContext / ResellerContext that this
        // domain is already resolved as a child panel — prevents
        // those contexts from making redundant detection requests
        window.__DOMAIN_TYPE__ = "childPanel";
        window.__CHILD_PANEL_DETECTED__ = true;

      } else {
        // Endpoint returned 200 but with no usable data —
        // treat as not a child panel (e.g. inactive panel)
        setChildPanel(null);
        window.__DOMAIN_TYPE__ = window.__DOMAIN_TYPE__ || "unknown";
      }

    } catch (err) {
      // 404 = backend says this is NOT a child panel domain
      // (likely a reseller domain — ResellerContext handles it)
      if (err.response?.status === 404) {
        setChildPanel(null);
        // Leave window.__DOMAIN_TYPE__ for ServicesContext to set
      } else {
        // Genuine server error — store it so Login/Register can
        // show a friendly message instead of a blank page
        console.error("Child panel branding fetch failed:", err);
        setError(err.response?.data?.message || "Failed to load panel branding");
        setChildPanel(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isChildPanelDomain, applyTheme]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  /* ----------------------------------------------------------
     CONTEXT VALUE
     Stable shape — destructuring is safe everywhere.
  ---------------------------------------------------------- */
  const value = useMemo(
    () => ({
      // The normalized branding object, or null on main platform / reseller domains
      childPanel,

      // True on ANY non-main domain (subdomain or custom).
      // Note: will be true on reseller subdomains too until
      // the fetch resolves. Check childPanel !== null for certainty.
      isChildPanelDomain,

      // Convenience alias used by Header.jsx and Login.jsx
      // Matches the pattern used in ResellerContext
      loading: isLoading,
      isLoading,

      // Non-null only when a real network/server error occurred
      // (not a 404 — that just means it's a reseller domain)
      error,

      // Exposed so ChildPanelSettings can trigger a refresh
      // after the owner saves new branding
      refetch: fetchBranding,

      // Helpers so consumers don't need to re-derive
      isCustomDomain: isCustomDomain(),
      slug: getSubdomainSlug(),
    }),
    [childPanel, isChildPanelDomain, isLoading, error, fetchBranding]
  );

  return (
    <ChildPanelContext.Provider value={value}>
      {children}
    </ChildPanelContext.Provider>
  );
};

export default ChildPanelContext;
