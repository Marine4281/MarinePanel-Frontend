// src/templates/aurora/AuroraOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import { FiRefreshCw, FiSearch, FiChevronDown, FiChevronUp, FiZap } from "react-icons/fi";

const STATUS_COLORS = {
  pending:    { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  processing: { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  active:     { bg: "rgba(52,211,153,0.15)",  color: "#34d399" },
  completed:  { bg: "rgba(52,211,153,0.15)",  color: "#34d399" },
  cancelled:  { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  partial:    { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
};

export default function AuroraOrders() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded]     = useState(null);

  const brand = {
    color: childPanel?.themeColor || "#a78bfa",
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/my-orders", {
        params: { search, status, page, limit: 10 },
      });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, page]);

  const statusStyle = (s) =>
    STATUS_COLORS[s?.toLowerCase()] || { bg: "rgba(255,255,255,0.08)", color: "#94a3b8" };

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-5 pt-2">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand.color }}>
              My Orders
            </p>
            <h2 className="text-2xl font-black text-white">Order History</h2>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="text-xs px-3 py-2 rounded-xl font-semibold"
            style={{ background: `${brand.color}20`, color: brand.color }}
          >
            + New Order
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch size={13} className="absolute left-3 top-3" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search orders…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-xs appearance-none outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
          >
            <option value="">All</option>
            {["pending","processing","active","completed","cancelled","partial"].map((s) => (
              <option key={s} value={s} style={{ background: "#1a1730" }}>{s}</option>
            ))}
          </select>
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
              const st = statusStyle(order.status);
              const isExp = expanded === order._id;
              return (
                <div
                  key={order._id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <button
                    onClick={() => setExpanded(isExp ? null : order._id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs font-bold text-white">
                          #{order.orderId || order._id?.slice(-6)}
                        </p>
                        <p className="text-xs truncate max-w-[160px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {order.service?.name || "Service"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {order.status}
                      </span>
                      {isExp ? <FiChevronUp size={14} style={{ color: "rgba(255,255,255,0.3)" }} /> : <FiChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
                    </div>
                  </button>

                  {isExp && (
                    <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      {[
                        ["Link", order.link],
                        ["Quantity", order.quantity],
                        ["Charge", `$${Number(order.charge).toFixed(4)}`],
                        ["Start Count", order.startCount ?? "—"],
                        ["Remains", order.remains ?? "—"],
                        ["Date", new Date(order.createdAt).toLocaleString()],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                          <span className="text-white font-medium truncate max-w-[180px]">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: page === p ? brand.color : "rgba(255,255,255,0.08)",
                  color: page === p ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </AuroraLayout>
  );
}
