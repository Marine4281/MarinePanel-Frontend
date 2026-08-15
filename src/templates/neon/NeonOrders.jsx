// src/templates/neon/NeonOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiSearch, FiPlus, FiChevronDown, FiChevronUp,
  FiEye, FiRefreshCw, FiXCircle, FiExternalLink, FiZap,
} from "react-icons/fi";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

const STATUS_COLOR = {
  pending: "#fbbf24",
  processing: "#60a5fa",
  "in progress": "#60a5fa",
  completed: "#34d399",
  partial: "#a78bfa",
  failed: "#f87171",
  cancelled: "#8888a8",
  refunded: "#8888a8",
};
const sc = (s) => STATUS_COLOR[s?.toLowerCase()] || "#8888a8";

function DetailsModal({ order, neon, formatMoney, onClose }) {
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#181828", border: `1px solid ${neon}22` }}>
        <h2 className="text-lg font-black mb-4" style={{ color: neon }}>Order Details</h2>
        <div className="space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span style={{ color: "#5c5c82" }}>{k}</span>
              <span className="font-medium text-right break-all" style={{ color: "#c4c4e0" }}>{v}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl text-sm font-black"
          style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function NeonOrders() {
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

  const neon = childPanel?.themeColor || "#00ff88";

  const inputStyle = {
    background: "#1b1b2a", border: `1px solid ${neon}22`, color: "#c4c4e0",
    borderRadius: 10, fontSize: 13, outline: "none", padding: "10px 14px", appearance: "none",
  };

  /* settings (cancel/refill toggles) */
  useEffect(() => {
    API.get("/services/service-settings").then((r) => setSettings(r.data || {})).catch(() => {});
  }, []);

  /* fetch orders */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/my-orders", { params: { search, status, fromDate, toDate, page, limit: 10 } });
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

  /* stats */
  useEffect(() => {
    API.get("/orders/my-orders/stats", { params: { status, fromDate, toDate } })
      .then((r) => setStats(r.data))
      .catch(() => setStats(null));
  }, [status, fromDate, toDate]);

  /* realtime updates */
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

  /* actions */
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

  const cancelStatusLabel = { pending: "Cancel requested", processing: "Cancelling…", success: "Cancelled", failed: "Cancel failed" };
  const refillStatusLabel = { pending: "Refill requested", processing: "Refilling…", success: "Refilled", failed: "Refill failed" };

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>History</p>
            <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Orders</h2>
            <p className="text-xs mt-0.5" style={{ color: "#5c5c82" }}>{totalOrders} order{totalOrders !== 1 ? "s" : ""} total</p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
            style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}
          >
            <FiPlus size={14} /> New Order
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Total", stats.total], ["Pending", stats.pending], ["Processing", stats.processing],
              ["In Progress", stats.inProgress], ["Completed", stats.completed],
              ["Partial", stats.partial], ["Failed", stats.failed],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#5c5c82" }}>{label}</p>
                <p className="text-lg font-black" style={{ color: neon, textShadow: `0 0 8px ${neon}55` }}>{val ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl p-4 flex flex-wrap gap-2" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
          <div className="relative flex-1 min-w-40">
            <FiSearch size={12} className="absolute left-3.5 top-3" style={{ color: `${neon}44` }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ID / service / link…"
              style={{ ...inputStyle, paddingLeft: 32, width: "100%" }}
              onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="" style={{ background: "#1b1b2a" }}>All Statuses</option>
            {["pending", "processing", "in progress", "completed", "partial", "failed", "cancelled"].map((s) => (
              <option key={s} value={s} style={{ background: "#1b1b2a" }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} style={inputStyle} />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} style={inputStyle} />
        </div>

        {/* List */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14">
              <FiZap size={30} className="mx-auto mb-3" style={{ color: `${neon}22` }} />
              <p style={{ color: "#5c5c82", fontSize: 13 }}>No orders found</p>
            </div>
          ) : (
            <div>
              {orders.map((order) => {
                const color = sc(order.displayStatus || order.status);
                const isExp = expanded === order._id;
                const progress = Math.min(((order.quantityDelivered || 0) / (order.quantity || 1)) * 100, 100);
                const statusLabel = order.displayStatus || order.status;

                const canCancel = settings.globalCancelEnabled && order.cancelAllowed &&
                  !order.cancelRequested && !["completed", "cancelled"].includes(order.status);
                const canRefill = settings.globalRefillEnabled && order.refillAllowed &&
                  !order.refillRequested && ["completed", "partial"].includes(order.status);

                return (
                  <div key={order._id} className="border-b last:border-0" style={{ borderColor: `${neon}0a` }}>
                    <button
                      onClick={() => setExpanded(isExp ? null : order._id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-black" style={{ color: "#c4c4e0" }}>
                          #{order.customOrderId || order._id?.slice(-6)}
                        </p>
                        <p className="text-xs truncate max-w-[200px]" style={{ color: "#5c5c82" }}>{order.service}</p>
                        <div className="w-28 bg-black/30 h-1 mt-1 rounded-full overflow-hidden">
                          <div className="h-1 rounded-full" style={{ width: `${progress}%`, background: neon }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-black" style={{ color: neon }}>{formatMoney(order.charge, 4)}</span>
                        <span className="text-xs font-black capitalize" style={{ color, textShadow: `0 0 8px ${color}66` }}>
                          {statusLabel}
                        </span>
                        {isExp ? <FiChevronUp size={13} style={{ color: `${neon}44` }} /> : <FiChevronDown size={13} style={{ color: `${neon}44` }} />}
                      </div>
                    </button>

                    {isExp && (
                      <div className="px-4 pb-4 space-y-3" style={{ background: "#161624", borderTop: `1px solid ${neon}10` }}>
                        <a href={order.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs pt-3" style={{ color: neon }}>
                          <FiExternalLink size={12} /> {order.link?.length > 50 ? order.link.slice(0, 50) + "…" : order.link}
                        </a>
                        <p className="text-xs" style={{ color: "#5c5c82" }}>{new Date(order.createdAt).toLocaleString()}</p>

                        {order.status === "failed" && order.refundProcessed && (
                          <p className="text-xs font-semibold" style={{ color: "#4ade80" }}>Refunded</p>
                        )}
                        {order.status === "partial" && order.refundProcessed && (
                          <p className="text-xs font-semibold" style={{ color: "#4ade80" }}>Partial refund processed</p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => setViewOrder(order)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ border: `1px solid ${neon}44`, color: neon }}
                          >
                            <FiEye size={12} /> View
                          </button>

                          <button
                            onClick={() => handleReplace(order)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14" }}
                          >
                            <FiRefreshCw size={12} /> Replace
                          </button>

                          {canCancel && (
                            <button
                              onClick={() => handleCancel(order)}
                              disabled={actionLoading === order._id + "-cancel"}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                              style={{ color: "#f87171", background: "#2a1414", border: "1px solid #dc262633" }}
                            >
                              <FiXCircle size={12} /> {actionLoading === order._id + "-cancel" ? "…" : "Cancel"}
                            </button>
                          )}
                          {order.cancelRequested && (
                            <span className="text-xs font-semibold px-1 py-1.5" style={{ color: "#8888a8" }}>
                              {cancelStatusLabel[order.cancelStatus] || "Processing…"}
                            </span>
                          )}

                          {canRefill && (
                            <button
                              onClick={() => handleRefill(order)}
                              disabled={actionLoading === order._id + "-refill"}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                              style={{ color: "#4ade80", background: "#0f2a1c", border: "1px solid #16a34a33" }}
                            >
                              <FiRefreshCw size={12} /> {actionLoading === order._id + "-refill" ? "…" : "Refill"}
                            </button>
                          )}
                          {order.refillRequested && (
                            <span className="text-xs font-semibold px-1 py-1.5" style={{ color: "#8888a8" }}>
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
              className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
              style={{ background: "#1b1b2a", color: "#8888a8", border: `1px solid ${neon}14` }}
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
                  <span key={`e${idx}`} className="px-1 text-xs" style={{ color: "#5c5c82" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: page === p ? `linear-gradient(135deg, ${neon}dd, ${neon}99)` : "#1b1b2a",
                      color: page === p ? "#0a0a14" : "#8888a8",
                      border: `1px solid ${page === p ? neon : neon + "14"}`,
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
              style={{ background: "#1b1b2a", color: "#8888a8", border: `1px solid ${neon}14` }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewOrder && (
        <DetailsModal order={viewOrder} neon={neon} formatMoney={formatMoney} onClose={() => setViewOrder(null)} />
      )}
    </NeonLayout>
  );
}
