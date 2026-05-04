// src/templates/neon/NeonOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import { FiSearch, FiZap, FiChevronDown, FiChevronUp } from "react-icons/fi";

const STATUS = {
  pending:    "#fbbf24", processing: "#60a5fa", active: "#34d399",
  completed:  "#34d399", cancelled: "#f87171", partial: "#a78bfa",
};

export default function NeonOrders() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded]     = useState(null);

  const brand = { color: childPanel?.themeColor || "#00ff88" };
  const neon = brand.color;

  const inputStyle = { background: "#0d0d1a", border: `1px solid ${neon}22`, color: "#c4c4e0", borderRadius: 10, fontSize: 13, outline: "none", padding: "10px 14px", appearance: "none" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/orders/my-orders", { params: { search, status, page, limit: 10 } });
        setOrders(res.data.orders || []);
        setTotalPages(res.data.totalPages || 1);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [search, status, page]);

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>History</p>
            <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Orders</h2>
          </div>
          <button onClick={() => navigate("/home")}
            className="text-xs px-3 py-2 rounded-xl font-black uppercase tracking-wider"
            style={{ background: `${neon}14`, color: neon, border: `1px solid ${neon}30` }}>
            + New
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch size={12} className="absolute left-3.5 top-2.5" style={{ color: `${neon}44` }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…" style={{ ...inputStyle, paddingLeft: 32, width: "100%" }}
              onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ ...inputStyle, minWidth: 100 }}
            onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}>
            <option value="" style={{ background: "#0d0d1a" }}>All</option>
            {["pending","processing","active","completed","cancelled","partial"].map((s) => (
              <option key={s} value={s} style={{ background: "#0d0d1a" }}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-14">
            <FiZap size={30} className="mx-auto mb-3" style={{ color: `${neon}22` }} />
            <p style={{ color: "#3a3a5a", fontSize: 13 }}>No orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const sc = STATUS[order.status?.toLowerCase()] || "#8888a8";
              const isExp = expanded === order._id;
              return (
                <div key={order._id} className="rounded-2xl overflow-hidden" style={{ background: "#0d0d1a", border: `1px solid ${neon}14` }}>
                  <button onClick={() => setExpanded(isExp ? null : order._id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                    <div>
                      <p className="text-xs font-black" style={{ color: "#c4c4e0" }}>#{order.orderId || order._id?.slice(-6)}</p>
                      <p className="text-xs truncate max-w-[200px]" style={{ color: "#3a3a5a" }}>{order.service?.name || "Service"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black capitalize" style={{ color: sc, textShadow: `0 0 8px ${sc}66` }}>
                        {order.status}
                      </span>
                      {isExp ? <FiChevronUp size={13} style={{ color: `${neon}44` }} /> : <FiChevronDown size={13} style={{ color: `${neon}44` }} />}
                    </div>
                  </button>
                  {isExp && (
                    <div className="px-4 pb-4 border-t pt-3 space-y-2" style={{ borderColor: `${neon}10` }}>
                      {[["Link", order.link], ["Quantity", order.quantity], ["Charge", `$${Number(order.charge).toFixed(4)}`],
                        ["Start Count", order.startCount ?? "—"], ["Remains", order.remains ?? "—"],
                        ["Date", new Date(order.createdAt).toLocaleString()]].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span style={{ color: "#3a3a5a" }}>{label}</span>
                          <span className="font-semibold truncate max-w-[180px]" style={{ color: "#8888a8" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-black transition-all"
                style={{
                  background: page === p ? `${neon}18` : "#0d0d1a",
                  color: page === p ? neon : "#3a3a5a",
                  border: `1px solid ${page === p ? neon + "44" : neon + "12"}`,
                  boxShadow: page === p ? `0 0 8px ${neon}33` : "none",
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </NeonLayout>
  );
}
