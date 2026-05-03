const MAIN_DOMAIN = "marinepanel.online";

export const getResellerSlug = () => {
  const host = window.location.hostname;
  if (
    host === "localhost" ||
    host === MAIN_DOMAIN ||
    host === `www.${MAIN_DOMAIN}`
  ) return null;

  const parts = host.split(".");
  if (parts.length > 2 && host.endsWith(MAIN_DOMAIN)) {
    return parts[0]; // subdomain slug
  }
  return null;
};

export const isChildPanelDomain = () => {
  const host = window.location.hostname;
  if (
    host === "localhost" ||
    host === MAIN_DOMAIN ||
    host === `www.${MAIN_DOMAIN}`
  ) return false;
  return true; // any subdomain or custom domain that isn't main
};

export const isMainDomain = () => {
  const host = window.location.hostname;
  return host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}` || host === "localhost";
};
