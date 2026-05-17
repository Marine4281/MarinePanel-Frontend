// src/components/childpanel/orders/CPOrdersPartialModal.jsx
import { useState } from "react";

export default function CPOrdersPartialModal({ order, onConfirm, onClose }) {
  const [qty, setQty] = useState(order.quantityDelivered || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    const n = Number(qty);
    if (isNaN(n) || n < 0 || n > order.quantity) {
      setError(`Must be between 0 and ${order.quantity}`);
      return;
    }
    setLoading(true);
    await onConfirm(n);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-1 text-sm">
          Mark as Partial — #{order.customOrderId}
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Max quantity: {order.quantity}
        </p>

        <label className="text-xs text-gray-500 mb-1 block">
          Quantity Delivered
        </label>
        <input
          type="number"
          min={0}
          max={order.quantity}
          value={qty}
          onChange={(e) => {
            setError("");
            setQty(e.target.value);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-1"
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {/* Progress preview */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full mb-4 mt-2">
          <div
            className="h-1.5 bg-orange-400 rounded-full transition-all"
            style={{ width: `${Math.min((Number(qty) / order.quantity) * 100, 100)}%` }}
          />
        </div>

        <div className="flex gap-2">
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
            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Partial"}
          </button>
        </div>
      </div>
    </div>
  );
}
