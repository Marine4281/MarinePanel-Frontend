// src/components/childpanel/orders/CPOrdersTable.jsx
import { useState } from "react";
import {
  FiCheckCircle,
  FiRotateCcw,
  FiEdit2,
  FiSlash,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const fmt = (val) => Number(val || 0).toFixed(4);

const shortenLink = (l) =>
  l?.length > 35 ? l.slice(0, 35) + "..." : l || "—";

const getShortText = (text) => {
  if (!text) return "—";
  let c = text.split("[")[0].split("~")[0].split("|")[0].split("-")[0];
  c = c.replace(/[^\x00-\x7F]/g, "");
  return c.trim() || text;
};

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
  partial: "bg-orange-100 text-orange-700",
};

const badge = (s) =>
  STATUS_STYLES[s?.toLowerCase()] || "bg-gray-100 text-gray-600";

export default function CPOrdersTable({
  orders,
  loading,
  page,
  totalPages,
  setPage,
  onComplete,
  onRefund,
  onPartial,
  onEdit,
}) {
  const [expandedService, setExpandedService] = useState({});

  const toggleService = (id) =>
    setExpandedService((p) => ({ ...p, [id]: !p[id] }));

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <p className="text-center text-gray-400 text-sm py-16">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      {/* ───── Desktop Table ───── */}
      <table className="hidden md:table min-w-[1000px] w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Balance</th>
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
            const isFinal =
              o.status === "completed" ||
              o.status === "refunded" ||
              o.status === "failed";

            return (
              <tr key={o._id} className="border-t hover:bg-gray-50 transition">
                {/* ID */}
                <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">
                  #{o.customOrderId || o._id?.slice(-6)}
                </td>

                {/* User */}
                <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate">
                  {o.user?.email || "—"}
                </td>

                {/* Balance */}
                <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  ${Number(o.user?.balance || 0).toFixed(2)}
                </td>

                {/* Service */}
                <td className="px-4 py-3 max-w-[160px]">
                  <div className="flex items-center gap-1">
                    <span className="truncate">
                      {isExpanded ? o.service : getShortText(o.service)}
                    </span>
                    {o.service?.length > 20 && (
                      <button
                        onClick={() => toggleService(o._id)}
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
                      className={`h-1.5 rounded-full ${
                        o.status === "partial"
                          ? "bg-orange-400"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </td>

                {/* Charge */}
                <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                  ${fmt(o.charge)}
                </td>

                {/* Commission */}
                <td className="px-4 py-3 text-green-600 font-medium whitespace-nowrap">
                  ${fmt(o.childPanelCommission)}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge(o.status)}`}
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
                  <div className="flex items-center gap-1">
                    {/* Always show Edit */}
                    <button
                      onClick={() => onEdit(o)}
                      title="Manual Edit"
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
                    >
                      <FiEdit2 size={13} />
                    </button>

                    {!isFinal && (
                      <>
                        <button
                          onClick={() => onComplete(o)}
                          title="Complete"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          <FiCheckCircle size={13} />
                        </button>

                        <button
                          onClick={() => onPartial(o)}
                          title="Mark Partial"
                          className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100"
                        >
                          <FiSlash size={13} />
                        </button>

                        <button
                          onClick={() => onRefund(o)}
                          title="Refund"
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <FiRotateCcw size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ───── Mobile Cards ───── */}
      <div className="md:hidden space-y-3 p-4">
        {orders.map((o) => {
          const progress = Math.min(
            ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
            100
          );
          const isFinal =
            o.status === "completed" ||
            o.status === "refunded" ||
            o.status === "failed";

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
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge(o.status)}`}
                >
                  {o.status}
                </span>
              </div>

              <p className="text-sm text-gray-700 truncate">{o.service}</p>
              <p className="text-xs text-gray-400">{o.user?.email || "—"}</p>
              <p className="text-xs text-gray-500">
                Balance: ${Number(o.user?.balance || 0).toFixed(2)}
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
                    className={`h-1.5 rounded-full ${
                      o.status === "partial" ? "bg-orange-400" : "bg-blue-500"
                    }`}
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

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onEdit(o)}
                  className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg font-semibold hover:bg-gray-200"
                >
                  Edit
                </button>
                {!isFinal && (
                  <>
                    <button
                      onClick={() => onComplete(o)}
                      className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs rounded-lg font-semibold hover:bg-green-100"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => onPartial(o)}
                      className="flex-1 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-lg font-semibold hover:bg-orange-100"
                    >
                      Partial
                    </button>
                    <button
                      onClick={() => onRefund(o)}
                      className="flex-1 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg font-semibold hover:bg-red-100"
                    >
                      Refund
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ───── Pagination ───── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 border-t">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <FiChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
                  }
