// src/pages/childpanel/ChildPanelOrders.jsx
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";

import CPOrdersStats from "../../components/childpanel/orders/CPOrdersStats";
import CPOrdersFilters from "../../components/childpanel/orders/CPOrdersFilters";
import CPOrdersList from "../../components/childpanel/orders/CPOrdersList";
import CPOrdersCustomRefundModal from "../../components/childpanel/orders/CPOrdersCustomRefundModal";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

export default function ChildPanelOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalPages, setTotalPages]   = useState(1);
  const [processingId, setProcessingId] = useState(null);
  const [progressInput, setProgressInput] = useState({});
  const [customRefundOrder, setCustomRefundOrder] = useState(null);

  // Filters
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [page, setPage]         = useState(1);

  // ── Fetch ──────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/cp/orders", {
        params: { search, status, fromDate, toDate, page, limit: 20 },
      });
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, status, fromDate, toDate, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Socket real-time ───────────────────────────────────
  useEffect(() => {
    socket.on("order:update", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data._id
            ? { ...o, status: data.status, quantityDelivered: data.quantityDelivered }
            : o
        )
      );
    });
    return () => socket.off("order:update");
  }, []);

  // ── Actions ────────────────────────────────────────────
  const updateStatus = async (id, newStatus) => {
    try {
      setProcessingId(id);
      const res = await API.post(`/cp/orders/${id}/status`, { status: newStatus });
      toast.success("Status updated");
      if (res.data.refundAmount > 0)
        toast.success(`Refunded $${Number(res.data.refundAmount).toFixed(4)}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProcessingId(null);
    }
  };

  const updateProgress = async (order) => {
    const value = Number(progressInput[order._id]);
    if (isNaN(value)) return toast.error("Enter a valid number");
    try {
      setProcessingId(order._id);
      await API.patch(`/cp/orders/${order._id}/progress`, { quantityDelivered: value });
      toast.success("Progress updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update progress");
    } finally {
      setProcessingId(null);
    }
  };

  const refundOrder = async (order, type, customAmount) => {
    if (type === "custom") {
      setCustomRefundOrder(order);
      return;
    }
    if (!window.confirm(`${type === "full" ? "Full" : "Partial"} refund for #${order.customOrderId}?`)) return;
    try {
      setProcessingId(order._id);
      const res = await API.post(`/cp/orders/${order._id}/refund`, { type });
      toast.success(`Refunded $${Number(res.data.refundAmount).toFixed(4)}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCustomRefund = async (amount) => {
    if (!customRefundOrder) return;
    try {
      setProcessingId(customRefundOrder._id);
      const res = await API.post(`/cp/orders/${customRefundOrder._id}/refund`, {
        type: "custom",
        customAmount: amount,
      });
      toast.success(`Refunded $${Number(res.data.refundAmount).toFixed(4)}`);
      setCustomRefundOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <ChildPanelLayout>
      <div>
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">Manage orders placed on your panel</p>
        </div>

        <CPOrdersStats
          search={search}
          status={status}
          fromDate={fromDate}
          toDate={toDate}
        />

        <CPOrdersFilters
          search={search}  setSearch={setSearch}
          status={status}  setStatus={setStatus}
          fromDate={fromDate} setFromDate={setFromDate}
          toDate={toDate}  setToDate={setToDate}
          onSearch={() => { setPage(1); fetchOrders(); }}
        />

        <CPOrdersList
          orders={orders}
          loading={loading}
          processingId={processingId}
          progressInput={progressInput}
          setProgressInput={setProgressInput}
          updateStatus={updateStatus}
          updateProgress={updateProgress}
          refundOrder={refundOrder}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Custom Refund Modal */}
      {customRefundOrder && (
        <CPOrdersCustomRefundModal
          order={customRefundOrder}
          onConfirm={handleCustomRefund}
          onClose={() => setCustomRefundOrder(null)}
        />
      )}
    </ChildPanelLayout>
  );
}
