// src/api/axios.js
import axios from "axios";

const BASE_DOMAIN = "marinepanel.online";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // 1. Auth token
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const host = window.location.hostname;

  // 2. Skip domain headers on main platform and localhost
  if (host === BASE_DOMAIN || host === "localhost" || host === "127.0.0.1") {
    return config;
  }

  // 3. Determine domain type from stored user object (set at login)
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  // 4. Child panel owner OR user registered on a child panel
  //    → send x-childpanel-domain so backend sets req.childPanel + correct scope
  if (user?.isChildPanel || user?.scope !== "platform") {
    config.headers["x-childpanel-domain"] = host;
  } else {
    // Reseller domain or reseller's end-user
    // → send x-reseller-domain so backend sets req.reseller + req.brand
    config.headers["x-reseller-domain"] = host;
  }

  return config;
});

export default api;
