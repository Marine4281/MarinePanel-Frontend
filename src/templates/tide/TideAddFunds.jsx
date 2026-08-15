// src/templates/tide/TideAddFunds.jsx
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
import PaymentInstructions from "../../components/addfunds/PaymentInstructions";
import PaymentFields from "../../components/addfunds/PaymentFields";
import QuoteBreakdown from "../../components/addfunds/QuoteBreakdown";

export default function TideAddFunds() {
  const navigate = useNavigate();
  const { childPanel } = useChildPanel();
  const { userUnread, fmt } = useSupport();
  const { formatMoney } = useCurrency();

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

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
    <TideLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate("/wallet")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">
          <FiArrowLeft size={14} /> Back to Wallet
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <h1 className="text-xl font-black text-gray-900">Add Funds</h1>
            <p className="text-sm text-gray-400 mt-1">Select a payment method and deposit amount.</p>
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
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}>
                {submitting ? "Processing…" : `Pay with ${selected.name} →`}
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
                <p className="text-white font-black text-sm leading-tight">Having trouble with a payment?</p>
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
