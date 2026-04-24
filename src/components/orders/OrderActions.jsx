//src/components/orders/OrderActions.jsx
import { useState } from "react";
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const OrderActions = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  /* ===============================
     GLOBAL SETTINGS (NEW)
  =============================== */
  const { data: settings } = useQuery({
    queryKey: ["service-settings"],
    queryFn: async () => {
      const res = await API.get("/admin/service-settings");
      return res.data;
    },
  });

  const refillEnabled = settings?.globalRefillEnabled ?? true;
  const cancelEnabled = settings?.globalCancelEnabled ?? true;

  /* ===============================
     CANCEL ORDER
  =============================== */
  const handleCancel = async () => {
    try {
      setLoading(true);

      await API.post(`/orders/${order._id}/cancel`);

      onUpdate(order._id, {
        cancelRequested: true,
        cancelStatus: "pending",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
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

      onUpdate(order._id, {
        refillRequested: true,
        refillStatus: "pending",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Refill failed");
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
    ["pending", "processing"].includes(order.status) &&
    !order.cancelRequested
  ) {
    return (
      <button
        onClick={handleCancel}
        disabled={loading}
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
    order.status === "completed" &&
    !order.refillRequested
  ) {
    return (
      <button
        onClick={handleRefill}
        disabled={loading}
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
