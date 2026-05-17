// src/components/childpanel/orders/CPOrdersEditModal.jsx
import { useState } from "react";

const STATUSES = ["pending", "processing", "completed", "partial", "failed", "refunded"];

export default function CPOrdersEditModal({ order, onConfirm, onClose }) {
  const [form, setForm] = useState({
    status: order.status,
    quantityDelivered: order.quantityDelivered ?? 0,
    link: order.link || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    setLoading(true);
    await onConfirm(form);
    setLoading(false);
  };

  const progress = Math.min((Number(form.quantityDelivered) / order.quantity) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">
          Manual Edit — Order #{order.customOrderId}
        </h3>

        {/* Status */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Delivered */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Quantity Delivered (max {order.quantity})
          </label>
          <input
            type="number"
            min={0}
            max={order.quantity}
            value={form.quantityDelivered}
            onChange={(e) => set("quantityDelivered", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* Progress preview */}
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
            <div
              className="h-1.5 bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% delivered</p>
        </div>

        {/* Link */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Target Link</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
