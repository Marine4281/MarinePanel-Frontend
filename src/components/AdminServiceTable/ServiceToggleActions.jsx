// src/components/AdminServiceTable/ServiceToggleActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/queryKeys";

const ServiceToggleActions = ({ service }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // ================= TOGGLE REFILL =================
  const toggleRefill = async () => {
    try {
      setLoading(true);

      await API.patch(`/admin/services/${service._id}/toggle-refill`);

      // 🔥 auto refresh services
      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);

    } catch (err) {
      alert(err.response?.data?.message || "Failed to update refill");
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE CANCEL =================
  const toggleCancel = async () => {
    try {
      setLoading(true);

      await API.patch(`/admin/services/${service._id}/toggle-cancel`);

      // 🔥 auto refresh services
      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);

    } catch (err) {
      alert(err.response?.data?.message || "Failed to update cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">

      {/* ================= REFILL TOGGLE ================= */}
      <button
        onClick={toggleRefill}
        disabled={loading}
        className={`px-2 py-1 text-xs rounded transition ${
          service.refillAllowed ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {loading
          ? "..."
          : service.refillAllowed
          ? "Disable Refill"
          : "Enable Refill"}
      </button>

      {/* ================= CANCEL TOGGLE ================= */}
      <button
        onClick={toggleCancel}
        disabled={loading}
        className={`px-2 py-1 text-xs rounded transition ${
          service.cancelAllowed ? "bg-red-500" : "bg-gray-400"
        }`}
      >
        {loading
          ? "..."
          : service.cancelAllowed
          ? "Disable Cancel"
          : "Enable Cancel"}
      </button>

    </div>
  );
};

export default ServiceToggleActions;
