// src/templates/tide/TideWithdraw.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeadphones } from "react-icons/fi";
import TideLayout from "./TideLayout";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useSupport } from "../../context/SupportContext";
import { useCurrency } from "../../context/CurrencyContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

import GatewaySelector from "../../components/addfunds/GatewaySelector";
import PayoutFields from "../../components/withdraw/PayoutFields";
import WithdrawQuoteBreakdown from "../../components/withdraw/WithdrawQuoteBreakdown";

export default function TideWithdraw() {
  const navigate = useNavigate();
  const { childPanel } = useChildPanel();
  const { userUnread, fmt } = useSupport();
  const { formatMoney } = useCurrency();

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

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
    <TideLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate("/wallet")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">
          <FiArrowLeft size={14} /> Back to Wallet
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <h1 className="text-xl font-black text-gray-900">Withdraw Funds</h1>
            <p className="text-sm text-gray-400 mt-1">Select a withdrawal method and amount.</p>
          </div>

          <GatewaySelector gateways={gateways} selected={selected} onSelect={handleSelect} loading={gatewaysLoading} />

          {selected && (selected.adminNote || selected.cpNote) && (
            <div className="space-y-2">
              {selected.adminNote && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">ℹ️ {selected.adminNote}</div>
              )}
              {selected.cpNote && (
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">📌 {selected.cpNote}</div>
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
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}>
                {submitting ? "Processing…" : `Withdraw via ${selected.name} →`}
              </button>
            </>
          )}
        </div>

        {/* Support banner */}
        <div className="relative overflow-hidden rounded-2xl shadow-sm">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)` }} />
          <div className="relative flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <FiHeadphones size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">Having trouble with a withdrawal?</p>
                <p className="text-white/70 text-xs mt-0.5">Our support team is available to help you instantly</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/support")}
              className="relative shrink-0 bg-white font-black text-sm px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap"
              style={{ color: brand.color }}
            >
              <FiHeadphones size={14} /> Get Help
              {userUnread > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                  {fmt(userUnread)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </TideLayout>
  );
}
