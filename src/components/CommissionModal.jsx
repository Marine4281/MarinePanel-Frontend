// src/components/CommissionModal.jsx
// Reusable modal for per-service and per-category commission overrides

import { useState, useEffect, useRef } from "react";
import { FiX, FiPercent, FiInfo, FiCheck, FiTrash2 } from "react-icons/fi";

export default function CommissionModal({
  isOpen,
  onClose,
  mode, // "service" | "category"
  target, // service object OR category string
  globalCommission, // number — the default/fallback rate
  onSave, // async (value: number | null) => void
  accentColor = "orange", // "orange" | "blue"
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [cleared, setCleared] = useState(false);
  const inputRef = useRef(null);

  const accent = accentColor === "blue"
    ? { ring: "ring-blue-500", btn: "bg-blue-600 hover:bg-blue-700", badge: "bg-blue-100 text-blue-700", header: "from-blue-600 to-blue-700" }
    : { ring: "ring-orange-500", btn: "bg-orange-500 hover:bg-orange-600", badge: "bg-orange-100 text-orange-700", header: "from-orange-500 to-orange-600" };

  useEffect(() => {
    if (!isOpen) return;
    const current =
      mode === "service"
        ? target?.commissionOverride
        : target?.commissionOverride; // category passes its current override via target.commissionOverride too
    setValue(current != null ? String(current) : "");
    setCleared(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen, target, mode]);

  if (!isOpen) return null;

  const label = mode === "service"
    ? target?.name || "Service"
    : `Category: ${target?.name || target}`;

  const currentOverride =
    mode === "service" ? target?.commissionOverride : target?.currentOverride;

  const hasOverride = currentOverride != null;

  const previewRate = () => {
    const pct = parseFloat(value);
    if (isNaN(pct) || pct < 0) return null;
    return pct;
  };

  const handleSave = async () => {
    if (cleared) {
      setSaving(true);
      try { await onSave(null); onClose(); }
      finally { setSaving(false); }
      return;
    }
    const pct = parseFloat(value);
    if (isNaN(pct) || pct < 0) return;
    setSaving(true);
    try { await onSave(pct); onClose(); }
    finally { setSaving(false); }
  };

  const handleClear = () => {
    setValue("");
    setCleared(true);
  };

  const preview = previewRate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease]">

        {/* Header */}
        <div className={`bg-gradient-to-r ${accent.header} text-white px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <FiPercent size={16} />
            <span className="font-bold text-sm">
              {mode === "service" ? "Service Commission" : "Category Commission"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Target label */}
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
              {mode === "service" ? "Service" : "Category"}
            </p>
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{label}</p>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-500">Current:</span>
            {cleared ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                Will use global ({globalCommission}%)
              </span>
            ) : hasOverride ? (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${accent.badge}`}>
                Override: {currentOverride}%
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                Using global ({globalCommission}%)
              </span>
            )}
          </div>

          {/* Input */}
          <div className={cleared ? "opacity-40 pointer-events-none" : ""}>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              New Commission Rate (%)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                min={0}
                step={0.5}
                value={value}
                onChange={(e) => { setValue(e.target.value); setCleared(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder={`e.g. ${globalCommission}`}
                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${accent.ring} transition`}
                disabled={cleared}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
            </div>
          </div>

          {/* Live preview */}
          {!cleared && preview !== null && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-[11px] text-gray-500 font-medium mb-1">Preview (per $1.00 cost):</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-800">
                  ${(1 + preview / 100).toFixed(4)}
                </span>
                <span className="text-xs text-gray-400">end-user price</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                +{preview}% → +${(preview / 100).toFixed(4)} markup per $1.00 cost
              </p>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 text-[11px] text-gray-400 bg-blue-50 rounded-lg px-3 py-2">
            <FiInfo size={12} className="flex-shrink-0 mt-0.5 text-blue-400" />
            <p>
              {mode === "service"
                ? "Service overrides take priority over category and global commission."
                : "Category overrides apply to all services in this category that don't have a service-level override."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {(hasOverride || cleared) && (
              <button
                onClick={cleared ? () => setCleared(false) : handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
              >
                <FiTrash2 size={11} />
                {cleared ? "Undo Clear" : "Clear Override"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!cleared && (value === "" || parseFloat(value) < 0 || isNaN(parseFloat(value))))}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${accent.btn}`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><FiCheck size={13} /> {cleared ? "Clear & Save" : "Save"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
