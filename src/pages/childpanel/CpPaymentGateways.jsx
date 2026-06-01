// src/pages/childpanel/CpPaymentGateways.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const BRAND = "#f97316";

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
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#060a12" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Payment Gateways</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Manage how your users deposit funds.
          </p>
        </div>
        {tab === "own" && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: BRAND }}>
            + Add Gateway
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        {[
          { key: "own",      label: "My Gateways",      count: ownGateways.length },
          { key: "platform", label: "Platform Gateways", count: platformGateways.length },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            style={{
              background: tab === t.key ? BRAND : "transparent",
              color:      tab === t.key ? "#fff" : "rgba(255,255,255,0.5)",
            }}>
            {t.label}
            {t.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: tab === t.key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                  color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)",
                }}>
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
            <div className="text-center py-12 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
              <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                No gateways yet
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Add your own or connect a platform gateway from the Platform Gateways tab
              </p>
            </div>
          )}

          {ownGateways.map((gw) => (
            <div key={gw._id} className="rounded-2xl p-5 space-y-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{MODE_ICONS[gw.paymentMode] || "💰"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{gw.name}</p>
                      {gw.isPlatformConnected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                          Platform
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        gw.isVisible
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {gw.isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {gw.paymentMode} · {gw.processingCurrency} · Rate: {gw.exchangeRate}
                      {gw.feeType !== "none" && ` · Fee: ${gw.feeType}`}
                    </p>
                    {gw.adminNote && (
                      <p className="text-xs mt-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>
                        ℹ️ {gw.adminNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(gw)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                    Edit
                  </button>
                  <button onClick={() => handleRotateToken(gw)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                    🔄 Webhook
                  </button>
                  <button onClick={() => handleDelete(gw._id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                    Del
                  </button>
                </div>
              </div>

              {/* Webhook URL — only for non-platform-connected gateways */}
              {gw.webhookToken && !gw.isPlatformConnected && (
                <div>
                  <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Webhook URL — paste in your provider dashboard:
                  </p>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <code className="text-xs flex-1 truncate" style={{ color: "#4ade80" }}>
                      {getWebhookUrl(gw)}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(getWebhookUrl(gw)); toast.success("Copied!"); }}
                      className="text-xs px-2 py-1 rounded-md flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
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
            <div className="text-center py-12 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                No platform gateways available yet
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                Contact your admin to enable platform gateways for your panel
              </p>
            </div>
          )}

          {platformGateways.map((gw) => {
            const connected = isConnected(gw._id);
            return (
              <div key={gw._id} className="rounded-2xl p-5"
                style={{
                  background:  connected ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.04)",
                  border:      `1px solid ${connected ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                }}>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{MODE_ICONS[gw.paymentMode] || "💰"}</span>
                    <div>
                      <p className="font-bold text-white">{gw.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {gw.paymentMode} · {gw.processingCurrency}
                        {gw.feeType !== "none" && ` · Fee: ${gw.feeType}`}
                      </p>
                      {gw.description && (
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {gw.description}
                        </p>
                      )}
                      {gw.adminNote && (
                        <p className="text-xs mt-1.5 px-2.5 py-1.5 rounded-lg"
                          style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>
                          ℹ️ {gw.adminNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {connected ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                      ✓ Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(gw._id)}
                      disabled={connecting === gw._id}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 disabled:opacity-50 transition hover:opacity-90"
                      style={{ background: BRAND }}>
                      {connecting === gw._id ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <p className="text-xs text-center pt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
            Connecting a platform gateway lets your users pay through it. Payments go through the platform's provider — no setup needed on your end.
          </p>
        </div>
      )}

      {/* ════════════════════════════
          ADD/EDIT GATEWAY MODAL
      ════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4"
            style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                {editing ? "Edit Gateway" : "Add Gateway"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-white text-xl font-bold">✕</button>
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
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {PAYMENT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </F>

            {/* Provider — only admin-allowed providers, only for non-binance/manual */}
            {!["binance", "manual"].includes(form.paymentMode) && (
              <F label="Provider">
                {availProviders.length === 0 ? (
                  <p className="text-xs px-3 py-2 rounded-xl"
                    style={{ background: "rgba(251,191,36,0.1)", color: "#fcd34d" }}>
                    ⚠ No providers available. Ask your admin to enable providers for CP owners.
                  </p>
                ) : (
                  <select value={form.providerProfile}
                    onChange={(e) => setForm({ ...form, providerProfile: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
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
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
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
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
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
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
            </F>

            {/* Visible toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-sm font-semibold text-white">Visible to users</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Users can see and use this gateway
                </p>
              </div>
              <button onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.isVisible ? "bg-orange-500" : "bg-gray-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isVisible ? "left-5" : "left-0.5"}`} />
              </button>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition hover:opacity-90"
              style={{ background: BRAND }}>
              {loading ? "Saving..." : editing ? "Update Gateway" : "Create Gateway"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
      {children}
    </div>
  );
}

function I({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
  );
      }
