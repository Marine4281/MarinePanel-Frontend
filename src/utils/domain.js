export const getResellerSlug = () => {
  const host = window.location.hostname;

  // example: smmlord.marinepanel.online
  const parts = host.split(".");

  // if localhost or main domain
  if (
    host.includes("localhost") ||
    host === "marinepanel.online" ||
    host === "www.marinepanel.online"
  ) {
    return null;
  }

  // return subdomain
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
};
