// src/utils/networkManager.js

import api from "../api/axios";

/**
 * refreshAllData
 * Fetches wallet, profile, orders, services and updates contexts
 * @param {object} authContext - the AuthContext (provides login method)
 * @param {object} servicesContext - the ServicesContext (provides refreshAll method)
 */
export const refreshAllData = async (authContext, servicesContext) => {
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
    if (servicesContext?.refreshAll) {
      await servicesContext.refreshAll(); // refresh services and any related data
    }

    // 🔹 Update AuthContext
    if (authContext?.login) {
      authContext.login(profileRes.data); // update user profile
    }

    console.log("✅ All data synced after reconnect");
  } catch (err) {
    console.error(
      "❌ Failed to refresh all data:",
      err.response?.data || err.message
    );
  }
};

/**
 * setupNetworkManager
 * Listens for offline → online events and triggers refreshAllData
 * @param {object} authContext - useAuthContext()
 * @param {object} servicesContext - useServices()
 */
export const setupNetworkManager = (authContext, servicesContext) => {
  const handleOnline = () => {
    console.log("🔄 Internet reconnected — syncing all data...");
    refreshAllData(authContext, servicesContext);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", () => {
    console.log("⚠️ Internet connection lost");
  });

  // Cleanup function for useEffect
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", () => {});
  };
};
