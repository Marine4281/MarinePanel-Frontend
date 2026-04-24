// src/components/AdminServiceTable/ServiceToggleActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ServiceToggleActions = () => {
  const [loadingRefill, setLoadingRefill] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const queryClient = useQueryClient();

  // ✅ SINGLE SOURCE OF TRUTH
  const { data: settings } = useQuery({
    queryKey: ["service-settings"],
    queryFn: async () => {
      const res = await API.get("/admin/service-settings");
      return res.data;
    },
  });

  if (!settings) return null; // prevent flicker

  const globalRefillEnabled = settings.globalRefillEnabled;
  const globalCancelEnabled = settings.globalCancelEnabled;

  // ================= TOGGLE REFILL =================
  const toggleRefill = async () => {
    try {
      setLoadingRefill(true);

      await API.patch("/admin/services/toggle-refill-global");

      queryClient.invalidateQueries({ queryKey: ["service-settings"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });

    } catch {
      alert("Failed to toggle refill");
    } finally {
      setLoadingRefill(false);
    }
  };

  // ================= TOGGLE CANCEL =================
  const toggleCancel = async () => {
    try {
      setLoadingCancel(true);

      await API.patch("/admin/services/toggle-cancel-global");

      queryClient.invalidateQueries({ queryKey: ["service-settings"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });

    } catch {
      alert("Failed to toggle cancel");
    } finally {
      setLoadingCancel(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-gray-100 rounded-lg">

      {/* REFILL */}
      <button
        onClick={toggleRefill}
        disabled={loadingRefill}
        className={`px-3 py-2 rounded text-sm ${
          globalRefillEnabled ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {loadingRefill
          ? "..."
          : globalRefillEnabled
          ? "Disable ALL Refill"
          : "Enable ALL Refill"}
      </button>

      {/* CANCEL */}
      <button
        onClick={toggleCancel}
        disabled={loadingCancel}
        className={`px-3 py-2 rounded text-sm ${
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
