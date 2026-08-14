// src/templates/tide/TideOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiSearch, FiPlus, FiChevronDown, FiChevronUp,
  FiEye, FiRefreshCw, FiXCircle, FiExternalLink,
} from "react-icons/fi";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

const STATUS_STYLE = {
  pending:    { bg: "#fef9c3", color: "#ca8a04", border: "#fde68a" },
  processing: { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  "in progress": { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  completed:  { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  partial:    { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  failed:     { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
  cancelled:  { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
  refunded:   { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};
const st = (s) => STATUS_STYLE[s?.toLowerCase()] || { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };

/* ── Details modal (own lightweight version, brand-color aware) ── */
function DetailsModal({ order, brandColor, formatMoney, onClose }) {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-black text-gray-900 mb-4">Order Details</h2>
        <div className="space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-gray-400">{k}</span>
              <span className="text-gray-800 font-medium text-right break-all">{v}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: brandColor }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function TideOrders() {
  const { childPanel } = useChildPanel();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [fromDate, setFromDate]       = useState("");
  const [toDate, setToDate]           = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats]             = useState(null);
  const [expanded, setExpanded]       = useState(null);
  const [viewOrder, setViewOrder]     = useState(null);
  const [settings, setSettings]       = useState({ globalRefillEnabled: true, globalCancelEnabled: true });
  const [actionLoading, setActionLoading] = useState(null);

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

  /* ---- settings (cancel/refill toggles) ---- */
  useEffect(() => {
    API.get("/services/service-settings").then((r) => setSettings(r.data || {})).catch(() => {});
  }, []);

  /* ---- fetch orders ---- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/my-orders", {
        params: { search, status, fromDate, toDate, page, limit: 10 },
      });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, status, fromDate, toDate, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* ---- stats ---- */
  useEffect(() => {
    API.get("/orders/my-orders/stats", { params: { status, fromDate, toDate } })
      .then((r) => setStats(r.data))
      .catch(() => setStats(null));
  }, [status, fromDate, toDate]);

  /* ---- realtime updates ---- */
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

  /* ---- actions ---- */
  const handleCancel = async (order) => {
    setActionLoading(order._id + "-cancel");
    try {
      await API.post(`/orders/${order._id}/cancel`);
      updateOrder(order._id, { cancelRequested: true, cancelStatus: "pending" });
      toast.success("Cancel request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefill = async (order) => {
    setActionLoading(order._id + "-refill");
    try {
      await API.post(`/orders/${order._id}/refill`);
      updateOrder(order._id, { refillRequested: true, refillStatus: "pending" });
      toast.success("Refill request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Refill failed");
    } finally {
      setActionLoading(null);
    }
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

  const inputClass =
    "px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800";

  const cancelStatusLabel = { pending: "Cancel requested", processing: "Cancelling…", success: "Cancelled", failed: "Cancel failed" };
  const refillStatusLabel = { pending: "Refill requested", processing: "Refilling…", success: "Refilled", failed: "Refill failed" };

  return (
    <TideLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900">Order History</h2>
            <p className="text-xs text-gray-400">{totalOrders} order{totalOrders !== 1 ? "s" : ""} total</p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: brand.color, boxShadow: `0 3px 10px ${brand.color}44` }}
          >
            <FiPlus size={14} /> New Order
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              ["Total", stats.total], ["Pending", stats.pending], ["Processing", stats.processing],
              ["In Progress", stats.inProgress], ["Completed", stats.completed],
              ["Partial", stats.partial], ["Failed", stats.failed],
            ].map(([label, val]) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-black" style={{ color: brand.color }}>{val ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-4 top-3.5 text-gray-300" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ID / service / link…"
              className={`w-full pl-10 ${inputClass}`}
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">All Statuses</option>
            {["pending", "processing", "in progress", "completed", "partial", "failed", "cancelled"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className={inputClass} />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className={inputClass} />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-400 text-sm">No orders found</p></div>
          ) : (
            <div>
              <div className="hidden md:grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-2">Order</div>
                <div className="col-span-3">Service</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-2">Charge</div>
                <div className="col-span-3">Status</div>
              </div>

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
                  <div key={order._id} className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => setExpanded(isExp ? null : order._id)}
                      className="w-full grid grid-cols-2 md:grid-cols-12 gap-2 px-5 py-4 text-left hover:bg-gray-50 transition-colors items-center"
                    >
                      <div className="md:col-span-2 text-xs font-bold text-gray-900">
                        #{order.customOrderId || order._id?.slice(-6)}
                      </div>
                      <div className="md:col-span-3 text-xs text-gray-600 truncate pr-2">{order.service}</div>
                      <div className="md:col-span-2 text-xs text-gray-500">
                        {order.quantityDelivered || 0}/{order.quantity}
                        <div className="w-full bg-gray-100 h-1.5 mt-1 rounded-full overflow-hidden">
                          <div className="h-1.5 rounded-full" style={{ width: `${progress}%`, background: brand.color }} />
                        </div>
                      </div>
                      <div className="md:col-span-2 text-xs font-semibold" style={{ color: brand.color }}>
                        {formatMoney(order.charge, 4)}
                      </div>
                      <div className="md:col-span-3 flex items-center gap-1.5">
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg capitalize"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {statusLabel}
                        </span>
                        {isExp ? <FiChevronUp size={12} className="text-gray-300" /> : <FiChevronDown size={12} className="text-gray-300" />}
                      </div>
                    </button>

                    {isExp && (
                      <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100 space-y-3">
                        <a href={order.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs pt-3" style={{ color: brand.color }}>
                          <FiExternalLink size={12} /> {order.link?.length > 50 ? order.link.slice(0, 50) + "…" : order.link}
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
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border"
                            style={{ borderColor: `${brand.color}44`, color: brand.color }}
                          >
                            <FiEye size={12} /> View
                          </button>

                          <button
                            onClick={() => handleReplace(order)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                            style={{ background: brand.color }}
                          >
                            <FiRefreshCw size={12} /> Replace
                          </button>

                          {canCancel && (
                            <button
                              onClick={() => handleCancel(order)}
                              disabled={actionLoading === order._id + "-cancel"}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 bg-red-50 border border-red-100 disabled:opacity-50"
                            >
                              <FiXCircle size={12} /> {actionLoading === order._id + "-cancel" ? "…" : "Cancel"}
                            </button>
                          )}
                          {order.cancelRequested && (
                            <span className="text-xs font-semibold text-gray-500 px-1 py-1.5">
                              {cancelStatusLabel[order.cancelStatus] || "Processing…"}
                            </span>
                          )}

                          {canRefill && (
                            <button
                              onClick={() => handleRefill(order)}
                              disabled={actionLoading === order._id + "-refill"}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-green-700 bg-green-50 border border-green-100 disabled:opacity-50"
                            >
                              <FiRefreshCw size={12} /> {actionLoading === order._id + "-refill" ? "…" : "Refill"}
                            </button>
                          )}
                          {order.refillRequested && (
                            <span className="text-xs font-semibold text-gray-500 px-1 py-1.5">
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 bg-white disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`e${idx}`} className="px-1 text-xs text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: page === p ? brand.color : "#fff",
                      color: page === p ? "#fff" : "#6b7280",
                      border: `1px solid ${page === p ? brand.color : "#e5e7eb"}`,
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 bg-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewOrder && (
        <DetailsModal order={viewOrder} brandColor={brand.color} formatMoney={formatMoney} onClose={() => setViewOrder(null)} />
      )}
    </TideLayout>
  );
        }
