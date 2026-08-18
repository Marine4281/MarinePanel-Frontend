// src/templates/aurora/AuroraWithdraw.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeadphones } from "react-icons/fi";
import AuroraLayout from "./AuroraLayout";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useSupport } from "../../context/SupportContext";
import { useCurrency } from "../../context/CurrencyContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

import GatewaySelector from "../../components/addfunds/GatewaySelector";
import PayoutFields from "../../components/withdraw/PayoutFields";
import WithdrawQuoteBreakdown from "../../components/withdraw/WithdrawQuoteBreakdown";

export default function AuroraWithdraw() {
  const navigate = useNavigate();
  const { childPanel } = useChildPanel();
  const { userUnread, fmt } = useSupport();
  const { formatMoney } = useCurrency();

  const brand = { color: childPanel?.themeColor || "#a78bfa" };

  const [gateways, setGateways]             = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selected, setSelected]             = useState(null);
  const [usdAmount, setUsdAmount]           = useState("");
  const [quote, setQuote]                   = useState(null);
  const [quoteLoading, setQuoteLoading]     = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [confirmed, setConfirmed]           = useState(false);
  const [userPayoutData, setUserPayoutData] = useState({});

  useEffect(() => {
    API.get("/withdraw-gateways")
      .then((r) => setGateways(r.data.gateways || []))
      .catch(() => toast.error("Failed to load withdrawal methods"))
      .finally(() => setGatewaysLoading(false));
  }, []);

  useEffect(() => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      setQuote(null); setConfirmed(false); return;
    }
    const t = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const r = await API.get("/withdraw-gateways/quote", { params: { gatewayId: selected._id, usdAmount } });
        setQuote(r.data); setConfirmed(false);
      } catch { setQuote(null); }
      finally { setQuoteLoading(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [selected, usdAmount]);

  const handleSelect = (gw) => {
    setSelected(gw); setQuote(null);
    setConfirmed(false); setUsdAmount("");
    setUserPayoutData({});
  };

  const setField = (key, val) => setUserPayoutData((p) => ({ ...p, [key]: val }));

  const getPayoutChannel = (gw) => {
    if (gw.paymentMode === "binance") return "binance";
    if (gw.paymentMode === "manual") return gw.manualType || "other";
    return gw.providerType;
  };

  const validatePayoutData = () => {
    if (!selected) return false;
    const channel = getPayoutChannel(selected);

    if (["mpesa", "airtel", "momo"].includes(channel) && !userPayoutData.phone) {
      toast.error("Phone number is required"); return false;
    }
    if (channel === "momo" && !userPayoutData.network) {
      toast.error("Select a network"); return false;
    }
    if (["bank", "flutterwave"].includes(channel)) {
      if (!userPayoutData.bankCode || !userPayoutData.accountNumber) {
        toast.error("Bank/mobile money code and account number are required"); return false;
      }
    }
    if (channel === "binance") {
      if (!userPayoutData.binanceId) { toast.error("Binance ID is required"); return false; }
      if (!userPayoutData.fullName) { toast.error("Full name is required"); return false; }
    }
    if (channel === "crypto" && !userPayoutData.walletAddress) {
      toast.error("Wallet address is required"); return false;
    }
    if (channel === "other" && !userPayoutData.notes) {
      toast.error("Enter your payout details"); return false;
    }
    return true;
  };

  const handleWithdraw = async () => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      return toast.error("Select a method and enter an amount");
    }
    if (selected.minWithdraw && Number(usdAmount) < selected.minWithdraw) {
      return toast.error(`Minimum withdrawal is ${formatMoney(selected.minWithdraw)}`);
    }
    if (!validatePayoutData()) return;

    try {
      setSubmitting(true);
      const res = await API.post("/withdraw-gateways/pay", {
        gatewayId: selected._id,
        usdAmount: Number(usdAmount),
        userPayoutData,
      });
      toast.success(res.data.message || "Withdrawal requested");
      navigate("/wallet");
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally { setSubmitting(false); }
  };

  const sym  = selected?.processingCurrencySymbol || "$";
  const curr = selected?.processingCurrency       || "USD";

  const canWithdraw =
    !submitting && !!usdAmount && Number(usdAmount) > 0 && (curr === "USD" || confirmed);

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-5 pt-2">
        <button onClick={() => navigate("/wallet")}
          className="flex items-center gap-2 text-xs font-semibold transition"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <FiArrowLeft size={13} /> Back to Wallet
        </button>

        <div
          className="rounded-2xl p-5 space-y-5"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1 className="text-xl font-black text-white">Withdraw Funds</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Select a withdrawal method and amount.</p>
          </div>

          <GatewaySelector gateways={gateways} selected={selected} onSelect={handleSelect} loading={gatewaysLoading} />

          {selected && (selected.adminNote || selected.cpNote) && (
            <div className="space-y-2">
              {selected.adminNote && (
                <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", color: "#93c5fd" }}>
                  ℹ️ {selected.adminNote}
                </div>
              )}
              {selected.cpNote && (
                <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fde68a" }}>
                  📌 {selected.cpNote}
                </div>
              )}
            </div>
          )}

          {selected && (
            <PayoutFields
              selected={selected}
              usdAmount={usdAmount} setUsdAmount={setUsdAmount}
              userPayoutData={userPayoutData} setField={setField}
            />
          )}

          {selected && (
            <>
              <WithdrawQuoteBreakdown
                quote={quote} quoteLoading={quoteLoading} sym={sym} curr={curr}
                confirmed={confirmed} setConfirmed={setConfirmed}
              />
              <button onClick={handleWithdraw} disabled={!canWithdraw}
                className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 transition"
                style={{
                  background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`,
                  color: "#fff",
                  boxShadow: `0 4px 24px ${brand.color}40`,
                }}>
                {submitting ? "Processing…" : `Withdraw via ${selected.name} →`}
              </button>
            </>
          )}
        </div>

        {/* Support banner */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: `${brand.color}12`, border: `1px solid ${brand.color}25` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brand.color}20`, color: brand.color }}>
              <FiHeadphones size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Having trouble with a withdrawal?</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Support can help instantly</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/support")}
            className="relative flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`, color: "#fff" }}
          >
            Get Help
            {userUnread > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                {fmt(userUnread)}
              </span>
            )}
          </button>
        </div>
      </div>
    </AuroraLayout>
  );
}
