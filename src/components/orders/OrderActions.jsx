// src/components/orders/OrderActions.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import OrderDetailsModal from "./OrderDetailsModal";

const OrderActions = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  /* ===============================
     GLOBAL SETTINGS (SAFE)
  =============================== */
  const { data: settings } = useQuery({
    queryKey: ["service-settings"],
    queryFn: async () => {
      const res = await API.get("/services/service-settings");
      return res.data;
    },
    retry: 1,
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
     REPLACE ORDER
  =============================== */
  const handleReplace = () => {
    navigate("/home", {
      state: {
        prefill: {
          platform: order.platform,
          category: order.category,
          service: order.service,
          link: order.link,
          quantity: order.quantity,
        },
      },
    });
  };

  /* ===============================
     RENDER ACTIONS
  =============================== */
  const renderActions = () => {
    const actions = [];

    /* ===== VIEW (ALWAYS AVAILABLE) ===== */
    actions.push(
      <button
        key="view"
        onClick={() => setShowDetails(true)}
        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
      >
        View
      </button>
    );

    /* ===== REPLACE (ALWAYS AVAILABLE) ===== */
    actions.push(
      <button
        key="replace"
        onClick={handleReplace}
        className="text-xs bg-orange-500 text-white px-2 py-1 rounded"
      >
        Replace
      </button>
    );

    /* ===== CANCEL BUTTON ===== */
    if (
      cancelEnabled &&
      order?.cancelAllowed &&
      !order?.cancelRequested &&
      order?.status !== "completed" &&
      order?.status !== "cancelled"
    ) {
      actions.push(
        <button
          key="cancel"
          onClick={handleCancel}
          disabled={loading}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          {loading ? "..." : "Cancel"}
        </button>
      );
    }

    /* ===== CANCEL STATUS ===== */
    if (order?.cancelRequested) {
      const map = {
        pending: "Cancel requested",
        processing: "Cancelling...",
        success: "Cancelled",
        failed: "Cancel failed",
      };

      actions.push(
        <span key="cancel-status" className="text-xs text-gray-600">
          {map[order.cancelStatus] || "Processing..."}
        </span>
      );
    }

    /* ===== REFILL BUTTON ===== */
    if (
      refillEnabled &&
      order?.refillAllowed &&
      !order?.refillRequested &&
      ["completed", "partial"].includes(order?.status)
    ) {
      actions.push(
        <button
          key="refill"
          onClick={handleRefill}
          disabled={loading}
          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
        >
          {loading ? "..." : "Refill"}
        </button>
      );
    }

    /* ===== REFILL STATUS ===== */
    if (order?.refillRequested) {
      const map = {
        pending: "Refill requested",
        processing: "Refilling...",
        success: "Refilled",
        failed: "Refill failed",
      };

      actions.push(
        <span key="refill-status" className="text-xs text-gray-600">
          {map[order.refillStatus] || "Processing..."}
        </span>
      );
    }

    return actions;
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {renderActions()}
      </div>

      {/* MODAL */}
      {showDetails && (
        <OrderDetailsModal
          order={order}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default OrderActions;
