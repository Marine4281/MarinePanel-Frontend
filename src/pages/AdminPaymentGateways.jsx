// src/pages/AdminPaymentGateways.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
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
  secretKey:      "Secret Key",
  publicKey:      "Public Key",
  encryptionKey:  "Encryption Key",
  webhookSecret:  "Webhook Secret",
  consumerKey:    "Consumer Key",
  consumerSecret: "Consumer Secret",
  shortcode:      "Shortcode",
  passkey:        "Passkey",
  apiKey:         "API Key",
  merchantId:     "Merchant UUID",
};

const EMPTY_FORM = {
  provider: "", label: "", processingCurrency: "USD",
  processingCurrencySymbol: "$", exchangeRate: 1,
  feeType: "none", feePercentage: 0, feeFixed: 0,
  minDeposit: 0, adminNote: "", cpNote: "",
  credentials: {},
};

export default function AdminPaymentGateways() {
  const [gateways,    setGateways]    = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editing,     setEditing]     = useState(null); // gateway _id being edited
  const [showForm,    setShowForm]    = useState(false);
  const [loading,     setLoading]     = useState(false);

  const fetchGateways = async () => {
    try {
      const res = await API.get("/admin/gateways");
      setGateways(res.data.gateways || []);
    } catch { toast.error("Failed to load gateways"); }
  };

  useEffect(() => { fetchGateways(); }, []);

  const selectedProvider = PROVIDERS.find((p) => p.value === form.provider);

  const handleCredentialChange = (key, val) => {
    setForm((f) => ({ ...f, credentials: { ...f.credentials, [key]: val } }));
  };

  const handleSubmit = async () => {
    if (!form.provider || !form.label) {
      return toast.error("Provider and label are required");
    }
    try {
      setLoading(true);
      if (editing) {
        await API.put(`/admin/gateways/${editing}`, form);
        toast.success("Gateway updated");
      } else {
        await API.post("/admin/gateways", form);
        toast.success("Gateway created");
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowForm(false);
      fetchGateways();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save gateway");
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
      adminNote:               gw.adminNote || "",
      cpNote:                  gw.cpNote    || "",
      credentials:             {},
    });
    setEditing(gw._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this gateway?")) return;
    try {
      await API.delete(`/admin/gateways/${id}`);
      toast.success("Deleted");
      fetchGateways();
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggleHidden = async (id) => {
    try {
      await API.post(`/admin/gateways/${id}/toggle-hidden`);
      fetchGateways();
    } catch { toast.error("Failed to toggle"); }
  };

  const handleRotateToken = async (id) => {
    try {
      const res = await API.post(`/admin/gateways/${id}/rotate-token`);
      toast.success("Token rotated");
      alert(`New webhook token:\n${res.data.webhookToken}`);
      fetchGateways();
    } catch { toast.error("Failed to rotate token"); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-white">Payment Gateways</h1>
          <button onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "#f97316" }}>
            + Add Gateway
          </button>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Label", "Provider", "Currency", "Rate", "Fee", "Min", "Hidden", "Owner", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.4)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gateways.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm"
                  style={{ color: "rgba(255,255,255,0.3)" }}>No gateways yet</td></tr>
              )}
              {gateways.map((gw) => (
                <tr key={gw._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 text-white font-semibold">{gw.label}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.6)" }}>{gw.provider}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.6)" }}>{gw.processingCurrency}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.6)" }}>{gw.exchangeRate}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.6)" }}>{gw.feeType}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.6)" }}>${gw.minDeposit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.adminHidden ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                      {gw.adminHidden ? "Hidden" : "Visible"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {gw.owner ? (gw.owner.email || "CP Owner") : "Platform"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(gw)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                        style={{ background: "rgba(99,102,241,0.3)" }}>Edit</button>
                      <button onClick={() => handleToggleHidden(gw._id)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(251,191,36,0.15)", color: "#fcd34d" }}>
                        {gw.adminHidden ? "Show" : "Hide"}
                      </button>
                      <button onClick={() => handleRotateToken(gw._id)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>🔄</button>
                      <button onClick={() => handleDelete(gw._id)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Form Modal ── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4"
              style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">{editing ? "Edit Gateway" : "Add Gateway"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>

              {/* Provider */}
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
                <Input value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="e.g. Pay with M-Pesa" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Processing Currency">
                  <Input value={form.processingCurrency} onChange={(v) => setForm({ ...form, processingCurrency: v.toUpperCase() })} placeholder="KES" />
                </Field>
                <Field label="Currency Symbol">
                  <Input value={form.processingCurrencySymbol} onChange={(v) => setForm({ ...form, processingCurrencySymbol: v })} placeholder="Ksh" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Exchange Rate (1 USD = ?)">
                  <Input type="number" value={form.exchangeRate} onChange={(v) => setForm({ ...form, exchangeRate: Number(v) })} placeholder="129" />
                </Field>
                <Field label="Min Deposit (USD)">
                  <Input type="number" value={form.minDeposit} onChange={(v) => setForm({ ...form, minDeposit: Number(v) })} placeholder="1" />
                </Field>
              </div>

              {/* Fee */}
              <Field label="Fee Type">
                <select value={form.feeType}
                  onChange={(e) => setForm({ ...form, feeType: e.target.value })}
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
                  <Input type="number" value={form.feePercentage} onChange={(v) => setForm({ ...form, feePercentage: Number(v) })} placeholder="2.5" />
                </Field>
              )}
              {(form.feeType === "fixed" || form.feeType === "both") && (
                <Field label={`Fixed Fee (${form.processingCurrency})`}>
                  <Input type="number" value={form.feeFixed} onChange={(v) => setForm({ ...form, feeFixed: Number(v) })} placeholder="50" />
                </Field>
              )}

              {/* Notes */}
              <Field label="Admin Note (shown to CP owners & users)">
                <textarea value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
                  rows={2} placeholder="e.g. This gateway charges 2% from the provider side"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
              </Field>

              <Field label="CP Note (shown to users on CP panels)">
                <textarea value={form.cpNote} onChange={(e) => setForm({ ...form, cpNote: e.target.value })}
                  rows={2} placeholder="e.g. Use your registered M-Pesa number only"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
              </Field>

              {/* Dynamic Credential Fields */}
              {selectedProvider && selectedProvider.fields.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    {editing ? "Credentials (leave blank to keep existing)" : "Credentials"}
                  </p>
                  {selectedProvider.fields.map((key) => (
                    <Field key={key} label={FIELD_LABELS[key] || key}>
                      <Input
                        type="password"
                        value={form.credentials[key] || ""}
                        onChange={(v) => handleCredentialChange(key, v)}
                        placeholder={editing ? "••••••••" : `Enter ${FIELD_LABELS[key] || key}`}
                      />
                    </Field>
                  ))}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50"
                style={{ background: "#f97316" }}>
                {loading ? "Saving..." : editing ? "Update Gateway" : "Create Gateway"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Tiny helpers
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
  );
}
