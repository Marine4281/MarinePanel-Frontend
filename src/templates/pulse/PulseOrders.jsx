// src/templates/pulse/PulseOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiSearch, FiZap, FiChevronDown, FiChevronUp,
  FiEye, FiRefreshCw, FiXCircle, FiExternalLink, FiX,
} from "react-icons/fi";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

const STATUS = {
  pending:      { bg: "#fef9c3", color: "#ca8a04" },
  processing:   { bg: "#dbeafe", color: "#2563eb" },
  "in progress":{ bg: "#dbeafe", color: "#2563eb" },
  completed:    { bg: "#dcfce7", color: "#16a34a" },
  cancelled:    { bg: "#fee2e2", color: "#dc2626" },
  failed:       { bg: "#fee2e2", color: "#dc2626" },
  refunded:     { bg: "#f3f4f6", color: "#6b7280" },
  partial:      { bg: "#ede9fe", color: "#7c3aed" },
};
const st = (s) => STATUS[s?.toLowerCase()] || { bg: "#f3f4f6", color: "#6b7280" };

function DetailsSheet({ order, brand, formatMoney, onClose }) {
  if (!order) return null;
  const rows = [
    ["Order ID", `#${order.customOrderId || order._id?.slice(-6)}`],
    ["Platform", order.platform || "—"],
    ["Category", order.category || "—"],
    ["Service", order.service || "—"],
    ["Rate / 1K", order.rate != null ? formatMoney(order.rate, 4) : "—"],
    ["Link", order.link || "—"],
    ["Quantity", order.quantity ?? "—"],
    ["Delivered", order.quantityDelivered ?? 0],
    ["Charge", formatMoney(order.charge, 4)],
    ["Placed", new Date(order.createdAt).toLocaleString()],
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <p className="font-black text-gray-900 text-sm">Order Details</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6", color: "#6b7280" }}>
            <FiX size={16} />
          </button>
        </div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-xs">
            <span className="text-gray-400">{k}</span>
            <span className="text-gray-800 font-semibold text-right break-all">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PulseOrders() {
  const { childPanel } = useChildPanel();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [fromDate, setFromDate]       = useState("");
  const [toDate, setToDate]           = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats]             = useState(null);
  const [expanded, setExpanded]       = useState(null);
  const [viewOrder, setViewOrder]     = useState(null);
  const [settings, setSettings]       = useState({ globalRefillEnabled: true, globalCancelEnabled: true });
  const [actionLoading, setActionLoading] = useState(null);

  const brand = { color: childPanel?.themeColor || "#6366f1" };

  useEffect(() => {
    API.get("/services/service-settings").then((r) => setSettings(r.data || {})).catch(() => {});
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/my-orders", { params: { search, status, fromDate, toDate, page, limit: 10 } });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally { setLoading(false); }
  }, [search, status, fromDate, toDate, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    API.get("/orders/my-orders/stats", { params: { status, fromDate, toDate } })
      .then((r) => setStats(r.data))
      .catch(() => setStats(null));
  }, [status, fromDate, toDate]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?._id) socket.emit("join_user_room", user._id);

    const handler = (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId
            ? {
                ...o,
                status: data.status,
                displayStatus: data.providerStatus
                  ? data.providerStatus
                      .replace("in progress", "In progress")
                      .replace("inprogress", "In progress")
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : data.status,
                quantityDelivered: data.delivered,
                refundProcessed: data.refundProcessed,
              }
            : o
        )
      );
    };
    socket.on("orderUpdated", handler);
    return () => socket.off("orderUpdated", handler);
  }, []);

  const updateOrder = (id, patch) =>
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...patch } : o)));

  const handleCancel = async (order) => {
    setActionLoading(order._id + "-cancel");
    try {
      await API.post(`/orders/${order._id}/cancel`);
      updateOrder(order._id, { cancelRequested: true, cancelStatus: "pending" });
      toast.success("Cancel request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally { setActionLoading(null); }
  };

  const handleRefill = async (order) => {
    setActionLoading(order._id + "-refill");
    try {
      await API.post(`/orders/${order._id}/refill`);
      updateOrder(order._id, { refillRequested: true, refillStatus: "pending" });
      toast.success("Refill request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Refill failed");
    } finally { setActionLoading(null); }
  };

  const handleReplace = (order) => {
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

  const cancelStatusLabel = { pending: "Cancel requested", processing: "Cancelling…", success: "Cancelled", failed: "Cancel failed" };
  const refillStatusLabel = { pending: "Refill requested", processing: "Refilling…", success: "Refilled", failed: "Refill failed" };

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4 → max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl font-black text-gray-900">Orders</h2>
            <p className="text-xs text-gray-400">{totalOrders} order{totalOrders !== 1 ? "s" : ""} total</p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="text-xs px-3 py-2 rounded-2xl font-bold"
            style={{ background: `${brand.color}12`, color: brand.color }}
          >
            + New
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-1.5">
            {[["Total", stats.total], ["Pending", stats.pending], ["Active", stats.processing + (stats.inProgress || 0)], ["Done", stats.completed]].map(([label, val]) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-2 text-center">
                <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
                <p className="text-sm font-black" style={{ color: brand.color }}>{val ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch size={13} className="absolute left-3.5 top-3 text-gray-300" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search…"
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl text-xs border border-gray-100 bg-white outline-none text-gray-800"
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-2xl text-xs border border-gray-100 bg-white outline-none text-gray-800 appearance-none"
              style={{ minWidth: 90 }}
            >
              <option value="">All</option>
              {["pending", "processing", "in progress", "completed", "cancelled", "partial", "failed"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="px-3 py-2.5 rounded-2xl text-xs font-bold border border-gray-100 bg-white text-gray-500"
            >
              Dates
            </button>
          </div>
          {showFilters && (
            <div className="flex gap-2">
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="flex-1 px-3 py-2 rounded-2xl text-xs border border-gray-100 bg-white outline-none text-gray-800" />
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="flex-1 px-3 py-2 rounded-2xl text-xs border border-gray-100 bg-white outline-none text-gray-800" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-14">
            <FiZap size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const s = st(order.displayStatus || order.status);
              const isExp = expanded === order._id;
              const progress = Math.min(((order.quantityDelivered || 0) / (order.quantity || 1)) * 100, 100);
              const statusLabel = order.displayStatus || order.status;

              const canCancel = settings.globalCancelEnabled && order.cancelAllowed &&
                !order.cancelRequested && !["completed", "cancelled"].includes(order.status);
              const canRefill = settings.globalRefillEnabled && order.refillAllowed &&
                !order.refillRequested && ["completed", "partial"].includes(order.status);

              return (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExp ? null : order._id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-black text-gray-900">
                        #{order.customOrderId || order._id?.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{order.service}</p>
                      <div className="w-24 bg-gray-100 h-1 mt-1.5 rounded-full overflow-hidden">
                        <div className="h-1 rounded-full" style={{ width: `${progress}%`, background: brand.color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-black" style={{ color: brand.color }}>{formatMoney(order.charge, 4)}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize" style={{ background: s.bg, color: s.color }}>
                        {statusLabel}
                      </span>
                      {isExp ? <FiChevronUp size={14} className="text-gray-300" /> : <FiChevronDown size={14} className="text-gray-300" />}
                    </div>
                  </button>

                  {isExp && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                      <a href={order.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs" style={{ color: brand.color }}>
                        <FiExternalLink size={11} /> {order.link?.length > 40 ? order.link.slice(0, 40) + "…" : order.link}
                      </a>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>

                      {order.status === "failed" && order.refundProcessed && (
                        <p className="text-xs font-semibold text-green-600">Refunded</p>
                      )}
                      {order.status === "partial" && order.refundProcessed && (
                        <p className="text-xs font-semibold text-green-600">Partial refund processed</p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: "#f3f4f6", color: "#4b5563" }}
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleReplace(order)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                          style={{ background: brand.color }}
                        >
                          <FiRefreshCw size={12} /> Replace
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order)}
                            disabled={actionLoading === order._id + "-cancel"}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full disabled:opacity-50"
                            style={{ background: "#fef2f2", color: "#dc2626" }}
                          >
                            <FiXCircle size={12} /> {actionLoading === order._id + "-cancel" ? "…" : "Cancel"}
                          </button>
                        )}
                        {order.cancelRequested && (
                          <span className="text-xs font-semibold px-1 py-1.5 text-gray-400">
                            {cancelStatusLabel[order.cancelStatus] || "Processing…"}
                          </span>
                        )}
                        {canRefill && (
                          <button
                            onClick={() => handleRefill(order)}
                            disabled={actionLoading === order._id + "-refill"}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full disabled:opacity-50"
                            style={{ background: "#f0fdf4", color: "#16a34a" }}
                          >
                            <FiRefreshCw size={12} /> {actionLoading === order._id + "-refill" ? "…" : "Refill"}
                          </button>
                        )}
                        {order.refillRequested && (
                          <span className="text-xs font-semibold px-1 py-1.5 text-gray-400">
                            {refillStatusLabel[order.refillStatus] || "Processing…"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
              style={{ background: "#f3f4f6", color: "#6b7280" }}
            >
              Prev
            </button>
            <span className="text-xs font-semibold text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
              style={{ background: "#f3f4f6", color: "#6b7280" }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewOrder && (
        <DetailsSheet order={viewOrder} brand={brand} formatMoney={formatMoney} onClose={() => setViewOrder(null)} />
      )}
    </PulseLayout>
  );
         }
