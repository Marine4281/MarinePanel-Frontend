// src/pages/childpanel/CpPaymentGateways.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const PROVIDERS = [
  { value: "paystack",    label: "Paystack",     fields: ["secretKey", "publicKey"] },
  { value: "flutterwave", label: "Flutterwave",  fields: ["secretKey", "publicKey", "encryptionKey", "webhookSecret"] },
  { value: "mpesa",       label: "M-Pesa Daraja",fields: ["consumerKey", "consumerSecret", "shortcode", "passkey"] },
  { value: "kora",        label: "Kora",         fields: ["secretKey", "publicKey"] },
  { value: "binance",     label: "Binance Pay",  fields: ["apiKey", "secretKey"] },
  { value: "cryptomus",   label: "Cryptomus",    fields: ["apiKey", "merchantId"] },
  { value: "manual",      label: "Manual",       fields: [] },
];

const FIELD_LABELS = {
  secretKey: "Secret Key", publicKey: "Public Key",
  encryptionKey: "Encryption Key", webhookSecret: "Webhook Secret",
  consumerKey: "Consumer Key", consumerSecret: "Consumer Secret",
  shortcode: "Shortcode", passkey: "Passkey",
  apiKey: "API Key", merchantId: "Merchant UUID",
};

const EMPTY_FORM = {
  provider: "", label: "", processingCurrency: "USD",
  processingCurrencySymbol: "$", exchangeRate: 1,
  feeType: "none", feePercentage: 0, feeFixed: 0,
  minDeposit: 0, cpNote: "", credentials: {},
};

const BRAND = "#f97316";

export default function CpPaymentGateways() {
  const [gateways,  setGateways]  = useState([]);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editing,   setEditing]   = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const fetchGateways = async () => {
    try {
      const res = await API.get("/cp/gateways");
      setGateways(res.data.gateways || []);
    } catch { toast.error("Failed to load gateways"); }
  };

  useEffect(() => { fetchGateways(); }, []);

  const selectedProvider = PROVIDERS.find((p) => p.value === form.provider);

  const handleCredentialChange = (key, val) =>
    setForm((f) => ({ ...f, credentials: { ...f.credentials, [key]: val } }));

  const handleSubmit = async () => {
    if (!form.provider || !form.label) return toast.error("Provider and label required");
    try {
      setLoading(true);
      if (editing) {
        await API.put(`/cp/gateways/${editing}`, form);
        toast.success("Gateway updated");
      } else {
        await API.post("/cp/gateways", form);
        toast.success("Gateway created");
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowForm(false);
      fetchGateways();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setLoading(false); }
  };

  const handleEdit = (gw) => {
    setForm({
      provider:                gw.provider,
      label:                   gw.label,
      processingCurrency:      gw.processingCurrency,
      processingCurrencySymbol:gw.processingCurrencySymbol,
      exchangeRate:            gw.exchangeRate,
      feeType:                 gw.feeType,
      feePercentage:           gw.feePercentage,
      feeFixed:                gw.feeFixed,
      minDeposit:              gw.minDeposit,
      cpNote:                  gw.cpNote || "",
      credentials:             {},
    });
    setEditing(gw._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this gateway?")) return;
    try {
      await API.delete(`/cp/gateways/${id}`);
      toast.success("Deleted");
      fetchGateways();
    } catch { toast.error("Failed to delete"); }
  };

  const handleRotateToken = async (id) => {
    try {
      const res = await API.post(`/cp/gateways/${id}/rotate-token`);
      toast.success("Token rotated");
      alert(`Your new webhook URL:\n${import.meta.env.VITE_API_URL}/api/webhooks/${gateways.find(g=>g._id===id)?.provider}/${res.data.webhookToken}`);
      fetchGateways();
    } catch { toast.error("Failed to rotate token"); }
  };

  const getWebhookUrl = (gw) =>
    `${import.meta.env.VITE_API_URL}/api/webhooks/${gw.provider}/${gw.webhookToken}`;

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#060a12" }}>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Payment Gateways</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Add your own payment providers. Users on your panel will see these.
          </p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: BRAND }}>
          + Add Gateway
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="space-y-3">
        {gateways.length === 0 && (
          <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
            No gateways yet. Add your first one above.
          </div>
        )}
        {gateways.map((gw) => (
          <div key={gw._id} className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-white">{gw.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {gw.provider} · {gw.processingCurrency} · Rate: {gw.exchangeRate} · Fee: {gw.feeType}
                </p>
                {gw.adminNote && (
                  <p className="text-xs mt-2 px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>
                    ℹ️ {gw.adminNote}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(gw)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "rgba(99,102,241,0.3)" }}>Edit</button>
                <button onClick={() => handleRotateToken(gw._id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>🔄 Webhook</button>
                <button onClick={() => handleDelete(gw._id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>Del</button>
              </div>
            </div>

            {/* Webhook URL */}
            {gw.webhookToken && (
              <div className="mt-3">
                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Paste this URL in your {gw.provider} dashboard:
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <code className="text-xs flex-1 truncate" style={{ color: "#4ade80" }}>
                    {getWebhookUrl(gw)}
                  </code>
                  <button onClick={() => { navigator.clipboard.writeText(getWebhookUrl(gw)); toast.success("Copied!"); }}
                    className="text-xs px-2 py-1 rounded-md flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4"
            style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">{editing ? "Edit Gateway" : "Add Gateway"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            <Field label="Provider">
              <select value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value, credentials: {} })}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <option value="">Select provider</option>
                {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>

            <Field label="Display Label">
              <Inp value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="e.g. Pay with M-Pesa" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Processing Currency">
                <Inp value={form.processingCurrency} onChange={(v) => setForm({ ...form, processingCurrency: v.toUpperCase() })} placeholder="KES" />
              </Field>
              <Field label="Currency Symbol">
                <Inp value={form.processingCurrencySymbol} onChange={(v) => setForm({ ...form, processingCurrencySymbol: v })} placeholder="Ksh" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Exchange Rate (1 USD = ?)">
                <Inp type="number" value={form.exchangeRate} onChange={(v) => setForm({ ...form, exchangeRate: Number(v) })} placeholder="129" />
              </Field>
              <Field label="Min Deposit (USD)">
                <Inp type="number" value={form.minDeposit} onChange={(v) => setForm({ ...form, minDeposit: Number(v) })} placeholder="1" />
              </Field>
            </div>

            <Field label="Fee Type">
              <select value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <option value="none">None</option>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
                <option value="both">Both</option>
              </select>
            </Field>

            {(form.feeType === "percentage" || form.feeType === "both") && (
              <Field label="Fee Percentage (%)">
                <Inp type="number" value={form.feePercentage} onChange={(v) => setForm({ ...form, feePercentage: Number(v) })} placeholder="2.5" />
              </Field>
            )}
            {(form.feeType === "fixed" || form.feeType === "both") && (
              <Field label={`Fixed Fee (${form.processingCurrency})`}>
                <Inp type="number" value={form.feeFixed} onChange={(v) => setForm({ ...form, feeFixed: Number(v) })} placeholder="50" />
              </Field>
            )}

            <Field label="Note for your users">
              <textarea value={form.cpNote} onChange={(e) => setForm({ ...form, cpNote: e.target.value })}
                rows={2} placeholder="e.g. Use your registered M-Pesa number"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
            </Field>

            {selectedProvider && selectedProvider.fields.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  {editing ? "Credentials (leave blank to keep existing)" : "API Credentials"}
                </p>
                {selectedProvider.fields.map((key) => (
                  <Field key={key} label={FIELD_LABELS[key] || key}>
                    <Inp type="password" value={form.credentials[key] || ""}
                      onChange={(v) => handleCredentialChange(key, v)}
                      placeholder={editing ? "••••••••" : `Enter ${FIELD_LABELS[key] || key}`} />
                  </Field>
                ))}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50"
              style={{ background: BRAND }}>
              {loading ? "Saving..." : editing ? "Update Gateway" : "Create Gateway"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
  );
                                                }
