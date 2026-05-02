// src/pages/childpanel/ChildPanelOrders.jsx

import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiSearch,
  FiCheckCircle,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (val) => Number(val || 0).toFixed(4);

const shortenLink = (l) =>
  l?.length > 35 ? l.slice(0, 35) + "..." : l || "—";

const getShortText = (text) => {
  if (!text) return "—";
  let cleaned = text.split("[")[0].split("~")[0].split("|")[0].split("-")[0];
  cleaned = cleaned.replace(/[^\x00-\x7F]/g, "");
  return cleaned.trim() || text;
};

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
  partial: "bg-orange-100 text-orange-700",
};

const getStatusStyle = (s) =>
  STATUS_STYLES[s?.toLowerCase()] || "bg-gray-100 text-gray-600";

const STATUSES = ["", "pending", "processing", "completed", "partial", "failed", "refunded"];

// ======================= CONFIRM MODAL =======================

function ConfirmModal({ message, onConfirm, onClose, danger }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <p className="text-sm text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Expanded rows
  const [expandedService, setExpandedService] = useState({});

  // Confirm modal
  const [confirm, setConfirm] = useState(null);

  // ======================= FETCH =======================

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search }),
      });
      const res = await API.get(`/cp/orders?${params}`);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  // ======================= ACTIONS =======================

  const updateOrder = (id, patch) =>
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, ...patch } : o))
    );

  const handleComplete = (order) => {
    setConfirm({
      message: `Mark order #${order.customOrderId} as completed?`,
      danger: false,
      onConfirm: async () => {
        try {
          await API.post(`/cp/orders/${order._id}/complete`);
          updateOrder(order._id, { status: "completed" });
          toast.success("Order marked as completed");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to complete order");
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  const handleRefund = (order) => {
    setConfirm({
      message: `Refund order #${order.customOrderId}? The charge will be returned to the user.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.post(`/cp/orders/${order._id}/refund`);
          updateOrder(order._id, { status: "refunded" });
          toast.success("Order refunded");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to refund order");
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  // ======================= RENDER =======================

  return (
    <ChildPanelLayout>
      <div className="space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">
            Manage orders placed on your panel
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search ID, service, link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}
              </option>
            ))}
          </select>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700"
          >
            Search
          </button>

          {/* Clear */}
          {(search || status) && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <FiX size={14} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-16">
              No orders found
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden md:table min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Link</th>
                    <th className="px-4 py-3 text-left">Progress</th>
                    <th className="px-4 py-3 text-left">Charge</th>
                    <th className="px-4 py-3 text-left">Commission</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const progress = Math.min(
                      ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
                      100
                    );
                    const isExpanded = expandedService[o._id];
                    const canAct =
                      o.status !== "completed" &&
                      o.status !== "refunded" &&
                      o.status !== "failed";

                    return (
                      <tr key={o._id} className="border-t hover:bg-gray-50">
                        {/* ID */}
                        <td className="px-4 py-3 font-bold text-gray-800">
                          #{o.customOrderId || o._id?.slice(-6)}
                        </td>

                        {/* User */}
                        <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">
                          {o.user?.email || o.userId?.email || "—"}
                        </td>

                        {/* Service */}
                        <td className="px-4 py-3 max-w-[160px]">
                          <div className="flex items-center gap-1">
                            <span className="truncate">
                              {isExpanded
                                ? o.service
                                : getShortText(o.service)}
                            </span>
                            {o.service?.length > 20 && (
                              <button
                                onClick={() =>
                                  setExpandedService((prev) => ({
                                    ...prev,
                                    [o._id]: !prev[o._id],
                                  }))
                                }
                                className="text-blue-400 text-xs shrink-0 hover:underline"
                              >
                                {isExpanded ? "←" : "→"}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Link */}
                        <td className="px-4 py-3">
                          <a
                            href={o.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-xs"
                          >
                            {shortenLink(o.link)}
                          </a>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-500 mb-1">
                            {o.quantityDelivered || 0}/{o.quantity}
                          </p>
                          <div className="w-20 bg-gray-200 h-1.5 rounded-full">
                            <div
                              className="h-1.5 bg-blue-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>

                        {/* Charge */}
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          ${fmt(o.charge)}
                        </td>

                        {/* Commission */}
                        <td className="px-4 py-3 text-green-600 font-medium">
                          ${fmt(o.childPanelCommission)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(o.status)}`}
                          >
                            {o.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {canAct ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleComplete(o)}
                                title="Mark complete"
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                              >
                                <FiCheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleRefund(o)}
                                title="Refund"
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                              >
                                <FiRotateCcw size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3 p-4">
                {orders.map((o) => {
                  const progress = Math.min(
                    ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
                    100
                  );
                  const canAct =
                    o.status !== "completed" &&
                    o.status !== "refunded" &&
                    o.status !== "failed";

                  return (
                    <div
                      key={o._id}
                      className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-sm">
                          #{o.customOrderId || o._id?.slice(-6)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(o.status)}`}
                        >
                          {o.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 truncate">
                        {o.service}
                      </p>
                      <p className="text-xs text-gray-400">
                        {o.user?.email || "—"}
                      </p>

                      <a
                        href={o.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs block truncate"
                      >
                        {shortenLink(o.link)}
                      </a>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {o.quantityDelivered || 0}/{o.quantity}
                        </p>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          Charge: ${fmt(o.charge)}
                        </span>
                        <span className="text-green-600 font-medium">
                          Commission: ${fmt(o.childPanelCommission)}
                        </span>
                      </div>

                      {canAct && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleComplete(o)}
                            className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs rounded-lg font-semibold hover:bg-green-100"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleRefund(o)}
                            className="flex-1 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg font-semibold hover:bg-red-100"
                          >
                            Refund
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </ChildPanelLayout>
  );
}
