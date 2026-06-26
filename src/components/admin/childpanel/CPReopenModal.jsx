// src/components/admin/childpanel/CPReopenModal.jsx

import { useState } from "react";
import { FiX, FiRefreshCw, FiClock } from "react-icons/fi";
import API from "../../../api/axios";
import toast from "react-hot-toast";

const GRACE_PRESETS = [
  { label: "6 hours",  hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "1 day",    hours: 24 },
  { label: "2 days",   hours: 48 },
  { label: "3 days",   hours: 72 },
  { label: "7 days",   hours: 168 },
];

export default function CPReopenModal({ cp, onClose, onReopened }) {
  const [mode, setMode]               = useState("next_cycle");
  const [gracePreset, setGracePreset] = useState(24);
  const [customHours, setCustomHours] = useState("");
  const [useCustom, setUseCustom]     = useState(false);
  const [loading, setLoading]         = useState(false);

  const effectiveHours = useCustom ? (Number(customHours) || 0) : gracePreset;

  const handle = async () => {
    setLoading(true);
    try {
      const body = mode === "next_cycle"
        ? { mode: "next_cycle" }
        : { mode: "grace", graceHours: effectiveHours };

      const res = await API.post(`/admin/child-panels/${cp._id}/reopen-subscription`, body);
      toast.success(res.data.message || "Panel reopened");
      onReopened({
        childPanelIsActive: true,
        childPanelSubscriptionSuspended: false,
        childPanelSuspendReason: null,
        childPanelNextBilledAt: res.data.nextBilledAt,
      });
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reopen panel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={18} />
        </button>
        <h2 className="text-base font-bold text-gray-800 mb-1">Reopen Subscription</h2>
        <p className="text-xs text-gray-500 mb-5">
          Panel: <span className="font-semibold text-gray-700">{cp.childPanelBrandName || cp.email}</span>
        </p>

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setMode("next_cycle")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-xs font-semibold transition ${
              mode === "next_cycle"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <FiRefreshCw size={20} />
            Extend to Next Billing
            <span className="font-normal text-gray-400 text-center leading-tight">
              Charges fee & starts a full new billing cycle
            </span>
          </button>

          <button
            onClick={() => setMode("grace")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-xs font-semibold transition ${
              mode === "grace"
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <FiClock size={20} />
            Grant Grace Period
            <span className="font-normal text-gray-400 text-center leading-tight">
              Reopen for a limited time without charging
            </span>
          </button>
        </div>

        {/* Grace options */}
        {mode === "grace" && (
          <div className="mb-5 space-y-3">
            <p className="text-xs font-semibold text-gray-600">Grace duration:</p>
            <div className="flex flex-wrap gap-2">
              {GRACE_PRESETS.map((p) => (
                <button
                  key={p.hours}
                  onClick={() => { setGracePreset(p.hours); setUseCustom(false); }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                    !useCustom && gracePreset === p.hours
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setUseCustom(true)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  useCustom
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                }`}
              >
                Custom
              </button>
            </div>

            {useCustom && (
              <input
                type="number"
                min="1"
                placeholder="Hours e.g. 36"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}

            <p className="text-xs text-gray-400">
              Panel will be active until{" "}
              <span className="font-medium text-gray-600">
                {effectiveHours > 0
                  ? new Date(Date.now() + effectiveHours * 3600000).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })
                  : "—"}
              </span>
              , then cron will suspend again if unpaid.
            </p>
          </div>
        )}

        {mode === "next_cycle" && (
          <div className="mb-5 bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
            <p>• Subscription fee will be deducted from the panel wallet (if sufficient).</p>
            <p>• If wallet is insufficient, panel reopens anyway — admin override.</p>
            <p>• Billing cycle resets from today.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading || (mode === "grace" && useCustom && !customHours)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 ${
              mode === "grace"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : mode === "grace" ? "Grant Grace" : "Reopen Panel"}
          </button>
        </div>
      </div>
    </div>
  );
}
