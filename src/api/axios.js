import axios from "axios";

const isChildPanelDomain = () => {
  const host = window.location.hostname;
  const mainDomain = "marinepanel.online";
  if (
    host === "localhost" ||
    host === mainDomain ||
    host === `www.${mainDomain}`
  ) return false;
  return true; // custom domain or subdomain of mainDomain
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    const host = window.location.host;

    if (isChildPanelDomain()) {
      // Tell backend this is a child panel domain so it runs childPanelMiddleware
      config.headers["x-childpanel-domain"] = host;
    } else {
      // Main platform — send for reseller subdomain detection
      config.headers["x-reseller-domain"] = host;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
