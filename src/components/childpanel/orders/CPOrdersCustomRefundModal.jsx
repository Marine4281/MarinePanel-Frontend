// src/components/childpanel/orders/CPOrdersCustomRefundModal.jsx
import { useState } from "react";

export default function CPOrdersCustomRefundModal({ order, onConfirm, onClose }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    const n = Number(amount);
    if (isNaN(n) || n <= 0) return setError("Enter a valid amount");
    if (n > Number(order.charge)) return setError(`Max refund is $${order.charge}`);
    setLoading(true);
    await onConfirm(n);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">
          Custom Refund — #{order.customOrderId}
        </h3>
        <p className="text-xs text-gray-400">
          Total charge: <strong>${Number(order.charge).toFixed(4)}</strong>
        </p>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Refund Amount ($)</label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            max={order.charge}
            value={amount}
            onChange={(e) => { setError(""); setAmount(e.target.value); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="0.00"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Processing..." : "Refund"}
          </button>
        </div>
      </div>
    </div>
  );
            }
