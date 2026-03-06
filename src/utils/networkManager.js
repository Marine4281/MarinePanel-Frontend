// src/utils/networkManager.js

import api from "../api/axios";

/**
 * refreshAllData
 * Fetches wallet, profile, orders, services and updates contexts
 * @param {function} authDispatch - dispatch function from AuthContext
 * @param {function} servicesDispatch - dispatch function from ServicesContext
 */
export const refreshAllData = async (authDispatch, servicesDispatch) => {
  if (!navigator.onLine) {
    console.log("Offline: skipping data refresh");
    return;
  }

  try {
    // Fetch all data in parallel
    const [walletRes, profileRes, ordersRes, servicesRes] = await Promise.all([
      api.get("/wallet"),
      api.get("/profile"),
      api.get("/orders"),
      api.get("/services"),
    ]);

    // 🔹 Update ServicesContext
    servicesDispatch({ type: "SET_WALLET", payload: walletRes.data });
    servicesDispatch({ type: "SET_ORDERS", payload: ordersRes.data });
    servicesDispatch({ type: "SET_SERVICES", payload: servicesRes.data });

    // 🔹 Update AuthContext
    authDispatch({ type: "SET_PROFILE", payload: profileRes.data });

    console.log("All data synced and UI updated");
  } catch (err) {
    console.error("Failed to refresh all data:", err.response?.data || err.message);
  }
};

/**
 * setupNetworkManager
 * Listens for offline → online events and triggers refreshAllData
 * @param {function} authDispatch - dispatch from AuthContext
 * @param {function} servicesDispatch - dispatch from ServicesContext
 */
export const setupNetworkManager = (authDispatch, servicesDispatch) => {
  const handleOnline = () => {
    console.log("Internet reconnected, syncing all data...");
    refreshAllData(authDispatch, servicesDispatch);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", () => {
    console.log("Internet connection lost");
  });

  // Cleanup function for useEffect
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", () => {});
  };
};
