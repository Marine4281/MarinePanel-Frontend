// src/components/AdminServiceTable/ServiceToggleActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ServiceToggleActions = () => {
  const [loadingRefill, setLoadingRefill] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const queryClient = useQueryClient();

  /* ===============================
     GLOBAL SETTINGS (SINGLE SOURCE)
  =============================== */
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["service-settings"],
    queryFn: async () => {
      const res = await API.get("/admin/service-settings");
      return res.data;
    },
  });

  /* ===============================
     SAFE LOADING STATES
  =============================== */
  if (isLoading) {
    return (
      <div className="p-3 text-sm text-gray-400">
        Loading settings...
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="p-3 text-sm text-red-500">
        Failed to load settings
      </div>
    );
  }

  const globalRefillEnabled = settings.globalRefillEnabled;
  const globalCancelEnabled = settings.globalCancelEnabled;

  /* ===============================
     TOGGLE REFILL
  =============================== */
  const toggleRefill = async () => {
    try {
      setLoadingRefill(true);

      await API.patch("/admin/services/toggle-refill-global");

      queryClient.invalidateQueries({ queryKey: ["service-settings"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });

    } catch (err) {
      console.error("Refill toggle error:", err);
      alert("Failed to toggle refill");
    } finally {
      setLoadingRefill(false);
    }
  };

  /* ===============================
     TOGGLE CANCEL
  =============================== */
  const toggleCancel = async () => {
    try {
      setLoadingCancel(true);

      await API.patch("/admin/services/toggle-cancel-global");

      queryClient.invalidateQueries({ queryKey: ["service-settings"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });

    } catch (err) {
      console.error("Cancel toggle error:", err);
      alert("Failed to toggle cancel");
    } finally {
      setLoadingCancel(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-gray-100 rounded-lg">

      {/* ================= REFILL ================= */}
      <button
        onClick={toggleRefill}
        disabled={loadingRefill}
        className={`px-3 py-2 rounded text-sm transition ${
          globalRefillEnabled ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {loadingRefill
          ? "..."
          : globalRefillEnabled
          ? "Disable ALL Refill"
          : "Enable ALL Refill"}
      </button>

      {/* ================= CANCEL ================= */}
      <button
        onClick={toggleCancel}
        disabled={loadingCancel}
        className={`px-3 py-2 rounded text-sm transition ${
          globalCancelEnabled ? "bg-red-500" : "bg-gray-400"
        }`}
      >
        {loadingCancel
          ? "..."
          : globalCancelEnabled
          ? "Disable ALL Cancel"
          : "Enable ALL Cancel"}
      </button>

    </div>
  );
};

export default ServiceToggleActions;
