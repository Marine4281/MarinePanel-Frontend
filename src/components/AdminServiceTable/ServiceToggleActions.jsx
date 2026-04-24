// src/components/AdminServiceTable/ServiceToggleActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ServiceToggleActions = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // 🔥 fetch global settings
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await API.get("/admin/service");
      return res.data;
    },
  });

  const toggleRefill = async () => {
    try {
      setLoading(true);

      await API.patch("/admin/services/toggle-refill-global");

      queryClient.invalidateQueries(["settings"]);
      queryClient.invalidateQueries(["services"]);

    } catch (err) {
      alert("Failed to toggle refill");
    } finally {
      setLoading(false);
    }
  };

  const toggleCancel = async () => {
    try {
      setLoading(true);

      await API.patch("/admin/services/toggle-cancel-global");

      queryClient.invalidateQueries(["settings"]);
      queryClient.invalidateQueries(["services"]);

    } catch (err) {
      alert("Failed to toggle cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-gray-100 rounded-lg">

      <button
        onClick={toggleRefill}
        disabled={loading}
        className={`px-3 py-2 rounded text-sm ${
          settings?.globalRefillEnabled ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {settings?.globalRefillEnabled ? "Disable ALL Refill" : "Enable ALL Refill"}
      </button>

      <button
        onClick={toggleCancel}
        disabled={loading}
        className={`px-3 py-2 rounded text-sm ${
          settings?.globalCancelEnabled ? "bg-red-500" : "bg-gray-400"
        }`}
      >
        {settings?.globalCancelEnabled ? "Disable ALL Cancel" : "Enable ALL Cancel"}
      </button>

    </div>
  );
};

export default ServiceToggleActions;
