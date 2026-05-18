// src/pages/AdminChildPanels.jsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import {
  FiRefreshCw, FiChevronDown, FiChevronUp,
  FiEdit2, FiX, FiCheck, FiAlertTriangle,
} from "react-icons/fi";

import CPGlobalSettingsPanel from "../components/admin/childpanel/settings/CPGlobalSettingsPanel";
import CPBillingEdit         from "../components/admin/childpanel/settings/CPBillingEdit";
import { fmt }               from "../components/admin/childpanel/settings/CPSettingsHelpers";

// ─── helpers ─────────────────────────────────────────────────────────
const Badge = ({ active }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
    active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
  }`}>
    {active ? "Active" : "Suspended"}
  </span>
);

// ─── Inline number edit ───────────────────────────────────────────────
function InlineEdit({ label, value, onSave, suffix = "" }) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(value);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onSave(Number(val));
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500">{label}:</span>
      {editing ? (
        <>
          <input
            type="number" min="0" value={val}
            onChange={(e) => setVal(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={handle} disabled={loading}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            <FiCheck size={11} />
          </button>
          <button onClick={() => { setEditing(false); setVal(value); }}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300">
            <FiX size={11} />
          </button>
        </>
      ) : (
        <>
          <span className="text-xs font-semibold text-gray-800">
            {fmt(value)}{suffix}
          </span>
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500">
            <FiEdit2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onClose, danger, extras }) {
  const [loading, setLoading] = useState(false);
  const [reason,  setReason]  = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        {extras?.showReason && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">
              Suspension message (optional)
            </label>
            <textarea
              rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Payment overdue. Contact support."
              className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(reason); setLoading(false); }}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${
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

// ─── Child panel row ──────────────────────────────────────────────────
function ChildPanelRow({ cp, onToggle, onCommission, onDeactivate }) {
  const navigate  = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [data,     setData]     = useState(cp);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(cp._id, data.childPanelIsActive);
    setData((prev) => ({ ...prev, childPanelIsActive: !prev.childPanelIsActive }));
    setToggling(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Summary row ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(data.childPanelBrandName || data.email)?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {data.childPanelBrandName || "—"}{" "}
              <span className="text-gray-400 font-normal text-xs">({data.email})</span>
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <Badge active={data.childPanelIsActive} />
              <span className="text-xs text-gray-400">
                {data.ordersCount || 0} orders · {data.resellersCount || 0} resellers
              </span>
              <span className="text-xs text-gray-400">
                {data.childPanelDomain || data.childPanelSlug || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/admin/child-panels/${cp._id}`)}
            className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
          >
            Details
          </button>
          <button
            onClick={handleToggle} disabled={toggling}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-60 transition ${
              data.childPanelIsActive
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {toggling ? "..." : data.childPanelIsActive ? "Suspend" : "Activate"}
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
          >
            {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── Expanded controls ── */}
      {expanded && (
        <div className="border-t bg-gray-50 px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Wallet */}
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-1">Panel Wallet</p>
              <p className="font-bold text-green-600">${fmt(data.childPanelWallet)}</p>
            </div>

            {/* Commission */}
            <div className="bg-white rounded-xl border p-3">
              <InlineEdit
                label="Commission"
                value={data.childPanelCommissionRate || 0}
                suffix="%"
                onSave={async (v) => {
                  await onCommission(cp._id, v);
                  setData((prev) => ({ ...prev, childPanelCommissionRate: v }));
                }}
              />
            </div>

            {/* Billing — uses CPBillingEdit in compact mode */}
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-1">
                Billing:{" "}
                <span className="capitalize font-medium text-gray-700">
                  {data.childPanelBillingMode || "—"}
                </span>
                {data.childPanelBillingIntervalDays && (
                  <span className="text-gray-400"> · {data.childPanelBillingIntervalDays}d</span>
                )}
              </p>
              <CPBillingEdit
                compact
                cp={data}
                onSaved={(patch) => setData((prev) => ({ ...prev, ...patch }))}
              />
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-2">Danger Zone</p>
              <button
                onClick={() => onDeactivate(cp)}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold"
              >
                Deactivate Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────
export default function AdminChildPanels() {
  const [panels,       setPanels]       = useState([]);
  const [pagination,   setPagination]   = useState({});
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [confirm,      setConfirm]      = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchPanels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/child-panels?page=${page}&limit=20`);
      setPanels(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error("Failed to load child panels"); }
    finally   { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPanels(); }, [fetchPanels]);

  const handleToggle = (id, currentlyActive) => {
    if (currentlyActive) {
      setConfirm({
        message: "Suspend this child panel? The owner will see a suspended message.",
        danger: true,
        extras: { showReason: true },
        onConfirm: async (reason) => {
          try {
            await API.put(`/admin/child-panels/${id}/toggle-status`, { reason });
            setPanels((prev) =>
              prev.map((p) => p._id === id ? { ...p, childPanelIsActive: false } : p)
            );
            toast.success("Panel suspended");
          } catch { toast.error("Failed"); }
          finally   { setConfirm(null); }
        },
      });
    } else {
      setConfirm({
        message: "Activate this child panel?",
        danger: false,
        onConfirm: async () => {
          try {
            await API.put(`/admin/child-panels/${id}/toggle-status`);
            setPanels((prev) =>
              prev.map((p) => p._id === id ? { ...p, childPanelIsActive: true } : p)
            );
            toast.success("Panel activated");
          } catch { toast.error("Failed"); }
          finally   { setConfirm(null); }
        },
      });
    }
  };

  const handleCommission = async (id, rate) => {
    try {
      await API.put(`/admin/child-panels/${id}/commission`, { commission: rate });
      toast.success("Commission updated");
    } catch { toast.error("Failed to update commission"); }
  };

  const handleDeactivate = (cp) => {
    setConfirm({
      message: `Permanently deactivate "${cp.childPanelBrandName || cp.email}"? Their users and data remain but the panel is shut down.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.delete(`/admin/child-panels/${cp._id}`);
          setPanels((prev) => prev.filter((p) => p._id !== cp._id));
          toast.success("Panel deactivated");
        } catch { toast.error("Failed to deactivate"); }
        finally   { setConfirm(null); }
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Child Panels</h1>
            <p className="text-sm text-gray-500">
              {pagination.total || 0} child panel{pagination.total !== 1 ? "s" : ""} registered
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings((s) => !s)}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition ${
                showSettings
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Settings
            </button>
            <button
              onClick={fetchPanels}
              className="flex items-center gap-1.5 text-sm px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Global settings panel */}
        {showSettings && <CPGlobalSettingsPanel />}

        {/* Panel list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : panels.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <p className="text-gray-400">No child panels yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {panels.map((cp) => (
              <ChildPanelRow
                key={cp._id} cp={cp}
                onToggle={handleToggle}
                onCommission={handleCommission}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          extras={confirm.extras}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
