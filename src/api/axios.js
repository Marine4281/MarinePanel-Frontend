// src/api/axios.js

import axios from "axios";

const BASE_DOMAIN = "marinepanel.online";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

/* =========================================================
REQUEST INTERCEPTOR
========================================================= */
api.interceptors.request.use(
  (config) => {
    /* =====================================================
    1. LOAD USER SAFELY
    ===================================================== */
    let user = {};

    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (err) {
      user = {};
    }

    /* =====================================================
    2. SUPPORT OLD + NEW TOKEN STORAGE
       - localStorage.token
       - user.token
    ===================================================== */
    const standaloneToken = localStorage.getItem("token");
    const userToken = user?.token;

    const token = standaloneToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /* =====================================================
    3. DOMAIN DETECTION
    ===================================================== */
    const hostname = window.location.hostname;
    const fullHost = window.location.host;

    const isMainPlatform =
      hostname === BASE_DOMAIN ||
      hostname === `www.${BASE_DOMAIN}` ||
      hostname === "localhost" ||
      hostname === "127.0.0.1";

    /* =====================================================
    4. MAIN PLATFORM — no extra headers needed
    ===================================================== */
    if (isMainPlatform) {
      return config;
    }

    /* =====================================================
    5. EXTERNAL DOMAIN — always send the host header.
       The backend middleware figures out if it's a child
       panel or reseller by looking up the host in the DB.
       We must NOT gate this on the user object because
       unauthenticated users (login, register) have no
       user in localStorage yet.
    ===================================================== */
    config.headers["x-childpanel-domain"] = fullHost;

    /* ===================================================
    6. RESELLER DOMAIN
    =================================================== */
    config.headers["x-reseller-domain"] = fullHost;

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
RESPONSE INTERCEPTOR
========================================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error?.response?.data || error.message
    );

    /*
    OPTIONAL:
    Auto logout if token becomes invalid
    Uncomment if desired

    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    */

    return Promise.reject(error);
  }
);

export default api;
