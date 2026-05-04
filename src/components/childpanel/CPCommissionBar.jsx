// src/components/childpanel/services/CPCommissionBar.jsx
// Sticky top bar showing current commission % with inline edit.
// End users see: service.rate + commission%

import { useState } from "react";
import { FiPercent, FiEdit2, FiCheck, FiX, FiInfo } from "react-icons/fi";
import API from "../../../api/axios";
import toast from "react-hot-toast";

export default function CPCommissionBar({ commission, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(commission ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = Number(val);
    if (isNaN(parsed) || parsed < 0) return toast.error("Enter a valid commission %");
    setSaving(true);
    try {
      await API.patch("/cp/services/commission", { commission: parsed });
      onUpdate(parsed);
      toast.success("Commission updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update commission");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl shadow">
      <div className="flex items-center gap-2">
        <FiPercent size={16} />
        <span className="font-semibold text-sm">Your Commission Markup</span>
        <div className="relative group">
          <FiInfo size={13} className="opacity-70 cursor-help" />
          <div className="absolute left-5 top-0 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2.5 z-20 shadow-xl">
            This % is added on top of every service rate before your end users see the price.
            e.g. cost $1.00 + 20% = $1.20 shown to end user.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="number"
              min={0}
              step={0.1}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-24 border border-blue-300 bg-blue-500/40 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-blue-200"
            />
            <span className="text-sm font-bold">%</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-60"
            >
              <FiCheck size={14} />
            </button>
            <button
              onClick={() => { setEditing(false); setVal(commission ?? 0); }}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{commission ?? 0}%</span>
            <button
              onClick={() => { setEditing(true); setVal(commission ?? 0); }}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              <FiEdit2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
