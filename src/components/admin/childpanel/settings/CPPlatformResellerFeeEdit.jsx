// src/components/admin/childpanel/settings/CPPlatformResellerFeeEdit.jsx
import { useState } from "react";
import { FiEdit2, FiRotateCcw } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";

/**
 * Props
 *  cp        child panel object
 *  onSaved   fn(patch)
 */
export default function CPPlatformResellerFeeEdit({ cp, onSaved }) {
  const [open, setOpen] = useState(false);
  const [fee, setFee] = useState(cp?.platformResellerFeeOverride ?? "");
  const [loading, setLoading] = useState(false);

  const isCustom = cp?.platformResellerFeeOverride != null;

  const save = async () => {
    setLoading(true);
    try {
      const value = fee === "" ? null : Number(fee);
      await API.patch(`/admin/child-panels/${cp._id}/platform-reseller-fee`, { fee: value });
      toast.success("Platform fee updated");
      onSaved({ platformResellerFeeOverride: value });
      setOpen(false);
    } catch {
      toast.error("Failed to update fee");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setLoading(true);
    try {
      await API.patch(`/admin/child-panels/${cp._id}/platform-reseller-fee`, { fee: null });
      toast.success("Reset to global default");
      setFee("");
      onSaved({ platformResellerFeeOverride: null });
      setOpen(false);
    } catch {
      toast.error("Failed to reset fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <FiEdit2 size={11} />
          Platform Reseller Fee
        </button>

        {isCustom ? (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
            Custom (${cp.platformResellerFeeOverride})
          </span>
        ) : (
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
            Global Default
          </span>
        )}
      </div>

      {open && (
        <div className="mt-3 bg-gray-50 border rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Override Fee ($) — blank uses global default
            </label>
            <input
              type="number" min="0" step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Use global default"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save} disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          {isCustom && (
            <button
              onClick={reset} disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-60 transition"
            >
              <FiRotateCcw size={11} />
              Reset to Global Default
            </button>
          )}
        </div>
      )}
    </div>
  );
}
