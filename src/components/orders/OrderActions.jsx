// src/components/orders/OrderActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const OrderActions = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  /* ===============================
     GLOBAL SETTINGS
  =============================== */
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["service-settings"],
    queryFn: async () => {
      const res = await API.get("/admin/service-settings");
      return res.data;
    },
  });

  // 🚫 Prevent UI flicker
  if (settingsLoading || !settings) return null;

  const refillEnabled = settings.globalRefillEnabled;
  const cancelEnabled = settings.globalCancelEnabled;

  /* ===============================
     CANCEL ORDER
  =============================== */
  const handleCancel = async () => {
    try {
      setLoading(true);

      await API.post(`/orders/${order._id}/cancel`);

      // Optimistic update
      onUpdate(order._id, {
        cancelRequested: true,
        cancelStatus: "pending",
      });

      toast.success("Cancel request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     REFILL ORDER
  =============================== */
  const handleRefill = async () => {
    try {
      setLoading(true);

      await API.post(`/orders/${order._id}/refill`);

      // Optimistic update
      onUpdate(order._id, {
        refillRequested: true,
        refillStatus: "pending",
      });

      toast.success("Refill request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Refill failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     CANCEL BUTTON
  =============================== */
  if (
    cancelEnabled &&
    order.cancelAllowed &&
    !order.cancelRequested &&
    order.status !== "completed" &&
    order.status !== "cancelled"
  ) {
    return (
      <button
        onClick={handleCancel}
        disabled={loading || order.cancelRequested}
        className="text-xs bg-red-500 text-white px-3 py-1 rounded"
      >
        {loading ? "..." : "Cancel"}
      </button>
    );
  }

  /* ===============================
     CANCEL STATUS
  =============================== */
  if (order.cancelRequested) {
    const map = {
      pending: "Cancel requested",
      processing: "Cancelling...",
      success: "Cancelled",
      failed: "Cancel failed",
    };

    return (
      <span className="text-xs text-gray-600">
        {map[order.cancelStatus] || "Processing..."}
      </span>
    );
  }

  /* ===============================
     REFILL BUTTON
  =============================== */
  if (
    refillEnabled &&
    order.refillAllowed &&
    !order.refillRequested &&
    ["completed", "partial"].includes(order.status)
  ) {
    return (
      <button
        onClick={handleRefill}
        disabled={loading || order.refillRequested}
        className="text-xs bg-green-600 text-white px-3 py-1 rounded"
      >
        {loading ? "..." : "Refill"}
      </button>
    );
  }

  /* ===============================
     REFILL STATUS
  =============================== */
  if (order.refillRequested) {
    const map = {
      pending: "Refill requested",
      processing: "Refilling...",
      success: "Refilled",
      failed: "Refill failed",
    };

    return (
      <span className="text-xs text-gray-600">
        {map[order.refillStatus] || "Processing..."}
      </span>
    );
  }

  return null;
};

export default OrderActions;
