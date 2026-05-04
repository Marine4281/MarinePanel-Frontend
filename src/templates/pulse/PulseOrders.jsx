// src/templates/pulse/PulseOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import { FiSearch, FiZap, FiChevronDown, FiChevronUp } from "react-icons/fi";

const STATUS = {
  pending:    { bg: "#fef9c3", color: "#ca8a04" },
  processing: { bg: "#dbeafe", color: "#2563eb" },
  active:     { bg: "#dcfce7", color: "#16a34a" },
  completed:  { bg: "#dcfce7", color: "#16a34a" },
  cancelled:  { bg: "#fee2e2", color: "#dc2626" },
  partial:    { bg: "#ede9fe", color: "#7c3aed" },
};

export default function PulseOrders() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded]     = useState(null);

  const brand = { color: childPanel?.themeColor || "#6366f1" };

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

  const st = (s) => STATUS[s?.toLowerCase()] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xl font-black text-gray-900">Orders</h2>
          <button
            onClick={() => navigate("/home")}
            className="text-xs px-3 py-2 rounded-2xl font-bold"
            style={{ background: `${brand.color}12`, color: brand.color }}
          >
            + New
          </button>
        </div>

        {/* Filters */}
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
            {["pending","processing","active","completed","cancelled","partial"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
              const s = st(order.status);
              const isExp = expanded === order._id;
              return (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExp ? null : order._id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div>
                      <p className="text-xs font-black text-gray-900">
                        #{order.orderId || order._id?.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">
                        {order.service?.name || "Service"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {order.status}
                      </span>
                      {isExp
                        ? <FiChevronUp size={14} className="text-gray-300" />
                        : <FiChevronDown size={14} className="text-gray-300" />}
                    </div>
                  </button>

                  {isExp && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                      {[
                        ["Link", order.link],
                        ["Quantity", order.quantity],
                        ["Charge", `$${Number(order.charge).toFixed(4)}`],
                        ["Start Count", order.startCount ?? "—"],
                        ["Remains", order.remains ?? "—"],
                        ["Date", new Date(order.createdAt).toLocaleString()],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-gray-800 font-semibold truncate max-w-[160px]">{val}</span>
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
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-xl text-xs font-bold"
                style={{
                  background: page === p ? brand.color : "#f3f4f6",
                  color: page === p ? "#fff" : "#6b7280",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </PulseLayout>
  );
}
