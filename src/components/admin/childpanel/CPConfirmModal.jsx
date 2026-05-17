// src/components/admin/childpanel/CPConfirmModal.jsx

import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function CPConfirmModal({ message, onConfirm, onClose, danger = false, showReason = false }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason]   = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <FiAlertTriangle
            className={`mt-0.5 shrink-0 ${danger ? "text-red-500" : "text-yellow-500"}`}
            size={18}
          />
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        {showReason && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Suspension message shown to owner{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Payment overdue. Please contact support."
              className="w-full border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              await onConfirm(reason.trim() || null);
              setLoading(false);
            }}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
