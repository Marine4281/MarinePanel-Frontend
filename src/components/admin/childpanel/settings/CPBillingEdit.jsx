// src/components/admin/childpanel/settings/CPBillingEdit.jsx

import { useState } from "react";
import { FiEdit2, FiRotateCcw } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";
import CPIntervalPicker from "./CPIntervalPicker";
import { billingStatus } from "./CPSettingsHelpers";

const GRACE_OPTIONS = [
  { value: "",  label: "Use global default" },
  { value: 0,   label: "No grace — suspend immediately" },
  { value: 12,  label: "12 hours" },
  { value: 24,  label: "1 day" },
  { value: 48,  label: "2 days" },
  { value: 72,  label: "3 days" },
  { value: 168, label: "7 days" },
];

const REMINDER_OPTIONS = [
  { value: "",  label: "Use global default" },
  { value: 0,   label: "No reminder" },
  { value: 24,  label: "1 day before due" },
  { value: 48,  label: "2 days before due" },
  { value: 72,  label: "3 days before due" },
  { value: 168, label: "7 days before due" },
];

/**
 * Props
 *  cp        child panel object
 *  onSaved   fn(patch) — called with the fields that changed
 *  compact   bool — if true, render condensed (used in list row)
 */
export default function CPBillingEdit({ cp, onSaved, compact = false }) {
  const [open,      setOpen]      = useState(false);
  const [mode,      setMode]      = useState(cp?.childPanelBillingMode        || "monthly");
  const [monthly,   setMonthly]   = useState(cp?.childPanelMonthlyFee         ?? 0);
  const [perOrder,  setPerOrder]  = useState(cp?.childPanelPerOrderFee        ?? 0);
  const [interval,  setInterval]  = useState(cp?.childPanelBillingIntervalDays ?? 30);

  // null = inherit global; stored as "" in the select so the
  // "Use global default" option works, converted back on save
  const [gracePeriodHours, setGracePeriodHours] = useState(
    cp?.childPanelGracePeriodHours ?? ""
  );
  const [reminderHours, setReminderHours] = useState(
    cp?.childPanelReminderHours ?? ""
  );
  // null = inherit global | true | false
  const [autoDeduct, setAutoDeduct] = useState(
    cp?.childPanelAutoDeduct ?? null
  );

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
        // "" means "revert to global" → send null; otherwise send the number
        gracePeriodHours:    gracePeriodHours === "" ? null : Number(gracePeriodHours),
        reminderHours:       reminderHours    === "" ? null : Number(reminderHours),
        autoDeduct:          autoDeduct, // null | true | false
      });
      toast.success("Billing updated");
      onSaved({
        childPanelBillingMode:         mode,
        childPanelMonthlyFee:          Number(monthly),
        childPanelPerOrderFee:         Number(perOrder),
        childPanelBillingIntervalDays: Number(interval),
        childPanelFeeIsCustom:         true,
        childPanelGracePeriodHours:    gracePeriodHours === "" ? null : Number(gracePeriodHours),
        childPanelReminderHours:       reminderHours    === "" ? null : Number(reminderHours),
        childPanelAutoDeduct:          autoDeduct,
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

  // 3-way toggle label helper
  const autoDeductLabel =
    autoDeduct === null  ? "Global default" :
    autoDeduct === true  ? "Enabled for this CP" :
                           "Disabled for this CP";

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

          {/* ── Suspension & Reminder overrides ─────────────────────── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-white px-3 py-2 border-b">
              <p className="text-xs font-semibold text-gray-700">Suspension &amp; Reminder Overrides</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Leave on "Use global default" to inherit the platform-wide setting.
              </p>
            </div>

            <div className="p-3 space-y-3 bg-gray-50">
              {/* Grace period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Grace period after due date</label>
                  <select
                    value={gracePeriodHours}
                    onChange={(e) =>
                      setGracePeriodHours(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    {GRACE_OPTIONS.map((o) => (
                      <option key={String(o.value)} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Reminder window */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Reminder window before due</label>
                  <select
                    value={reminderHours}
                    onChange={(e) =>
                      setReminderHours(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    {REMINDER_OPTIONS.map((o) => (
                      <option key={String(o.value)} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Auto-deduct 3-way toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-gray-800">Auto-deduct fee from wallet</p>
                  <p className="text-xs text-gray-400 mt-0.5">{autoDeductLabel}</p>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={() => setAutoDeduct(null)}
                    className={`px-2 py-1 text-xs rounded transition ${
                      autoDeduct === null
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Global
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoDeduct(true)}
                    className={`px-2 py-1 text-xs rounded transition ${
                      autoDeduct === true
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoDeduct(false)}
                    className={`px-2 py-1 text-xs rounded transition ${
                      autoDeduct === false
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
          </div>

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
