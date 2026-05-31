// src/pages/AdminPaymentGateways.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

// ─── CONSTANTS ────────────────────────────────────────────────────────
const PROVIDER_TYPES = [
  { value: "paystack",    label: "Paystack",      fields: ["secretKey","publicKey"] },
  { value: "flutterwave", label: "Flutterwave",   fields: ["secretKey","publicKey","encryptionKey","webhookSecret"] },
  { value: "mpesa",       label: "M-Pesa Daraja", fields: ["consumerKey","consumerSecret","shortcode","passkey"] },
  { value: "kora",        label: "Kora",          fields: ["secretKey","publicKey"] },
  { value: "binance",     label: "Binance Pay",   fields: ["apiKey","secretKey"] },
  { value: "cryptomus",   label: "Cryptomus",     fields: ["apiKey","merchantId"] },
  { value: "manual",      label: "Manual",        fields: [] },
];

const FIELD_LABELS = {
  secretKey:"Secret Key", publicKey:"Public Key", encryptionKey:"Encryption Key",
  webhookSecret:"Webhook Secret", consumerKey:"Consumer Key",
  consumerSecret:"Consumer Secret", shortcode:"Shortcode", passkey:"Passkey",
  apiKey:"API Key", merchantId:"Merchant UUID",
};

const PAYMENT_MODES = [
  { value: "hosted",  label: "Hosted (redirect to provider)" },
  { value: "mpesa",   label: "M-Pesa (phone number)" },
  { value: "momo",    label: "MoMo (phone + network)" },
  { value: "airtel",  label: "Airtel Money (phone number)" },
  { value: "card",    label: "Card (number, expiry, cvv)" },
  { value: "bank",    label: "Bank Transfer" },
  { value: "crypto",  label: "Crypto (wallet address + network)" },
  { value: "binance", label: "Binance (Binance ID)" },
  { value: "manual",  label: "Manual (instructions only)" },
];

const EMPTY_PROVIDER = { name: "", providerType: "", credentials: {}, isActive: true };

const EMPTY_GATEWAY = {
  name: "", description: "", paymentMode: "hosted", providerProfile: "",
  binanceId: "", paymentInstructions: "",
  processingCurrency: "USD", processingCurrencySymbol: "$",
  exchangeRate: 1, feeType: "none", feePercentage: 0, feeFixed: 0,
  minDeposit: 0, adminNote: "", cpNote: "",
  isVisible: true, visibleToCp: false,
};

// ─── HELPERS ─────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 transition" />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 transition bg-white">
      <option value="">Select...</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, sublabel, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
    <button onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-orange-500" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────
export default function AdminPaymentGateways() {
  const [tab,              setTab]              = useState("gateways");
  const [providers,        setProviders]        = useState([]);
  const [gateways,         setGateways]         = useState([]);
  const [pendingDeposits,  setPendingDeposits]  = useState([]);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showGatewayForm,  setShowGatewayForm]  = useState(false);
  const [editingProvider,  setEditingProvider]  = useState(null);
  const [editingGateway,   setEditingGateway]   = useState(null);
  const [providerForm,     setProviderForm]     = useState(EMPTY_PROVIDER);
  const [gatewayForm,      setGatewayForm]      = useState(EMPTY_GATEWAY);
  const [loading,          setLoading]          = useState(false);

  const fetchAll = async () => {
    try {
      const [p, g, d] = await Promise.all([
        API.get("/admin/payment-providers"),
        API.get("/admin/gateways"),
        API.get("/admin/deposits/pending"),
      ]);
      setProviders(p.data.providers || []);
      setGateways(g.data.gateways   || []);
      setPendingDeposits(d.data.deposits || []);
    } catch { toast.error("Failed to load data"); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Provider handlers ────────────────────────────────────
  const handleSaveProvider = async () => {
    if (!providerForm.name || !providerForm.providerType) {
      return toast.error("Name and type are required");
    }
    try {
      setLoading(true);
      if (editingProvider) {
        await API.put(`/admin/payment-providers/${editingProvider}`, providerForm);
        toast.success("Provider updated");
      } else {
        await API.post("/admin/payment-providers", providerForm);
        toast.success("Provider created");
      }
      setProviderForm(EMPTY_PROVIDER);
      setEditingProvider(null);
      setShowProviderForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save provider");
    } finally { setLoading(false); }
  };

  const handleEditProvider = (p) => {
    setProviderForm({ name: p.name, providerType: p.providerType, credentials: {}, isActive: p.isActive });
    setEditingProvider(p._id);
    setShowProviderForm(true);
  };

  const handleDeleteProvider = async (id) => {
    if (!confirm("Delete this provider?")) return;
    try {
      await API.delete(`/admin/payment-providers/${id}`);
      toast.success("Provider deleted");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  // ── Gateway handlers ─────────────────────────────────────
  const handleSaveGateway = async () => {
    if (!gatewayForm.name) return toast.error("Gateway name is required");
    try {
      setLoading(true);
      if (editingGateway) {
        await API.put(`/admin/gateways/${editingGateway}`, gatewayForm);
        toast.success("Gateway updated");
      } else {
        await API.post("/admin/gateways", gatewayForm);
        toast.success("Gateway created");
      }
      setGatewayForm(EMPTY_GATEWAY);
      setEditingGateway(null);
      setShowGatewayForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save gateway");
    } finally { setLoading(false); }
  };

  const handleEditGateway = (gw) => {
    setGatewayForm({
      name:                     gw.name,
      description:              gw.description              || "",
      paymentMode:              gw.paymentMode              || "hosted",
      providerProfile:          gw.providerProfile?._id     || gw.providerProfile || "",
      binanceId:                gw.binanceId                || "",
      paymentInstructions:      gw.paymentInstructions      || "",
      processingCurrency:       gw.processingCurrency       || "USD",
      processingCurrencySymbol: gw.processingCurrencySymbol || "$",
      exchangeRate:             gw.exchangeRate             || 1,
      feeType:                  gw.feeType                  || "none",
      feePercentage:            gw.feePercentage            || 0,
      feeFixed:                 gw.feeFixed                 || 0,
      minDeposit:               gw.minDeposit               || 0,
      adminNote:                gw.adminNote                || "",
      cpNote:                   gw.cpNote                   || "",
      isVisible:                gw.isVisible,
      visibleToCp:              gw.visibleToCp,
    });
    setEditingGateway(gw._id);
    setShowGatewayForm(true);
  };

  const handleDeleteGateway = async (id) => {
    if (!confirm("Delete this gateway?")) return;
    try {
      await API.delete(`/admin/gateways/${id}`);
      toast.success("Deleted");
      fetchAll();
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggleHidden = async (id) => {
    try {
      await API.post(`/admin/gateways/${id}/toggle-hidden`);
      fetchAll();
    } catch { toast.error("Failed"); }
  };

  const handleRotateToken = async (id, provider) => {
    try {
      const res = await API.post(`/admin/gateways/${id}/rotate-token`);
      const url = `${import.meta.env.VITE_API_URL}/api/webhooks/${provider}/${res.data.webhookToken}`;
      toast.success("Token rotated");
      alert(`New webhook URL:\n${url}`);
      fetchAll();
    } catch { toast.error("Failed"); }
  };

  // ── Deposit handlers ─────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await API.post(`/admin/deposits/${id}/approve`);
      toast.success("Deposit approved");
      fetchAll();
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this deposit?")) return;
    try {
      await API.post(`/admin/deposits/${id}/reject`);
      toast.success("Deposit rejected");
      fetchAll();
    } catch { toast.error("Failed to reject"); }
  };

  // ── Selected provider type for form fields ───────────────
  const selectedProviderType = PROVIDER_TYPES.find((p) => p.value === providerForm.providerType);
  const providerOptions = providers
    .filter((p) => p.isActive)
    .map((p) => ({ value: p._id, label: `${p.name} (${p.providerType})` }));

  const needsProvider = !["binance", "manual"].includes(gatewayForm.paymentMode) || gatewayForm.paymentMode === "hosted";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Payment System</h1>
          <div className="flex gap-2">
            {tab === "providers" && (
              <button onClick={() => { setProviderForm(EMPTY_PROVIDER); setEditingProvider(null); setShowProviderForm(true); }}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
                + Add Provider
              </button>
            )}
            {tab === "gateways" && (
              <button onClick={() => { setGatewayForm(EMPTY_GATEWAY); setEditingGateway(null); setShowGatewayForm(true); }}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
                + Add Gateway
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white rounded-2xl shadow p-1 w-fit">
          {[
            { key: "gateways",  label: "Gateways",         count: gateways.length },
            { key: "providers", label: "Providers",         count: providers.length },
            { key: "pending",   label: "Pending Deposits",  count: pendingDeposits.length },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                tab === t.key ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-800"
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB: GATEWAYS
        ════════════════════════════════ */}
        {tab === "gateways" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Name","Mode","Provider","Currency","Fee","Min","Visible","CP","Hidden","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gateways.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No gateways yet</td></tr>
                )}
                {gateways.map((gw) => (
                  <tr key={gw._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">{gw.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                        {gw.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {gw.providerProfile?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{gw.processingCurrency}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{gw.feeType}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">${gw.minDeposit}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.isVisible ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {gw.isVisible ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.visibleToCp ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {gw.visibleToCp ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.adminHidden ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"}`}>
                        {gw.adminHidden ? "Hidden" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEditGateway(gw)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Edit</button>
                        <button onClick={() => handleToggleHidden(gw._id)}
                          className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-semibold hover:bg-yellow-100">
                          {gw.adminHidden ? "Show" : "Hide"}
                        </button>
                        <button onClick={() => handleRotateToken(gw._id, gw.providerType || "")}
                          className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100">🔄</button>
                        <button onClick={() => handleDeleteGateway(gw._id)}
                          className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ════════════════════════════════
            TAB: PROVIDERS
        ════════════════════════════════ */}
        {tab === "providers" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Name","Type","Status","Credentials","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {providers.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No providers yet</td></tr>
                )}
                {providers.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold capitalize">
                        {p.providerType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.hasCredentials ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                        {p.hasCredentials ? "✓ Configured" : "⚠ Missing"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEditProvider(p)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Edit</button>
                        <button onClick={() => handleDeleteProvider(p._id)}
                          className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ════════════════════════════════
            TAB: PENDING DEPOSITS
        ════════════════════════════════ */}
        {tab === "pending" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["User","Gateway","Amount","Details","Date","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingDeposits.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No pending deposits</td></tr>
                )}
                {pendingDeposits.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-700">{d.user?.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                        {d.gateway?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">${d.amount}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {d.details?.binanceOrderId && (
                        <span>Order ID: <b>{d.details.binanceOrderId}</b> · Sent: {d.details.amountSent}</span>
                      )}
                      {!d.details?.binanceOrderId && <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleApprove(d._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600">
                          Approve
                        </button>
                        <button onClick={() => handleReject(d._id)}
                          className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ════════════════════════════════
          PROVIDER FORM MODAL
      ════════════════════════════════ */}
      {showProviderForm && (
        <Modal title={editingProvider ? "Edit Provider" : "Add Provider"}
          onClose={() => setShowProviderForm(false)}>

          <Input label="Provider Name" value={providerForm.name}
            onChange={(v) => setProviderForm({ ...providerForm, name: v })}
            placeholder="e.g. Main Flutterwave Account" />

          <Select label="Provider Type" value={providerForm.providerType}
            onChange={(v) => setProviderForm({ ...providerForm, providerType: v, credentials: {} })}
            options={PROVIDER_TYPES} />

          <Toggle label="Active" sublabel="Inactive providers cannot process payments"
            checked={providerForm.isActive}
            onChange={(v) => setProviderForm({ ...providerForm, isActive: v })} />

          {selectedProviderType && selectedProviderType.fields.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1">
                {editingProvider ? "API Credentials (leave blank to keep existing)" : "API Credentials"}
              </p>
              {selectedProviderType.fields.map((key) => (
                <Input key={key} label={FIELD_LABELS[key] || key} type="password"
                  value={providerForm.credentials[key] || ""}
                  onChange={(v) => setProviderForm({
                    ...providerForm,
                    credentials: { ...providerForm.credentials, [key]: v }
                  })}
                  placeholder={editingProvider ? "••••••••" : `Enter ${FIELD_LABELS[key]}`} />
              ))}
            </div>
          )}

          <button onClick={handleSaveProvider} disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
            {loading ? "Saving..." : editingProvider ? "Update Provider" : "Create Provider"}
          </button>
        </Modal>
      )}

      {/* ════════════════════════════════
          GATEWAY FORM MODAL
      ════════════════════════════════ */}
      {showGatewayForm && (
        <Modal title={editingGateway ? "Edit Gateway" : "Add Gateway"}
          onClose={() => setShowGatewayForm(false)}>

          <Input label="Gateway Name (user-facing)"
            value={gatewayForm.name}
            onChange={(v) => setGatewayForm({ ...gatewayForm, name: v })}
            placeholder="e.g. Pay with M-Pesa" />

          <Input label="Description (shown to end user)"
            value={gatewayForm.description}
            onChange={(v) => setGatewayForm({ ...gatewayForm, description: v })}
            placeholder="e.g. Pay using your M-Pesa mobile wallet" />

          <Select label="Payment Mode (determines user fields)"
            value={gatewayForm.paymentMode}
            onChange={(v) => setGatewayForm({ ...gatewayForm, paymentMode: v })}
            options={PAYMENT_MODES} />

          {/* Only show provider selector when NOT binance/manual */}
          {!["binance","manual"].includes(gatewayForm.paymentMode) && (
            <Select label="Provider (processes this gateway)"
              value={gatewayForm.providerProfile}
              onChange={(v) => setGatewayForm({ ...gatewayForm, providerProfile: v })}
              options={providerOptions} />
          )}

          {/* Binance ID field */}
          {gatewayForm.paymentMode === "binance" && (
            <Input label="Your Binance ID (shown to user)"
              value={gatewayForm.binanceId}
              onChange={(v) => setGatewayForm({ ...gatewayForm, binanceId: v })}
              placeholder="e.g. 123456789" />
          )}

          {/* Manual instructions */}
          {gatewayForm.paymentMode === "manual" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payment Instructions (shown to user)
              </label>
              <textarea value={gatewayForm.paymentInstructions} rows={3}
                onChange={(e) => setGatewayForm({ ...gatewayForm, paymentInstructions: e.target.value })}
                placeholder="e.g. Send payment to account 123456 at XYZ Bank..."
                className="w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 resize-none" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Processing Currency" value={gatewayForm.processingCurrency}
              onChange={(v) => setGatewayForm({ ...gatewayForm, processingCurrency: v.toUpperCase() })}
              placeholder="KES" />
            <Input label="Currency Symbol" value={gatewayForm.processingCurrencySymbol}
              onChange={(v) => setGatewayForm({ ...gatewayForm, processingCurrencySymbol: v })}
              placeholder="Ksh" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Exchange Rate (1 USD = ?)" type="number"
              value={gatewayForm.exchangeRate}
              onChange={(v) => setGatewayForm({ ...gatewayForm, exchangeRate: Number(v) })}
              placeholder="129" />
            <Input label="Min Deposit (USD)" type="number"
              value={gatewayForm.minDeposit}
              onChange={(v) => setGatewayForm({ ...gatewayForm, minDeposit: Number(v) })}
              placeholder="1" />
          </div>

          {/* Fee */}
          <Select label="Fee Type" value={gatewayForm.feeType}
            onChange={(v) => setGatewayForm({ ...gatewayForm, feeType: v })}
            options={[
              { value: "none",       label: "No Fee" },
              { value: "fixed",      label: "Fixed Fee" },
              { value: "percentage", label: "Percentage Fee" },
              { value: "both",       label: "Fixed + Percentage" },
            ]} />

          {(gatewayForm.feeType === "percentage" || gatewayForm.feeType === "both") && (
            <Input label="Fee %" type="number" value={gatewayForm.feePercentage}
              onChange={(v) => setGatewayForm({ ...gatewayForm, feePercentage: Number(v) })} placeholder="2.5" />
          )}
          {(gatewayForm.feeType === "fixed" || gatewayForm.feeType === "both") && (
            <Input label={`Fixed Fee (${gatewayForm.processingCurrency})`} type="number"
              value={gatewayForm.feeFixed}
              onChange={(v) => setGatewayForm({ ...gatewayForm, feeFixed: Number(v) })} placeholder="50" />
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin Note (shown to CP owners)
            </label>
            <textarea value={gatewayForm.adminNote} rows={2}
              onChange={(e) => setGatewayForm({ ...gatewayForm, adminNote: e.target.value })}
              placeholder="Internal note visible to child panel owners only"
              className="w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 resize-none" />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1">
            <Toggle label="Visible to end users"
              sublabel="End users can see and use this gateway"
              checked={gatewayForm.isVisible}
              onChange={(v) => setGatewayForm({ ...gatewayForm, isVisible: v })} />

            <Toggle label="Visible to child panel owners"
              sublabel="CP owners can use this gateway on their panels"
              checked={gatewayForm.visibleToCp}
              onChange={(v) => setGatewayForm({ ...gatewayForm, visibleToCp: v })} />
          </div>

          <button onClick={handleSaveGateway} disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
            {loading ? "Saving..." : editingGateway ? "Update Gateway" : "Create Gateway"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
