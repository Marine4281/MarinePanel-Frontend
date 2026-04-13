import { useState } from "react";
import API from "../../api/axios";

const OrderActions = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);

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

      alert("Refill request sent");
    } catch (err) {
      alert(err.response?.data?.message || "Refill failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER LOGIC (NO COLLISION 🔥)
  =============================== */

  // 🔴 CANCEL (pending / processing only)
  if (
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

  // 🟡 CANCEL STATUS DISPLAY
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

  // 🟢 REFILL (completed only)
  if (order.status === "completed") {
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

  return null;
};

export default OrderActions;
