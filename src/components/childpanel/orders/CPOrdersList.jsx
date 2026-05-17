// src/components/childpanel/orders/CPOrdersList.jsx
import { useState } from "react";

const STATUS_STYLES = {
  completed:  "bg-green-100 text-green-600",
  processing: "bg-blue-100 text-blue-600",
  pending:    "bg-yellow-100 text-yellow-600",
  failed:     "bg-red-100 text-red-600",
  refunded:   "bg-gray-200 text-gray-600",
  partial:    "bg-orange-100 text-orange-600",
};

const STATUS_BTNS = [
  { s: "pending",    cls: "bg-gray-200 hover:bg-gray-300 text-gray-700" },
  { s: "processing", cls: "bg-blue-100 hover:bg-blue-200 text-blue-700" },
  { s: "partial",    cls: "bg-orange-100 hover:bg-orange-200 text-orange-700" },
  { s: "completed",  cls: "bg-green-100 hover:bg-green-200 text-green-700" },
  { s: "failed",     cls: "bg-red-100 hover:bg-red-200 text-red-700" },
];

const fmt4 = (v) => Number(v || 0).toFixed(4);
const fmt2 = (v) => Number(v || 0).toFixed(2);

export default function CPOrdersList({
  orders,
  loading,
  processingId,
  progressInput,
  setProgressInput,
  updateStatus,
  updateProgress,
  refundOrder,
}) {
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!orders.length)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
        No orders found
      </div>
    );

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const created = order.createdAt ? new Date(order.createdAt) : null;
        const progress = Math.min(
          ((order.quantityDelivered || 0) / (order.quantity || 1)) * 100,
          100
        );
        const locked = order.status === "refunded" || order.status === "completed";
        const isProcessing = processingId === order._id;

        const ratePerK =
          order.rate != null
            ? Number(order.rate).toFixed(4)
            : order.charge != null && order.quantity
            ? ((Number(order.charge) / Number(order.quantity)) * 1000).toFixed(4)
            : null;

        return (
          <div
            key={order._id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            {/* ── Header ── */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-bold text-sm text-gray-800">
                  #{order.customOrderId || "—"}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  {order.orderId}
                </span>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                  STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* ── Info Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-gray-700 mb-4">
              <p><strong>Email:</strong> {order.user?.email || "—"}</p>
              <p>
                <strong>User Balance:</strong>{" "}
                ${fmt2(order.user?.balance)}
              </p>
              <p><strong>Service:</strong> {order.service || "—"}</p>
              <p><strong>Service ID:</strong> {order.serviceId || "—"}</p>
              <p><strong>Category:</strong> {order.category || "—"}</p>
              <p><strong>Rate/K:</strong> {ratePerK ? `$${ratePerK}` : "—"}</p>
              <p><strong>Provider:</strong> {order.provider || "N/A"}</p>
              <p><strong>Charge:</strong> ${fmt4(order.charge)}</p>
              <p>
                <strong>Commission:</strong>{" "}
                <span className="text-green-600">${fmt4(order.childPanelCommission)}</span>
              </p>
              <p>
                <strong>Qty:</strong> {order.quantity}
              </p>
              <p className="sm:col-span-2">
                <strong>Link:</strong>{" "}
                <a
                  href={order.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {order.link}
                </a>
              </p>
            </div>

            {/* ── Progress Bar ── */}
            <div className="mb-4">
              <p className="text-sm mb-1 text-gray-600">
                <strong>Progress:</strong>{" "}
                {order.quantityDelivered || 0} / {order.quantity}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    order.status === "partial" ? "bg-orange-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* ── Progress Input ── */}
            {!locked && (
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min={0}
                  max={order.quantity}
                  placeholder="Delivered qty"
                  value={progressInput[order._id] ?? ""}
                  onChange={(e) =>
                    setProgressInput({ ...progressInput, [order._id]: e.target.value })
                  }
                  className="px-3 py-1.5 border border-gray-200 rounded-lg w-36 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  disabled={isProcessing}
                  onClick={() => updateProgress(order)}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Update Progress
                </button>
              </div>
            )}

            {/* ── Status Buttons ── */}
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_BTNS.map(({ s, cls }) => (
                <button
                  key={s}
                  disabled={locked || isProcessing}
                  onClick={() => updateStatus(order._id, s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition disabled:opacity-40 ${cls}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* ── Refund Buttons ── */}
            {!locked && (
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => refundOrder(order, "full")}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                >
                  Full Refund
                </button>

                {(order.quantityDelivered || 0) > 0 &&
                  order.quantityDelivered < order.quantity && (
                    <button
                      disabled={isProcessing}
                      onClick={() => refundOrder(order, "partial")}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
                    >
                      Partial Refund
                    </button>
                  )}

                <button
                  disabled={isProcessing}
                  onClick={() => refundOrder(order, "custom")}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  Custom Refund
                </button>
              </div>
            )}

            {/* ── Footer ── */}
            <p className="mt-4 text-xs text-gray-400">
              {created
                ? `${created.toLocaleDateString()} ${created.toLocaleTimeString()}`
                : "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
                  }
