import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useSupport } from "../context/SupportContext";
import { useCurrency } from "../context/CurrencyContext";

import GatewaySelector from "../components/addfunds/GatewaySelector";
import PaymentInstructions from "../components/addfunds/PaymentInstructions";
import PaymentFields from "../components/addfunds/PaymentFields";
import QuoteBreakdown from "../components/addfunds/QuoteBreakdown";
import SupportBanner from "../components/addfunds/SupportBanner";

const AddFunds = () => {
  const navigate = useNavigate();
  const { userUnread, fmt } = useSupport();
  const { formatMoney } = useCurrency();

  const [gateways,        setGateways]        = useState([]);
  const [gatewaysLoading, setGatewaysLoading]  = useState(true);
  const [selected,        setSelected]         = useState(null);
  const [usdAmount,       setUsdAmount]        = useState("");
  const [quote,           setQuote]            = useState(null);
  const [quoteLoading,    setQuoteLoading]     = useState(false);
  const [submitting,      setSubmitting]       = useState(false);
  const [confirmed,       setConfirmed]        = useState(false);
  const [userPayData,     setUserPayData]      = useState({});

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
        const r = await API.get("/gateways/quote", {
          params: { gatewayId: selected._id, usdAmount },
        });
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

  const setField = (key, val) =>
    setUserPayData((p) => ({ ...p, [key]: val }));

  const validatePayData = () => {
    if (!selected) return false;
    const mode = selected.paymentMode;
    if (mode === "mpesa" || mode === "airtel") {
      if (!userPayData.phone) { toast.error("Phone number is required"); return false; }
    }
    if (mode === "momo") {
      if (!userPayData.phone)   { toast.error("Phone number is required"); return false; }
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
      if (!userPayData.binanceOrderId || !userPayData.senderName) {
        toast.error("Binance Order ID and your name are required"); return false;
      }
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
        gatewayId:       selected._id,
        usdAmount:       Number(usdAmount),
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
    !submitting &&
    !!usdAmount &&
    Number(usdAmount) > 0 &&
    (curr === "USD" || confirmed);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col pb-24">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto mt-8 px-4 space-y-6">

        <button onClick={() => navigate("/wallet")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
          ← Back to Wallet
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Add Funds</h1>
            <p className="text-sm text-gray-400 mt-1">Select a payment method and deposit amount.</p>
          </div>

          <GatewaySelector gateways={gateways} selected={selected} onSelect={handleSelect} loading={gatewaysLoading} />

          <PaymentInstructions selected={selected} mode={mode} />

          {selected && (
            <PaymentFields
              selected={selected}
              mode={mode}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              userPayData={userPayData}
              setField={setField}
            />
          )}

          {selected && (
            <>
              <QuoteBreakdown
                quote={quote}
                quoteLoading={quoteLoading}
                sym={sym}
                curr={curr}
                confirmed={confirmed}
                setConfirmed={setConfirmed}
              />

              <button onClick={handlePay} disabled={!canPay}
                className="w-full py-3 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                {submitting ? "Processing..." : `Pay with ${selected.name} →`}
              </button>
            </>
          )}
        </div>

        <SupportBanner userUnread={userUnread} fmt={fmt} onGetHelp={() => navigate("/support")} />

      </main>

      <Footer />
    </div>
  );
};

export default AddFunds;
