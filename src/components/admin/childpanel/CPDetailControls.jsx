// src/components/admin/childpanel/CPDetailControls.jsx

import { useState } from "react";
import { FiEdit2, FiCheck, FiX, FiRotateCcw } from "react-icons/fi";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { fmt } from "./CPDetailHelpers";

// ── Interval presets ──────────────────────────────────────────────────
const INTERVAL_PRESETS = [1, 7, 14, 30, 45, 60, 90];

// ── Inline number field ───────────────────────────────────────────────
function InlineEdit({ label, value, onSave, prefix = "", suffix = "" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onSave(Number(val));
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 shrink-0">{label}:</span>
      {editing ? (
        <>
          <input
            type="number" min="0" value={val}
            onChange={(e) => setVal(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={handle} disabled={loading}
            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            <FiCheck size={12} />
          </button>
          <button onClick={() => { setEditing(false); setVal(value); }}
            className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300">
            <FiX size={12} />
          </button>
        </>
      ) : (
        <>
          <span className="text-sm font-bold text-gray-800">
            {prefix}{fmt(value)}{suffix}
          </span>
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500">
            <FiEdit2 size={12} />
          </button>
        </>
      )}
    </div>
  );
}

// ── Billing editor ────────────────────────────────────────────────────
function BillingEdit({ cp, onSaved }) {
  const [open, setOpen]           = useState(false);
  const [mode, setMode]           = useState(cp?.childPanelBillingMode || "monthly");
  const [monthly, setMonthly]     = useState(cp?.childPanelMonthlyFee ?? 0);
  const [perOrder, setPerOrder]   = useState(cp?.childPanelPerOrderFee ?? 0);
  const [intervalDays, setIntervalDays] = useState(cp?.childPanelBillingIntervalDays ?? 30);
  const [customDays, setCustomDays]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [resetting, setResetting]       = useState(false);

  const isCustomFee = cp?.childPanelFeeIsCustom;

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing`, {
        billingMode:        mode,
        monthlyFee:         Number(monthly),
        perOrderFee:        Number(perOrder),
        billingIntervalDays: Number(intervalDays),
      });
      toast.success("Billing updated");
      onSaved({
        childPanelBillingMode:        mode,
        childPanelMonthlyFee:         Number(monthly),
        childPanelPerOrderFee:        Number(perOrder),
        childPanelBillingIntervalDays: Number(intervalDays),
        childPanelFeeIsCustom:        true,
      });
      setOpen(false);
    } catch {
      toast.error("Failed to update billing");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setResetting(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing/reset`);
      toast.success("Reset to global default");
      // Refetch so we get the new values from server
      onSaved({ childPanelFeeIsCustom: false });
      setOpen(false);
    } catch {
      toast.error("Failed to reset billing");
    } finally {
      setResetting(false);
    }
  };

  const handleIntervalSelect = (days) => {
    setIntervalDays(days);
    setCustomDays(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <FiEdit2 size={11} /> Edit Billing
        </button>

        {isCustomFee && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
            Custom
          </span>
        )}
        {!isCustomFee && (
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
            Global Default
          </span>
        )}
      </div>

      {open && (
        <div className="mt-3 bg-gray-50 border rounded-xl p-4 space-y-4">

          {/* Billing Mode */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Billing Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="monthly">Monthly</option>
              <option value="per_order">Per Order</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>

          {(mode === "monthly" || mode === "both") && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Monthly Fee ($)</label>
              <input type="number" min="0" value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}

          {(mode === "per_order" || mode === "both") && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Per-Order Fee ($)</label>
              <input type="number" min="0" value={perOrder}
                onChange={(e) => setPerOrder(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}

          {/* Billing Interval */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">
              Billing Interval
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {INTERVAL_PRESETS.map((d) => (
                <button key={d}
                  onClick={() => handleIntervalSelect(d)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                    !customDays && Number(intervalDays) === d
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 hover:border-blue-400"
                  }`}>
                  {d === 1 ? "1 day" : `${d} days`}
                </button>
              ))}
              <button
                onClick={() => { setCustomDays(true); setIntervalDays(""); }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                  customDays
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 hover:border-blue-400"
                }`}>
                Custom
              </button>
            </div>
            {customDays && (
              <input
                type="number" min="1" placeholder="Enter days e.g. 20"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">
              Next billing date will be recalculated from today using this interval.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={save} disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Reset to global default */}
          {isCustomFee && (
            <button onClick={reset} disabled={resetting}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-60 transition">
              <FiRotateCcw size={11} />
              {resetting ? "Resetting..." : "Reset to Global Default"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Next billing countdown ────────────────────────────────────────────
function NextBillingBadge({ nextBilledAt }) {
  if (!nextBilledAt) return null;

  const now  = new Date();
  const due  = new Date(nextBilledAt);
  const diff = due - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const label = due.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const color = days < 0
    ? "text-red-600 bg-red-50"
    : days <= 3
    ? "text-amber-600 bg-amber-50"
    : "text-green-700 bg-green-50";

  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${color}`}>
      {days < 0
        ? `Expired ${Math.abs(days)}d ago`
        : days === 0
        ? "Due today"
        : `Due ${label} (${days}d)`}
    </span>
  );
}

// ── Main controls card ────────────────────────────────────────────────
export default function CPDetailControls({ cp, onCommissionSaved, onBillingSaved, onDeactivate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">Controls</h3>

      {/* Commission */}
      <InlineEdit
        label="Commission Rate"
        value={cp.childPanelCommissionRate || 0}
        suffix="%"
        onSave={onCommissionSaved}
      />

      {/* Billing */}
      <div className="border-t pt-3 space-y-1">
        <p className="text-xs text-gray-500">
          Billing:{" "}
          <span className="font-semibold text-gray-800 capitalize">
            {cp.childPanelBillingMode || "—"}
          </span>
          {cp.childPanelMonthlyFee  > 0 && <> · ${cp.childPanelMonthlyFee}/cycle</>}
          {cp.childPanelPerOrderFee > 0 && <> · ${cp.childPanelPerOrderFee}/order</>}
          {cp.childPanelBillingIntervalDays && (
            <> · every {cp.childPanelBillingIntervalDays}d</>
          )}
        </p>
        <NextBillingBadge nextBilledAt={cp.childPanelNextBilledAt} />
        <BillingEdit cp={cp} onSaved={onBillingSaved} />
      </div>

      {/* Danger zone */}
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">
          Danger Zone
        </p>
        <button
          onClick={onDeactivate}
          className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition"
        >
          Deactivate Panel
        </button>
      </div>
    </div>
  );
            }
