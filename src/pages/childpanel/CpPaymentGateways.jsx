// src/pages/childpanel/CpPaymentGateways.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";

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

const MODE_ICONS = {
  hosted:"💳", mpesa:"📱", momo:"📲", airtel:"📡",
  card:"💳", bank:"🏦", crypto:"🔐", binance:"🟡", manual:"📋",
};

const EMPTY_FORM = {
  name: "", description: "", paymentMode: "hosted",
  providerProfile: "", binanceId: "", paymentInstructions: "",
  processingCurrency: "USD", processingCurrencySymbol: "$",
  exchangeRate: 1, feeType: "none", feePercentage: 0,
  feeFixed: 0, minDeposit: 0, cpNote: "", isVisible: true,
};

export default function CpPaymentGateways() {
  const [tab,              setTab]              = useState("own");
  const [ownGateways,      setOwnGateways]      = useState([]);
  const [platformGateways, setPlatformGateways] = useState([]);
  const [availProviders,   setAvailProviders]   = useState([]);
  const [showForm,         setShowForm]         = useState(false);
  const [editing,          setEditing]          = useState(null);
  const [form,             setForm]             = useState(EMPTY_FORM);
  const [loading,          setLoading]          = useState(false);
  const [connecting,       setConnecting]       = useState(null); // gatewayId being connected

  const fetchAll = async () => {
    try {
      const [gwRes, provRes] = await Promise.all([
        API.get("/cp/gateways"),
        API.get("/cp/available-providers"),
      ]);
      setOwnGateways(gwRes.data.ownGateways            || []);
      setPlatformGateways(gwRes.data.platformGateways  || []);
      setAvailProviders(provRes.data.providers         || []);
    } catch { toast.error("Failed to load gateways"); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Own gateway handlers ─────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name) return toast.error("Gateway name is required");
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
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setLoading(false); }
  };

  const handleEdit = (gw) => {
    setForm({
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
      cpNote:                   gw.cpNote                   || "",
      isVisible:                gw.isVisible,
    });
    setEditing(gw._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this gateway?")) return;
    try {
      await API.delete(`/cp/gateways/${id}`);
      toast.success("Deleted");
      fetchAll();
    } catch { toast.error("Failed to delete"); }
  };

  const handleRotateToken = async (gw) => {
    try {
      const res = await API.post(`/cp/gateways/${gw._id}/rotate-token`);
      const url = `${import.meta.env.VITE_API_URL}/api/webhooks/${gw.paymentMode}/${res.data.webhookToken}`;
      toast.success("Token rotated");
      navigator.clipboard.writeText(url);
      toast("Webhook URL copied to clipboard", { icon: "📋" });
      fetchAll();
    } catch { toast.error("Failed to rotate token"); }
  };

  // ── Connect platform gateway ─────────────────────────────
  const handleConnect = async (platformGatewayId) => {
    try {
      setConnecting(platformGatewayId);
      await API.post("/cp/gateways/connect-platform", { platformGatewayId });
      toast.success("Gateway connected! Your users can now use it.");
      fetchAll();
      setTab("own");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect");
    } finally { setConnecting(null); }
  };

  const getWebhookUrl = (gw) =>
    `${import.meta.env.VITE_API_URL}/api/webhooks/${gw.paymentMode}/${gw.webhookToken}`;

  // Check if a platform gateway is already connected
  const isConnected = (platformGwId) =>
    ownGateways.some((g) => g.platformGatewayRef === platformGwId);

  return (
    <ChildPanelLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">Payment Gateways</h1>
            <p className="text-xs mt-0.5 text-gray-500">
              Manage how your users deposit funds.
            </p>
          </div>
          {tab === "own" && (
            <button
              onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition"
            >
              + Add Gateway
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit bg-white border border-gray-200 shadow-sm">
          {[
            { key: "own",      label: "My Gateways",      count: ownGateways.length },
            { key: "platform", label: "Platform Gateways", count: platformGateways.length },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                tab === t.key ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-900"
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════
            TAB: MY GATEWAYS
        ════════════════════════════ */}
        {tab === "own" && (
          <div className="space-y-3">
            {ownGateways.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
                <p className="text-sm mb-1 text-gray-500">
                  No gateways yet
                </p>
                <p className="text-xs text-gray-400">
                  Add your own or connect a platform gateway from the Platform Gateways tab
                </p>
              </div>
            )}

            {ownGateways.map((gw) => (
              <div key={gw._id} className="rounded-2xl p-5 space-y-3 bg-white border border-gray-200 shadow-sm">

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{MODE_ICONS[gw.paymentMode] || "💰"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{gw.name}</p>
                        {gw.isPlatformConnected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                            Platform
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          gw.isVisible
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {gw.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 text-gray-500">
                        {gw.paymentMode} · {gw.processingCurrency} · Rate: {gw.exchangeRate}
                        {gw.feeType !== "none" && ` · Fee: ${gw.feeType}`}
                      </p>
                      {gw.adminNote && (
                        <p className="text-xs mt-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                          ℹ️ {gw.adminNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(gw)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100">
                      Edit
                    </button>
                    <button onClick={() => handleRotateToken(gw)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100">
                      🔄 Webhook
                    </button>
                    <button onClick={() => handleDelete(gw._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100">
                      Del
                    </button>
                  </div>
                </div>

                {/* Webhook URL — only for non-platform-connected gateways */}
                {gw.webhookToken && !gw.isPlatformConnected && (
                  <div>
                    <p className="text-xs mb-1 text-gray-400">
                      Webhook URL — paste in your provider dashboard:
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                      <code className="text-xs flex-1 truncate text-green-600">
                        {getWebhookUrl(gw)}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(getWebhookUrl(gw)); toast.success("Copied!"); }}
                        className="text-xs px-2 py-1 rounded-md flex-shrink-0 bg-gray-200 text-gray-600 hover:bg-gray-300">
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════
            TAB: PLATFORM GATEWAYS
        ════════════════════════════ */}
        {tab === "platform" && (
          <div className="space-y-3">
            {platformGateways.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">
                  No platform gateways available yet
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Contact your admin to enable platform gateways for your panel
                </p>
              </div>
            )}

            {platformGateways.map((gw) => {
              const connected = isConnected(gw._id);
              return (
                <div key={gw._id} className={`rounded-2xl p-5 border ${
                  connected ? "bg-green-50 border-green-200" : "bg-white border-gray-200 shadow-sm"
                }`}>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{MODE_ICONS[gw.paymentMode] || "💰"}</span>
                      <div>
                        <p className="font-bold text-gray-900">{gw.name}</p>
                        <p className="text-xs mt-0.5 text-gray-500">
                          {gw.paymentMode} · {gw.processingCurrency}
                          {gw.feeType !== "none" && ` · Fee: ${gw.feeType}`}
                        </p>
                        {gw.description && (
                          <p className="text-xs mt-1 text-gray-400">
                            {gw.description}
                          </p>
                        )}
                        {gw.adminNote && (
                          <p className="text-xs mt-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                            ℹ️ {gw.adminNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {connected ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 bg-green-100 text-green-700">
                        ✓ Connected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnect(gw._id)}
                        disabled={connecting === gw._id}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 disabled:opacity-50 transition hover:bg-orange-600 bg-orange-500">
                        {connecting === gw._id ? "Connecting..." : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <p className="text-xs text-center pt-2 text-gray-400">
              Connecting a platform gateway lets your users pay through it. Payments go through the platform's provider — no setup needed on your end.
            </p>
          </div>
        )}

        {/* ════════════════════════════
            ADD/EDIT GATEWAY MODAL
        ════════════════════════════ */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4 bg-white border border-gray-200 shadow-xl">

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900">
                  {editing ? "Edit Gateway" : "Add Gateway"}
                </h2>
                <button onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
              </div>

              <F label="Gateway Name (shown to users)">
                <I value={form.name} onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Pay with M-Pesa" />
              </F>

              <F label="Description (optional)">
                <I value={form.description} onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="e.g. Pay using your M-Pesa wallet" />
              </F>

              <F label="Payment Mode">
                <select value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
                  {PAYMENT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </F>

              {/* Provider — only admin-allowed providers, only for non-binance/manual */}
              {!["binance", "manual"].includes(form.paymentMode) && (
                <F label="Provider">
                  {availProviders.length === 0 ? (
                    <p className="text-xs px-3 py-2 rounded-xl bg-yellow-50 text-yellow-700">
                      ⚠ No providers available. Ask your admin to enable providers for CP owners.
                    </p>
                  ) : (
                    <select value={form.providerProfile}
                      onChange={(e) => setForm({ ...form, providerProfile: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
                      <option value="">Select provider</option>
                      {availProviders.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.providerType})
                        </option>
                      ))}
                    </select>
                  )}
                </F>
              )}

              {/* Binance ID */}
              {form.paymentMode === "binance" && (
                <F label="Your Binance ID (shown to user)">
                  <I value={form.binanceId} onChange={(v) => setForm({ ...form, binanceId: v })}
                    placeholder="e.g. 123456789" />
                </F>
              )}

              {/* Manual instructions */}
              {form.paymentMode === "manual" && (
                <F label="Payment Instructions (shown to user)">
                  <textarea value={form.paymentInstructions} rows={3}
                    onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
                    placeholder="e.g. Send payment to account 123456 at XYZ Bank..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-white border border-gray-300 text-gray-900 focus:border-orange-400" />
                </F>
              )}

              <div className="grid grid-cols-2 gap-3">
                <F label="Currency">
                  <I value={form.processingCurrency}
                    onChange={(v) => setForm({ ...form, processingCurrency: v.toUpperCase() })}
                    placeholder="KES" />
                </F>
                <F label="Symbol">
                  <I value={form.processingCurrencySymbol}
                    onChange={(v) => setForm({ ...form, processingCurrencySymbol: v })}
                    placeholder="Ksh" />
                </F>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <F label="Exchange Rate (1 USD = ?)">
                  <I type="number" value={form.exchangeRate}
                    onChange={(v) => setForm({ ...form, exchangeRate: Number(v) })} placeholder="129" />
                </F>
                <F label="Min Deposit (USD)">
                  <I type="number" value={form.minDeposit}
                    onChange={(v) => setForm({ ...form, minDeposit: Number(v) })} placeholder="1" />
                </F>
              </div>

              <F label="Fee Type">
                <select value={form.feeType}
                  onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
                  <option value="none">No Fee</option>
                  <option value="fixed">Fixed Fee</option>
                  <option value="percentage">Percentage</option>
                  <option value="both">Fixed + Percentage</option>
                </select>
              </F>

              {(form.feeType === "percentage" || form.feeType === "both") && (
                <F label="Fee %">
                  <I type="number" value={form.feePercentage}
                    onChange={(v) => setForm({ ...form, feePercentage: Number(v) })} placeholder="2.5" />
                </F>
              )}
              {(form.feeType === "fixed" || form.feeType === "both") && (
                <F label={`Fixed Fee (${form.processingCurrency})`}>
                  <I type="number" value={form.feeFixed}
                    onChange={(v) => setForm({ ...form, feeFixed: Number(v) })} placeholder="50" />
                </F>
              )}

              <F label="Note for your users (optional)">
                <textarea value={form.cpNote} rows={2}
                  onChange={(e) => setForm({ ...form, cpNote: e.target.value })}
                  placeholder="e.g. Use your registered M-Pesa number only"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-white border border-gray-300 text-gray-900 focus:border-orange-400" />
              </F>

              {/* Visible toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Visible to users</p>
                  <p className="text-xs mt-0.5 text-gray-500">
                    Users can see and use this gateway
                  </p>
                </div>
                <button onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.isVisible ? "bg-orange-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isVisible ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition hover:bg-orange-600 bg-orange-500">
                {loading ? "Saving..." : editing ? "Update Gateway" : "Create Gateway"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ChildPanelLayout>
  );
}

function F({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function I({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400" />
  );
        }
