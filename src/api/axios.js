import axios from "axios";

// Create an Axios instance
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    // 🔥 reseller domain detection
    config.headers["x-reseller-domain"] = window.location.hostname;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
