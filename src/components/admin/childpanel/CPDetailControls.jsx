// src/components/admin/childpanel/CPDetailControls.jsx

import { useState } from "react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { fmt } from "./CPDetailHelpers";

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

// ── Billing mode + fee editor ─────────────────────────────────────────
function BillingEdit({ cp, onSaved }) {
  const [open, setOpen]         = useState(false);
  const [mode, setMode]         = useState(cp?.childPanelBillingMode || "monthly");
  const [monthly, setMonthly]   = useState(cp?.childPanelMonthlyFee ?? 0);
  const [perOrder, setPerOrder] = useState(cp?.childPanelPerOrderFee ?? 0);
  const [loading, setLoading]   = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing`, {
        billingMode: mode,
        monthlyFee: Number(monthly),
        perOrderFee: Number(perOrder),
      });
      toast.success("Billing updated");
      onSaved({ billingMode: mode, monthlyFee: Number(monthly), perOrderFee: Number(perOrder) });
      setOpen(false);
    } catch {
      toast.error("Failed to update billing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
        <FiEdit2 size={11} /> Edit Billing
      </button>

      {open && (
        <div className="mt-3 bg-gray-50 border rounded-xl p-4 space-y-3">
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
        </div>
      )}
    </div>
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
      <div className="border-t pt-3">
        <p className="text-xs text-gray-500">
          Billing:{" "}
          <span className="font-semibold text-gray-800 capitalize">
            {cp.childPanelBillingMode || "—"}
          </span>
          {cp.childPanelMonthlyFee  > 0 && <> · ${cp.childPanelMonthlyFee}/mo</>}
          {cp.childPanelPerOrderFee > 0 && <> · ${cp.childPanelPerOrderFee}/order</>}
        </p>
        <BillingEdit cp={cp} onSaved={onBillingSaved} />
      </div>

      {/* Danger zone */}
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">
          Danger Zone
        </p>
        <button onClick={onDeactivate}
          className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition">
          Deactivate Panel
        </button>
      </div>
    </div>
  );
}
