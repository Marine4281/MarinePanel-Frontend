// src/templates/neon/NeonAddFunds.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeadphones } from "react-icons/fi";
import NeonLayout from "./NeonLayout";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useSupport } from "../../context/SupportContext";
import { useCurrency } from "../../context/CurrencyContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

import GatewaySelector from "../../components/addfunds/GatewaySelector";
import PaymentInstructions from "../../components/addfunds/PaymentInstructions";
import PaymentFields from "../../components/addfunds/PaymentFields";
import QuoteBreakdown from "../../components/addfunds/QuoteBreakdown";

export default function NeonAddFunds() {
  const navigate = useNavigate();
  const { childPanel } = useChildPanel();
  const { userUnread, fmt } = useSupport();
  const { formatMoney } = useCurrency();

  const neon = childPanel?.themeColor || "#00ff88";

  const [gateways, setGateways]           = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selected, setSelected]           = useState(null);
  const [usdAmount, setUsdAmount]         = useState("");
  const [quote, setQuote]                 = useState(null);
  const [quoteLoading, setQuoteLoading]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [confirmed, setConfirmed]         = useState(false);
  const [userPayData, setUserPayData]     = useState({});

  useEffect(() => {
    API.get("/gateways")
      .then((r) => setGateways(r.data.gateways || []))
      .catch(() => toast.error("Failed to load payment methods"))
      .finally(() => setGatewaysLoading(false));
  }, []);

  useEffect(() => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      setQuote(null); setConfirmed(false); return;
    }
    const t = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const r = await API.get("/gateways/quote", { params: { gatewayId: selected._id, usdAmount } });
        setQuote(r.data); setConfirmed(false);
      } catch { setQuote(null); }
      finally { setQuoteLoading(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [selected, usdAmount]);

  const handleSelect = (gw) => {
    setSelected(gw); setQuote(null);
    setConfirmed(false); setUsdAmount("");
    setUserPayData({});
  };

  const setField = (key, val) => setUserPayData((p) => ({ ...p, [key]: val }));

  const validatePayData = () => {
    if (!selected) return false;
    const mode = selected.paymentMode;
    if (mode === "mpesa" || mode === "airtel") {
      if (!userPayData.phone) { toast.error("Phone number is required"); return false; }
    }
    if (mode === "momo") {
      if (!userPayData.phone) { toast.error("Phone number is required"); return false; }
      if (!userPayData.network) { toast.error("Select a network"); return false; }
    }
    if (mode === "card") {
      if (!userPayData.cardNumber || !userPayData.expiry || !userPayData.cvv || !userPayData.cardName) {
        toast.error("Fill in all card details"); return false;
      }
    }
    if (mode === "bank") {
      if (!userPayData.bankName || !userPayData.accountNumber) {
        toast.error("Fill in bank details"); return false;
      }
    }
    if (mode === "crypto") {
      if (!userPayData.walletAddress || !userPayData.network) {
        toast.error("Wallet address and network are required"); return false;
      }
    }
    if (mode === "manual") {
      if (["mpesa", "momo", "airtel", "other"].includes(selected.manualType)) {
        if (!userPayData.transactionCode && !userPayData.senderName) {
          toast.error("Enter the transaction code or the sender's name"); return false;
        }
      }
      if (selected.manualType === "bank" && !userPayData.senderName) {
        toast.error("Enter the sender's name"); return false;
      }
    }
    if (mode === "binance") {
      if (!userPayData.binanceOrderId) { toast.error("Binance Order ID is required"); return false; }
    }
    return true;
  };

  const handlePay = async () => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      return toast.error("Select a gateway and enter an amount");
    }
    if (selected.minDeposit && Number(usdAmount) < selected.minDeposit) {
      return toast.error(`Minimum deposit is ${formatMoney(selected.minDeposit)}`);
    }
    if (!validatePayData()) return;

    try {
      setSubmitting(true);
      const res = await API.post("/gateways/pay", {
        gatewayId: selected._id,
        usdAmount: Number(usdAmount),
        userPaymentData: userPayData,
      });
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        toast.success(res.data.message || "Payment initiated successfully");
        navigate("/wallet");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally { setSubmitting(false); }
  };

  const sym  = selected?.processingCurrencySymbol || "$";
  const curr = selected?.processingCurrency       || "USD";
  const mode = selected?.paymentMode              || "hosted";

  const canPay =
    !submitting && !!usdAmount && Number(usdAmount) > 0 && (curr === "USD" || confirmed);

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <button onClick={() => navigate("/wallet")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition"
          style={{ color: "#6c6c92" }}>
          <FiArrowLeft size={13} /> Back to Wallet
        </button>

        <div className="rounded-2xl p-6 space-y-6" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Wallet</p>
            <h1 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Add Funds</h1>
            <p className="text-sm mt-1" style={{ color: "#6c6c92" }}>Select a payment method and deposit amount.</p>
          </div>

          <GatewaySelector gateways={gateways} selected={selected} onSelect={handleSelect} loading={gatewaysLoading} />

          <PaymentInstructions selected={selected} mode={mode} />

          {selected && (
            <PaymentFields
              selected={selected} mode={mode}
              usdAmount={usdAmount} setUsdAmount={setUsdAmount}
              userPayData={userPayData} setField={setField}
            />
          )}

          {selected && (
            <>
              <QuoteBreakdown
                quote={quote} quoteLoading={quoteLoading} sym={sym} curr={curr}
                confirmed={confirmed} setConfirmed={setConfirmed}
              />
              <button onClick={handlePay} disabled={!canPay}
                className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-40 transition"
                style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}>
                {submitting ? "Processing…" : `Pay with ${selected.name} →`}
              </button>
            </>
          )}
        </div>

        {/* Support banner */}
        <div className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${neon}14`, color: neon }}>
              <FiHeadphones size={16} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: "#c4c4e0" }}>Having trouble with a payment?</p>
              <p className="text-xs mt-0.5" style={{ color: "#6c6c92" }}>Support is available to help instantly</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/support")}
            className="relative flex-shrink-0 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14" }}
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
    </NeonLayout>
  );
}
