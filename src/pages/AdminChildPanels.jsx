// src/pages/AdminChildPanels.jsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import {
  FiRefreshCw, FiChevronDown, FiChevronUp, FiEdit2, FiX, FiCheck,
  FiAlertTriangle, FiPlus, FiTrash2, FiSettings, FiList,
} from "react-icons/fi";

// ─── helpers ─────────────────────────────────────────────────────────
const fmt = (v, d = 2) => Number(v || 0).toFixed(d);

const Badge = ({ active }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
    active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
  }`}>
    {active ? "Active" : "Suspended"}
  </span>
);

// ─── Inline number edit ───────────────────────────────────────────────
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

// ─── Billing edit panel ───────────────────────────────────────────────
function BillingEdit({ cp, onSaved }) {
  const [mode, setMode]       = useState(cp.childPanelBillingMode || "monthly");
  const [monthly, setMonthly] = useState(cp.childPanelMonthlyFee ?? 0);
  const [perOrder, setPerOrder] = useState(cp.childPanelPerOrderFee ?? 0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing`, {
        billingMode: mode, monthlyFee: Number(monthly), perOrderFee: Number(perOrder),
      });
      toast.success("Billing updated");
      onSaved({ billingMode: mode, monthlyFee: Number(monthly), perOrderFee: Number(perOrder) });
      setOpen(false);
    } catch { toast.error("Failed to update billing"); }
    finally   { setLoading(false); }
  };

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}
        className="text-xs text-blue-500 hover:underline flex items-center gap-1">
        <FiEdit2 size={11} /> Billing
      </button>
      {open && (
        <div className="mt-2 bg-gray-50 border rounded-xl p-3 space-y-2">
          <select value={mode} onChange={(e) => setMode(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none">
            <option value="monthly">Monthly</option>
            <option value="per_order">Per Order</option>
            <option value="both">Both</option>
            <option value="none">None</option>
          </select>
          {(mode === "monthly" || mode === "both") && (
            <input type="number" placeholder="Monthly fee $" value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          )}
          {(mode === "per_order" || mode === "both") && (
            <input type="number" placeholder="Per-order fee $" value={perOrder}
              onChange={(e) => setPerOrder(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          )}
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)}
              className="flex-1 py-1 border rounded-lg text-xs text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={save} disabled={loading}
              className="flex-1 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onClose, danger, extras }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason]   = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        {extras?.showReason && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Suspension message (optional)</label>
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
            onClick={async () => {
              setLoading(true);
              await onConfirm(reason);
              setLoading(false);
            }}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tiered fee builder ───────────────────────────────────────────────
function TiersBuilder({ tiers, onChange }) {
  const add = () =>
    onChange([...tiers, { minOrders: 0, maxOrders: null, fee: 0 }]);

  const update = (i, field, val) => {
    const next = tiers.map((t, idx) =>
      idx === i ? { ...t, [field]: val === "" ? null : Number(val) } : t
    );
    onChange(next);
  };

  const remove = (i) => onChange(tiers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {tiers.length === 0 && (
        <p className="text-xs text-gray-400 italic">
          No tiers set — flat monthly fee will be used.
        </p>
      )}
      {tiers.map((t, i) => (
        <div key={i} className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-lg p-2 border">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Orders</span>
            <input type="number" min="0" value={t.minOrders}
              onChange={(e) => update(i, "minOrders", e.target.value)}
              className="w-16 border rounded px-1.5 py-1 text-xs focus:outline-none" placeholder="Min" />
            <span className="text-xs text-gray-400">–</span>
            <input type="number" min="0" value={t.maxOrders ?? ""}
              onChange={(e) => update(i, "maxOrders", e.target.value === "" ? "" : e.target.value)}
              className="w-16 border rounded px-1.5 py-1 text-xs focus:outline-none" placeholder="Max (∞)" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Fee $</span>
            <input type="number" min="0" step="0.01" value={t.fee}
              onChange={(e) => update(i, "fee", e.target.value)}
              className="w-16 border rounded px-1.5 py-1 text-xs focus:outline-none" />
          </div>
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 ml-auto">
            <FiTrash2 size={13} />
          </button>
        </div>
      ))}
      <button onClick={add}
        className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
        <FiPlus size={12} /> Add tier
      </button>
    </div>
  );
}

// ─── Guide editor row ─────────────────────────────────────────────────
function GuideRow({ guide, onUpdate, onDelete }) {
  const [editing, setEditing]     = useState(false);
  const [title, setTitle]         = useState(guide.title);
  const [content, setContent]     = useState(guide.content);
  const [placement, setPlacement] = useState(guide.placement);
  const [visible, setVisible]     = useState(guide.visible);
  const [loading, setLoading]     = useState(false);

  const save = async () => {
    setLoading(true);
    await onUpdate(guide._id, { title, content, placement, visible });
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="border rounded-xl p-3 bg-white space-y-2">
      {editing ? (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            placeholder="Title" />
          <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none resize-none"
            placeholder="Content (markdown supported)" />
          <div className="flex gap-2 flex-wrap">
            <select value={placement} onChange={(e) => setPlacement(e.target.value)}
              className="border rounded-lg px-2 py-1 text-xs focus:outline-none">
              <option value="activation">Activation page</option>
              <option value="dashboard">Dashboard</option>
              <option value="both">Both</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
              Visible
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="flex-1 py-1 border rounded-lg text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={loading}
              className="flex-1 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-800">{guide.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                guide.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>{guide.visible ? "Visible" : "Hidden"}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                {guide.placement}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{guide.content}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-blue-500">
              <FiEdit2 size={13} />
            </button>
            <button onClick={() => onDelete(guide._id)} className="p-1.5 text-gray-400 hover:text-red-500">
              <FiTrash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Global Settings Panel ────────────────────────────────────────────
function GlobalSettingsPanel() {
  const [tab, setTab]         = useState("fees"); // fees | guides
  const [settings, setSettings] = useState(null);
  const [tiers, setTiers]     = useState([]);
  const [guides, setGuides]   = useState([]);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  // New guide form
  const [newTitle, setNewTitle]         = useState("");
  const [newContent, setNewContent]     = useState("");
  const [newPlacement, setNewPlacement] = useState("activation");
  const [addingGuide, setAddingGuide]   = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [fRes, gRes] = await Promise.all([
        API.get("/admin/child-panels/settings/fees"),
        API.get("/admin/child-panel-guides"),
      ]);
      const d = fRes.data.data || fRes.data;
      setSettings(d);
      setTiers(d.monthlyTiers || []);
      setGuides(gRes.data || []);
    } catch { toast.error("Failed to load settings"); }
    finally   { setLoading(false); }
  };

  const saveFees = async () => {
    setSaving(true);
    try {
      await API.put("/admin/child-panels/settings/fees", {
        activationFee: Number(settings.activationFee),
        billingMode:   settings.billingMode,
        monthlyFee:    Number(settings.monthlyFee),
        perOrderFee:   Number(settings.perOrderFee),
        withdrawMin:   Number(settings.withdrawMin),
        minDeposit:    Number(settings.minDeposit),
        monthlyTiers:  tiers,
      });
      toast.success("Settings saved");
    } catch { toast.error("Failed to save settings"); }
    finally   { setSaving(false); }
  };

  const handleGuideUpdate = async (id, updates) => {
    try {
      const res = await API.put(`/admin/child-panel-guides/${id}`, updates);
      setGuides((prev) => prev.map((g) => (g._id === id ? res.data : g)));
      toast.success("Guide updated");
    } catch { toast.error("Failed to update guide"); }
  };

  const handleGuideDelete = async (id) => {
    if (!window.confirm("Delete this guide?")) return;
    try {
      await API.delete(`/admin/child-panel-guides/${id}`);
      setGuides((prev) => prev.filter((g) => g._id !== id));
      toast.success("Guide deleted");
    } catch { toast.error("Failed to delete guide"); }
  };

  const handleAddGuide = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setAddingGuide(true);
    try {
      const res = await API.post("/admin/child-panel-guides", {
        title: newTitle, content: newContent, placement: newPlacement, visible: true,
      });
      setGuides((prev) => [...prev, res.data]);
      setNewTitle(""); setNewContent(""); setNewPlacement("activation");
      toast.success("Guide created");
    } catch { toast.error("Failed to create guide"); }
    finally   { setAddingGuide(false); }
  };

  if (loading) return (
    <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b bg-gray-50">
        {[
          { id: "fees",   label: "Fees & Billing", icon: <FiSettings size={13} /> },
          { id: "guides", label: "Guidelines",      icon: <FiList size={13} />     },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 transition ${
              tab === t.id
                ? "border-blue-500 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* ── FEES TAB ── */}
        {tab === "fees" && settings && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "activationFee", label: "Activation Fee ($)" },
                { key: "monthlyFee",    label: "Flat Monthly Fee ($)" },
                { key: "perOrderFee",   label: "Per-Order Fee ($)" },
                { key: "withdrawMin",   label: "Min Withdrawal ($)" },
                { key: "minDeposit",    label: "Min Deposit ($)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input type="number" min="0" step="0.01"
                    value={settings[key] ?? 0}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, [key]: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Default Billing Mode</label>
                <select value={settings.billingMode}
                  onChange={(e) => setSettings((s) => ({ ...s, billingMode: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="monthly">Monthly</option>
                  <option value="per_order">Per Order</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Tiered billing */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                Tiered Monthly Billing
                <span className="font-normal text-gray-400 ml-1">
                  (overrides flat fee when set)
                </span>
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                Define order-count ranges with a monthly fee per range.
                e.g. 0–100 orders = $0, 101–500 = $2, 501+ = $5
              </p>
              <TiersBuilder tiers={tiers} onChange={setTiers} />
            </div>

            <div className="flex justify-end">
              <button onClick={saveFees} disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* ── GUIDES TAB ── */}
        {tab === "guides" && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              These guidelines appear on the child panel activation page, owner dashboard, or both —
              just like reseller guides.
            </p>

            {/* Add new guide */}
            <div className="border border-dashed rounded-xl p-4 space-y-2 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 mb-1">New Guideline</p>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                placeholder="Title" />
              <textarea rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none resize-none"
                placeholder="Content" />
              <div className="flex items-center gap-3 flex-wrap">
                <select value={newPlacement} onChange={(e) => setNewPlacement(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-xs focus:outline-none">
                  <option value="activation">Activation page</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="both">Both</option>
                </select>
                <button onClick={handleAddGuide} disabled={addingGuide}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60">
                  <FiPlus size={12} /> {addingGuide ? "Adding..." : "Add Guide"}
                </button>
              </div>
            </div>

            {/* Existing guides */}
            {guides.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No guidelines yet</p>
            ) : (
              <div className="space-y-2">
                {guides.map((g) => (
                  <GuideRow key={g._id} guide={g}
                    onUpdate={handleGuideUpdate}
                    onDelete={handleGuideDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Child panel row ──────────────────────────────────────────────────
function ChildPanelRow({ cp, onToggle, onCommission, onDeactivate }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [data, setData]         = useState(cp);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(cp._id, data.childPanelIsActive);
    setData((prev) => ({ ...prev, childPanelIsActive: !prev.childPanelIsActive }));
    setToggling(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                {data.usersCount ? ` · ${data.usersCount} users` : ""}
              </span>
              <span className="text-xs text-gray-400">
                {data.childPanelDomain || data.childPanelSlug || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate(`/admin/child-panels/${cp._id}`)}
            className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
            Details
          </button>
          <button onClick={handleToggle} disabled={toggling}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-60 transition ${
              data.childPanelIsActive
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}>
            {toggling ? "..." : data.childPanelIsActive ? "Suspend" : "Activate"}
          </button>
          <button onClick={() => setExpanded((e) => !e)}
            className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200">
            {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-gray-50 px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-1">Panel Wallet</p>
              <p className="font-bold text-green-600">${fmt(data.childPanelWallet)}</p>
            </div>
            <div className="bg-white rounded-xl border p-3">
              <InlineEdit label="Commission" value={data.childPanelCommissionRate || 0} suffix="%"
                onSave={async (v) => {
                  await onCommission(cp._id, v);
                  setData((prev) => ({ ...prev, childPanelCommissionRate: v }));
                }} />
            </div>
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-1">
                Billing: <span className="capitalize font-medium text-gray-700">
                  {data.childPanelBillingMode || "—"}
                </span>
              </p>
              <BillingEdit cp={data} onSaved={(patch) => setData((prev) => ({ ...prev, ...patch }))} />
            </div>
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-400 mb-2">Danger Zone</p>
              <button onClick={() => onDeactivate(cp)}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold">
                Deactivate Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────
export default function AdminChildPanels() {
  const [panels, setPanels]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [confirm, setConfirm]     = useState(null);
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
      // Suspending — ask for optional reason
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
      // Activating — no reason needed
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
            <button onClick={() => setShowSettings((s) => !s)}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition ${
                showSettings
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              <FiSettings size={14} /> Settings
            </button>
            <button onClick={fetchPanels}
              className="flex items-center gap-1.5 text-sm px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600">
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && <GlobalSettingsPanel />}

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
              <ChildPanelRow key={cp._id} cp={cp}
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
            <span className="text-gray-500">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
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
