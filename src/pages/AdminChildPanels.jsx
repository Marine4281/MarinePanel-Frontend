// src/pages/AdminChildPanels.jsx
//
// Main admin page — lists all child panels with stats,
// toggle status, commission, billing overrides, and deactivate.

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import {
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiX,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (v, d = 2) => Number(v || 0).toFixed(d);

const Badge = ({ active }) => (
  <span
    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
    }`}
  >
    {active ? "Active" : "Suspended"}
  </span>
);

// ======================= INLINE EDIT =======================

function InlineEdit({ label, value, onSave, prefix = "", suffix = "" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
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
          <div className="relative">
            {prefix && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {prefix}
              </span>
            )}
            <input
              type="number"
              min="0"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className={`border rounded-lg py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                prefix ? "pl-5 pr-2" : "px-2"
              }`}
            />
            {suffix && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {suffix}
              </span>
            )}
          </div>
          <button
            onClick={handle}
            disabled={loading}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FiCheck size={11} />
          </button>
          <button
            onClick={() => { setEditing(false); setVal(value); }}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FiX size={11} />
          </button>
        </>
      ) : (
        <>
          <span className="text-xs font-semibold text-gray-800">
            {prefix}{fmt(value)}{suffix}
          </span>
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500">
            <FiEdit2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}

// ======================= BILLING EDIT =======================

function BillingEdit({ cp, onSaved }) {
  const [mode, setMode] = useState(cp.childPanelBillingMode || "monthly");
  const [monthly, setMonthly] = useState(cp.childPanelMonthlyFee ?? 0);
  const [perOrder, setPerOrder] = useState(cp.childPanelPerOrderFee ?? 0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
      >
        <FiEdit2 size={11} /> Billing
      </button>

      {open && (
        <div className="mt-2 bg-gray-50 border rounded-xl p-3 space-y-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="per_order">Per Order</option>
            <option value="both">Both</option>
            <option value="none">None</option>
          </select>

          {(mode === "monthly" || mode === "both") && (
            <input
              type="number"
              placeholder="Monthly fee $"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            />
          )}

          {(mode === "per_order" || mode === "both") && (
            <input
              type="number"
              placeholder="Per-order fee $"
              value={perOrder}
              onChange={(e) => setPerOrder(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-1 border rounded-lg text-xs text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="flex-1 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================= CONFIRM MODAL =======================

function ConfirmModal({ message, onConfirm, onClose, danger }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
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
              await onConfirm();
              setLoading(false);
            }}
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

// ======================= CHILD PANEL ROW =======================

function ChildPanelRow({ cp, onToggle, onCommission, onBillingSaved, onDeactivate }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [data, setData] = useState(cp);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(cp._id);
    setData((prev) => ({ ...prev, childPanelIsActive: !prev.childPanelIsActive }));
    setToggling(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Row header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(data.childPanelBrandName || data.email)?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {data.childPanelBrandName || "—"}{" "}
              <span className="text-gray-400 font-normal text-xs">
                ({data.email})
              </span>
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <Badge active={data.childPanelIsActive} />
              <span className="text-xs text-gray-400">
                {data.ordersCount || 0} orders · {data.resellersCount || 0} resellers
              </span>
              <span className="text-xs text-gray-400">
                Domain: {data.childPanelDomain || data.childPanelSlug || "—"}
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
            onClick={handleToggle}
            disabled={toggling}
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

      {/* Expanded controls */}
      {expanded && (
        <div className="border-t bg-gray-50 px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Wallet */}
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-1">Panel Wallet</p>
              <p className="font-bold text-green-600">
                ${fmt(data.childPanelWallet)}
              </p>
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

            {/* Billing */}
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-1">
                Billing: <span className="capitalize font-medium text-gray-700">
                  {data.childPanelBillingMode || "—"}
                </span>
              </p>
              <BillingEdit
                cp={data}
                onSaved={(patch) => setData((prev) => ({ ...prev, ...patch }))}
              />
            </div>

            {/* Deactivate */}
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

// ======================= MAIN =======================

export default function AdminChildPanels() {
  const [panels, setPanels] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/child-panels?page=${page}&limit=20`);
      setPanels(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      toast.error("Failed to load child panels");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (id) => {
    try {
      await API.put(`/admin/child-panels/${id}/toggle`);
      toast.success("Status updated");
    } catch {
      toast.error("Failed");
    }
  };

  const handleCommission = async (id, rate) => {
    try {
      await API.put(`/admin/child-panels/${id}/commission`, { commission: rate });
      toast.success("Commission updated");
    } catch {
      toast.error("Failed to update commission");
    }
  };

  const handleDeactivate = (cp) => {
    setConfirm({
      message: `Permanently deactivate "${cp.childPanelBrandName || cp.email}"? Their users and data remain but the panel is shut down.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.delete(`/admin/child-panels/${cp._id}/deactivate`);
          setPanels((prev) => prev.filter((p) => p._id !== cp._id));
          toast.success("Panel deactivated");
        } catch {
          toast.error("Failed to deactivate");
        } finally {
          setConfirm(null);
        }
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
              {pagination.total || 0} child panel
              {pagination.total !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={fetch}
            className="flex items-center gap-1.5 text-sm px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* List */}
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
                key={cp._id}
                cp={cp}
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
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage((p) => p + 1)}
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
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
