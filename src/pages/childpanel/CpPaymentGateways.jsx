import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import OwnGatewaysTab from "../../components/cpPayments/OwnGatewaysTab";
import PlatformGatewaysTab from "../../components/cpPayments/PlatformGatewaysTab";
import PendingWithdrawalsTab from "../../components/cpPayments/PendingWithdrawalsTab";
import PendingDepositsTab from "../../components/cpPayments/PendingDepositsTab";
import GatewayFormModal from "../../components/cpPayments/GatewayFormModal";
import { EMPTY_FORM } from "../../components/cpPayments/constants";

export default function CpPaymentGateways() {
  const [tab,                setTab]                = useState("own");
  const [ownGateways,        setOwnGateways]        = useState([]);
  const [platformGateways,   setPlatformGateways]   = useState([]);
  const [availProviders,     setAvailProviders]     = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [pendingDeposits,    setPendingDeposits]    = useState([]);
  const [showForm,           setShowForm]           = useState(false);
  const [editing,            setEditing]            = useState(null);
  const [form,               setForm]               = useState(EMPTY_FORM);
  const [loading,            setLoading]            = useState(false);
  const [connecting,         setConnecting]         = useState(null);
  const [disconnecting,      setDisconnecting]      = useState(null);

  const fetchAll = async () => {
    const [gwRes, provRes, wRes, dRes] = await Promise.allSettled([
      API.get("/cp/gateways"),
      API.get("/cp/available-providers"),
      API.get("/cp/withdrawals/pending"),
      API.get("/cp/deposits/pending"),
    ]);

    if (gwRes.status === "fulfilled") {
      setOwnGateways(gwRes.value.data.ownGateways           || []);
      setPlatformGateways(gwRes.value.data.platformGateways || []);
    } else {
      toast.error("Failed to load gateways");
    }

    if (provRes.status === "fulfilled") {
      setAvailProviders(provRes.value.data.providers || []);
    }

    if (wRes.status === "fulfilled") {
      setPendingWithdrawals(wRes.value.data.withdrawals || []);
    } else {
      toast.error("Failed to load pending withdrawals");
    }

    if (dRes.status === "fulfilled") {
      setPendingDeposits(dRes.value.data.deposits || []);
    } else {
      toast.error("Failed to load pending deposits");
    }
  };

  useEffect(() => { fetchAll(); }, []);

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
      supportsWithdraw:         gw.supportsWithdraw         || false,
      minWithdraw:              gw.minWithdraw              || 0,
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

  const handleDisconnect = async (platformGatewayId) => {
    if (!confirm("Disconnect this gateway? Your users will no longer be able to use it.")) return;
    try {
      setDisconnecting(platformGatewayId);
      await API.post("/cp/gateways/disconnect-platform", { platformGatewayId });
      toast.success("Gateway disconnected");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disconnect");
    } finally { setDisconnecting(null); }
  };

  const handleApproveWithdrawal = async (id) => {
    try {
      await API.post(`/cp/withdrawals/${id}/approve`);
      toast.success("Withdrawal approved");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve withdrawal");
    }
  };

  const handleRejectWithdrawal = async (id) => {
    if (!confirm("Reject this withdrawal? Funds will be released back to the user.")) return;
    try {
      await API.post(`/cp/withdrawals/${id}/reject`);
      toast.success("Withdrawal rejected");
      fetchAll();
    } catch { toast.error("Failed to reject withdrawal"); }
  };

  const handleApproveDeposit = async (id) => {
    try {
      await API.post(`/cp/deposits/${id}/approve`);
      toast.success("Deposit approved");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve deposit");
    }
  };

  const handleRejectDeposit = async (id) => {
    if (!confirm("Reject this deposit?")) return;
    try {
      await API.post(`/cp/deposits/${id}/reject`);
      toast.success("Deposit rejected");
      fetchAll();
    } catch { toast.error("Failed to reject deposit"); }
  };

  const getWebhookUrl = (gw) =>
    `${import.meta.env.VITE_API_URL}/api/webhooks/${gw.paymentMode}/${gw.webhookToken}`;

  const isConnected = (platformGwId) =>
    ownGateways.some((g) => g.platformGatewayRef === platformGwId);

  return (
    <ChildPanelLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">Payment Gateways</h1>
            <p className="text-xs mt-0.5 text-gray-500">Manage how your users deposit and withdraw funds.</p>
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

        <div className="flex gap-1 p-1 rounded-2xl w-fit bg-white border border-gray-200 shadow-sm flex-wrap">
          {[
            { key: "own",                label: "My Gateways",         count: ownGateways.length },
            { key: "platform",           label: "Platform Gateways",   count: platformGateways.length },
            { key: "pendingDeposits",    label: "Pending Deposits",    count: pendingDeposits.length },
            { key: "pendingWithdrawals", label: "Pending Withdrawals", count: pendingWithdrawals.length },
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

        {tab === "own" && (
          <OwnGatewaysTab
            ownGateways={ownGateways}
            onEdit={handleEdit}
            onRotateToken={handleRotateToken}
            onDelete={handleDelete}
            getWebhookUrl={getWebhookUrl}
          />
        )}

        {tab === "platform" && (
          <PlatformGatewaysTab
            platformGateways={platformGateways}
            isConnected={isConnected}
            connecting={connecting}
            disconnecting={disconnecting}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        )}

        {tab === "pendingDeposits" && (
          <PendingDepositsTab
            deposits={pendingDeposits}
            onApprove={handleApproveDeposit}
            onReject={handleRejectDeposit}
          />
        )}

        {tab === "pendingWithdrawals" && (
          <PendingWithdrawalsTab
            withdrawals={pendingWithdrawals}
            onApprove={handleApproveWithdrawal}
            onReject={handleRejectWithdrawal}
          />
        )}

        {showForm && (
          <GatewayFormModal
            form={form}
            setForm={setForm}
            editing={editing}
            loading={loading}
            availProviders={availProviders}
            onSave={handleSubmit}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </ChildPanelLayout>
  );
    }
