// src/utils/networkManager.js
import api from "../api/axios";

/**
 * Central function to refresh all important data.
 * Call this when internet reconnects or manually if needed.
 */
export const refreshAllData = async () => {
  if (!navigator.onLine) {
    console.log("Offline: skipping data refresh");
    return;
  }

  try {
    // Fetch all data in parallel
    await Promise.all([
      api.get("/wallet"),
      api.get("/profile"),
      api.get("/orders"),
      api.get("/services"),
    ]);

    console.log("All data synced after reconnect");
  } catch (err) {
    console.error("Failed to refresh all data:", err.response?.data || err.message);
  }
};

/**
 * Setup the network manager to handle reconnection events.
 * Call this once in App.js (or main layout) inside useEffect.
 */
export const setupNetworkManager = () => {
  // Trigger data refresh when internet reconnects
  window.addEventListener("online", refreshAllData);

  // Optional: log when internet goes offline
  window.addEventListener("offline", () => {
    console.log("Internet connection lost");
  });

  // Cleanup function (optional if needed)
  return () => {
    window.removeEventListener("online", refreshAllData);
    window.removeEventListener("offline", () => {});
  };
};
