import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import GatewaysTab from "../components/adminPayments/GatewaysTab";
import ProvidersTab from "../components/adminPayments/ProvidersTab";
import PendingDepositsTab from "../components/adminPayments/PendingDepositsTab";
import ProviderFormModal from "../components/adminPayments/ProviderFormModal";
import GatewayFormModal from "../components/adminPayments/GatewayFormModal";
import { EMPTY_PROVIDER, EMPTY_GATEWAY } from "../components/adminPayments/constants";

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
    setProviderForm({
      name:         p.name,
      providerType: p.providerType,
      credentials:  {},
      isActive:     p.isActive,
      visibleToCp:  p.visibleToCp || false,
    });
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
      binanceName:              gw.binanceName              || "",
      qrImageUrl:               gw.qrImageUrl               || "",
      manualType:               gw.manualType               || "",
      manualConfig:             gw.manualConfig             || { number:"",holderName:"",bankName:"",accountNumber:"",accountName:"" },
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

  const providerOptions = providers
    .filter((p) => p.isActive)
    .map((p) => ({ value: p._id, label: `${p.name} (${p.providerType})` }));

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto space-y-6">

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

        <div className="flex gap-1 bg-white rounded-2xl shadow p-1 w-fit">
          {[
            { key: "gateways",  label: "Gateways",        count: gateways.length },
            { key: "providers", label: "Providers",        count: providers.length },
            { key: "pending",   label: "Pending Deposits", count: pendingDeposits.length },
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

        {tab === "gateways" && (
          <GatewaysTab
            gateways={gateways}
            onEdit={handleEditGateway}
            onToggleHidden={handleToggleHidden}
            onRotateToken={handleRotateToken}
            onDelete={handleDeleteGateway}
          />
        )}

        {tab === "providers" && (
          <ProvidersTab
            providers={providers}
            onEdit={handleEditProvider}
            onDelete={handleDeleteProvider}
          />
        )}

        {tab === "pending" && (
          <PendingDepositsTab
            deposits={pendingDeposits}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </main>

      {showProviderForm && (
        <ProviderFormModal
          providerForm={providerForm}
          setProviderForm={setProviderForm}
          editingProvider={editingProvider}
          loading={loading}
          onSave={handleSaveProvider}
          onClose={() => setShowProviderForm(false)}
        />
      )}

      {showGatewayForm && (
        <GatewayFormModal
          gatewayForm={gatewayForm}
          setGatewayForm={setGatewayForm}
          editingGateway={editingGateway}
          loading={loading}
          providerOptions={providerOptions}
          onSave={handleSaveGateway}
          onClose={() => setShowGatewayForm(false)}
        />
      )}
    </div>
  );
}
