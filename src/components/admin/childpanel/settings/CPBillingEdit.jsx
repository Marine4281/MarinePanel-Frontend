// src/components/admin/childpanel/settings/CPBillingEdit.jsx

import { useState } from "react";
import { FiEdit2, FiRotateCcw } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";
import CPIntervalPicker from "./CPIntervalPicker";
import { billingStatus } from "./CPSettingsHelpers";

/**
 * Props
 *  cp        child panel object
 *  onSaved   fn(patch) — called with the fields that changed
 *  compact   bool — if true, render condensed (used in list row)
 */
export default function CPBillingEdit({ cp, onSaved, compact = false }) {
  const [open,      setOpen]      = useState(false);
  const [mode,      setMode]      = useState(cp?.childPanelBillingMode   || "monthly");
  const [monthly,   setMonthly]   = useState(cp?.childPanelMonthlyFee    ?? 0);
  const [perOrder,  setPerOrder]  = useState(cp?.childPanelPerOrderFee   ?? 0);
  const [interval,  setInterval]  = useState(cp?.childPanelBillingIntervalDays ?? 30);
  const [loading,   setLoading]   = useState(false);
  const [resetting, setResetting] = useState(false);

  const isCustom = cp?.childPanelFeeIsCustom;
  const status   = billingStatus(cp?.childPanelNextBilledAt);

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing`, {
        billingMode:         mode,
        monthlyFee:          Number(monthly),
        perOrderFee:         Number(perOrder),
        billingIntervalDays: Number(interval),
      });
      toast.success("Billing updated");
      onSaved({
        childPanelBillingMode:         mode,
        childPanelMonthlyFee:          Number(monthly),
        childPanelPerOrderFee:         Number(perOrder),
        childPanelBillingIntervalDays: Number(interval),
        childPanelFeeIsCustom:         true,
      });
      setOpen(false);
    } catch { toast.error("Failed to update billing"); }
    finally   { setLoading(false); }
  };

  const reset = async () => {
    setResetting(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing/reset`);
      toast.success("Reset to global default");
      onSaved({ childPanelFeeIsCustom: false });
      setOpen(false);
    } catch { toast.error("Failed to reset billing"); }
    finally   { setResetting(false); }
  };

  return (
    <div>
      {/* Summary row */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <FiEdit2 size={11} />
          {compact ? "Billing" : "Edit Billing"}
        </button>

        {isCustom ? (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
            Custom
          </span>
        ) : (
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
            Global Default
          </span>
        )}

        {status && !compact && (
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${status.colorClass}`}>
            {status.label}
          </span>
        )}
      </div>

      {/* Next bill badge (compact mode shows it below) */}
      {status && compact && (
        <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded font-medium ${status.colorClass}`}>
          {status.label}
        </span>
      )}

      {/* Editor drawer */}
      {open && (
        <div className="mt-3 bg-gray-50 border rounded-xl p-4 space-y-4">

          {/* Mode */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Billing Mode</label>
            <select
              value={mode} onChange={(e) => setMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="per_order">Per Order</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Monthly fee */}
          {(mode === "monthly" || mode === "both") && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Monthly Fee ($)</label>
              <input
                type="number" min="0" value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          )}

          {/* Per-order fee */}
          {(mode === "per_order" || mode === "both") && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Per-Order Fee ($)</label>
              <input
                type="number" min="0" value={perOrder}
                onChange={(e) => setPerOrder(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          )}

          {/* Interval picker */}
          <CPIntervalPicker
            label="Billing Interval"
            helpText="Next billing date is recalculated from today using this interval."
            value={interval}
            onChange={setInterval}
          />

          {/* Save / Cancel */}
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

          {/* Reset to global default — only shown when panel has custom fee */}
          {isCustom && (
            <button
              onClick={reset} disabled={resetting}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-60 transition"
            >
              <FiRotateCcw size={11} />
              {resetting ? "Resetting..." : "Reset to Global Default"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
