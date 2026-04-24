// src/components/AdminServiceTable/ServiceToggleActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ServiceToggleActions = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // ✅ fetch services (NOT settings)
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await API.get("/admin/services");
      return res.data;
    },
  });

  // ✅ derive global state
  const globalRefillEnabled = services.length
    ? services.every((s) => s.refillAllowed)
    : false;

  const globalCancelEnabled = services.length
    ? services.every((s) => s.cancelAllowed)
    : false;

  // ================= TOGGLE REFILL =================
  const toggleRefill = async () => {
    try {
      setLoading(true);

      await API.patch("/admin/services/toggle-refill-global");

      queryClient.invalidateQueries({ queryKey: ["services"] });

    } catch (err) {
      alert("Failed to toggle refill");
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE CANCEL =================
  const toggleCancel = async () => {
    try {
      setLoading(true);

      await API.patch("/admin/services/toggle-cancel-global");

      queryClient.invalidateQueries({ queryKey: ["services"] });

    } catch (err) {
      alert("Failed to toggle cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-gray-100 rounded-lg">

      {/* REFILL */}
      <button
        onClick={toggleRefill}
        disabled={loading}
        className={`px-3 py-2 rounded text-sm ${
          globalRefillEnabled ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {loading
          ? "..."
          : globalRefillEnabled
          ? "Disable ALL Refill"
          : "Enable ALL Refill"}
      </button>

      {/* CANCEL */}
      <button
        onClick={toggleCancel}
        disabled={loading}
        className={`px-3 py-2 rounded text-sm ${
          globalCancelEnabled ? "bg-red-500" : "bg-gray-400"
        }`}
      >
        {loading
          ? "..."
          : globalCancelEnabled
          ? "Disable ALL Cancel"
          : "Enable ALL Cancel"}
      </button>

    </div>
  );
};

export default ServiceToggleActions;
