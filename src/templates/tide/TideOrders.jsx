// src/templates/tide/TideOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import { FiSearch, FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";

const STATUS = {
  pending:    { bg: "#fef9c3", color: "#ca8a04", border: "#fde68a" },
  processing: { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  active:     { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  completed:  { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  cancelled:  { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
  partial:    { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
};

export default function TideOrders() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded]     = useState(null);

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

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

  const st = (s) => STATUS[s?.toLowerCase()] || { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };

  return (
    <TideLayout>
      <div className="space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Order History</h2>
            <p className="text-xs text-gray-400">All your orders in one place</p>
          </div>
          <button onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: brand.color, boxShadow: `0 3px 10px ${brand.color}44` }}>
            <FiPlus size={14} /> New Order
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-4 top-3.5 text-gray-300" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search orders…"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800"
              onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 appearance-none min-w-32"
            onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}>
            <option value="">All Statuses</option>
            {["pending","processing","active","completed","cancelled","partial"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No orders found</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-2">Order ID</div>
                <div className="col-span-4">Service</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Charge</div>
                <div className="col-span-2">Status</div>
              </div>

              {orders.map((order) => {
                const s = st(order.status);
                const isExp = expanded === order._id;
                return (
                  <div key={order._id} className="border-b border-gray-50 last:border-0">
                    <button onClick={() => setExpanded(isExp ? null : order._id)}
                      className="w-full grid grid-cols-12 px-5 py-4 text-left hover:bg-gray-50 transition-colors items-center">
                      <div className="col-span-2 text-xs font-bold text-gray-900">
                        #{order.orderId || order._id?.slice(-6)}
                      </div>
                      <div className="col-span-4 text-xs text-gray-600 truncate pr-2">
                        {order.service?.name || "Service"}
                      </div>
                      <div className="col-span-2 text-xs text-gray-600">{order.quantity}</div>
                      <div className="col-span-2 text-xs font-semibold" style={{ color: brand.color }}>
                        ${Number(order.charge).toFixed(4)}
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg capitalize"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {order.status}
                        </span>
                        {isExp ? <FiChevronUp size={12} className="text-gray-300 ml-1" /> : <FiChevronDown size={12} className="text-gray-300 ml-1" />}
                      </div>
                    </button>
                    {isExp && (
                      <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                          {[["Link", order.link], ["Start Count", order.startCount ?? "—"], ["Remains", order.remains ?? "—"],
                            ["Date", new Date(order.createdAt).toLocaleString()]].map(([label, val]) => (
                            <div key={label}>
                              <p className="text-xs text-gray-400">{label}</p>
                              <p className="text-xs font-semibold text-gray-700 truncate">{val}</p>
                            </div>
                          ))}
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
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: page === p ? brand.color : "#fff",
                  color: page === p ? "#fff" : "#6b7280",
                  border: `1px solid ${page === p ? brand.color : "#e5e7eb"}`,
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </TideLayout>
  );
}
