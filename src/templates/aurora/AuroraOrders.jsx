// src/templates/aurora/AuroraOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import AuroraLayout from "./AuroraLayout";
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

const STATUS_COLORS = {
  pending:       { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  processing:    { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  "in progress": { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  completed:     { bg: "rgba(52,211,153,0.15)",  color: "#34d399" },
  cancelled:     { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  failed:        { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  refunded:      { bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
  partial:       { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
};
const statusStyle = (s) => STATUS_COLORS[s?.toLowerCase()] || { bg: "rgba(255,255,255,0.08)", color: "#94a3b8" };

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div
        className="relative w-full max-w-md rounded-2xl p-5 space-y-3"
        style={{ background: "#1a1730", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-black text-white text-sm">Order Details</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
            <FiX size={16} />
          </button>
        </div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-xs">
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
            <span className="text-white font-medium text-right break-all">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuroraOrders() {
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

  const brand = { color: childPanel?.themeColor || "#a78bfa" };

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
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-5 pt-2">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand.color }}>
              My Orders
            </p>
            <h2 className="text-2xl font-black text-white">Order History</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{totalOrders} order{totalOrders !== 1 ? "s" : ""} total</p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="text-xs px-3 py-2 rounded-xl font-semibold"
            style={{ background: `${brand.color}20`, color: brand.color }}
          >
            + New Order
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {[["Total", stats.total], ["Pending", stats.pending], ["Active", stats.processing + (stats.inProgress || 0)], ["Done", stats.completed]].map(([label, val]) => (
              <div key={label} className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[9px] font-bold uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                <p className="text-sm font-black" style={{ color: brand.color }}>{val ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch size={13} className="absolute left-3 top-3" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search orders…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }}
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl text-xs appearance-none outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }}
            >
              <option value="" style={{ background: "#1a1730" }}>All</option>
              {["pending", "processing", "in progress", "completed", "cancelled", "partial", "failed"].map((s) => (
                <option key={s} value={s} style={{ background: "#1a1730" }}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              Dates
            </button>
          </div>
          {showFilters && (
            <div className="flex gap-2">
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }} />
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }} />
            </div>
          )}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-14">
            <FiZap size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
            <p style={{ color: "rgba(255,255,255,0.35)" }}>No orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const st = statusStyle(order.displayStatus || order.status);
              const isExp = expanded === order._id;
              const progress = Math.min(((order.quantityDelivered || 0) / (order.quantity || 1)) * 100, 100);
              const statusLabel = order.displayStatus || order.status;

              const canCancel = settings.globalCancelEnabled && order.cancelAllowed &&
                !order.cancelRequested && !["completed", "cancelled"].includes(order.status);
              const canRefill = settings.globalRefillEnabled && order.refillAllowed &&
                !order.refillRequested && ["completed", "partial"].includes(order.status);

              return (
                <div
                  key={order._id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <button
                    onClick={() => setExpanded(isExp ? null : order._id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white">
                        #{order.customOrderId || order._id?.slice(-6)}
                      </p>
                      <p className="text-xs truncate max-w-[160px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {order.service}
                      </p>
                      <div className="w-24 h-1 mt-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-1 rounded-full" style={{ width: `${progress}%`, background: brand.color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: brand.color }}>{formatMoney(order.charge, 4)}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>
                        {statusLabel}
                      </span>
                      {isExp ? <FiChevronUp size={14} style={{ color: "rgba(255,255,255,0.3)" }} /> : <FiChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
                    </div>
                  </button>

                  {isExp && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <a href={order.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs pt-3" style={{ color: brand.color }}>
                        <FiExternalLink size={11} /> {order.link?.length > 40 ? order.link.slice(0, 40) + "…" : order.link}
                      </a>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{new Date(order.createdAt).toLocaleString()}</p>

                      {order.status === "failed" && order.refundProcessed && (
                        <p className="text-xs font-semibold" style={{ color: "#34d399" }}>Refunded</p>
                      )}
                      {order.status === "partial" && order.refundProcessed && (
                        <p className="text-xs font-semibold" style={{ color: "#34d399" }}>Partial refund processed</p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleReplace(order)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                          style={{ background: brand.color }}
                        >
                          <FiRefreshCw size={12} /> Replace
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order)}
                            disabled={actionLoading === order._id + "-cancel"}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full disabled:opacity-50"
                            style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
                          >
                            <FiXCircle size={12} /> {actionLoading === order._id + "-cancel" ? "…" : "Cancel"}
                          </button>
                        )}
                        {order.cancelRequested && (
                          <span className="text-xs font-semibold px-1 py-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {cancelStatusLabel[order.cancelStatus] || "Processing…"}
                          </span>
                        )}
                        {canRefill && (
                          <button
                            onClick={() => handleRefill(order)}
                            disabled={actionLoading === order._id + "-refill"}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full disabled:opacity-50"
                            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
                          >
                            <FiRefreshCw size={12} /> {actionLoading === order._id + "-refill" ? "…" : "Refill"}
                          </button>
                        )}
                        {order.refillRequested && (
                          <span className="text-xs font-semibold px-1 py-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
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
          <div className="flex justify-center items-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
            >
              Prev
            </button>
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewOrder && (
        <DetailsSheet order={viewOrder} brand={brand} formatMoney={formatMoney} onClose={() => setViewOrder(null)} />
      )}
    </AuroraLayout>
  );
              }
