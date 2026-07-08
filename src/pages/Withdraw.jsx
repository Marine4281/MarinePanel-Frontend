import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useSupport } from "../context/SupportContext";

import GatewaySelector from "../components/addfunds/GatewaySelector";
import SupportBanner from "../components/addfunds/SupportBanner";
import PayoutFields from "../components/withdraw/PayoutFields";
import WithdrawQuoteBreakdown from "../components/withdraw/WithdrawQuoteBreakdown";

const Withdraw = () => {
  const navigate = useNavigate();
  const { userUnread, fmt } = useSupport();

  const [gateways,       setGateways]       = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [usdAmount,      setUsdAmount]      = useState("");
  const [quote,          setQuote]          = useState(null);
  const [quoteLoading,   setQuoteLoading]   = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [confirmed,      setConfirmed]      = useState(false);
  const [userPayoutData, setUserPayoutData] = useState({});

  useEffect(() => {
    API.get("/withdraw-gateways")
      .then((r) => setGateways(r.data.gateways || []))
      .catch(() => toast.error("Failed to load withdrawal methods"));
  }, []);

  useEffect(() => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      setQuote(null); setConfirmed(false); return;
    }
    const t = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const r = await API.get("/withdraw-gateways/quote", {
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
    setUserPayoutData({});
  };

  const setField = (key, val) =>
    setUserPayoutData((p) => ({ ...p, [key]: val }));

  const getPayoutChannel = (gw) =>
    gw.paymentMode === "manual" ? (gw.manualType || "other") : gw.providerType;

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
    if (["crypto", "binance"].includes(channel) && !userPayoutData.walletAddress) {
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
      return toast.error(`Minimum withdrawal is $${selected.minWithdraw}`);
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
            <h1 className="text-xl font-bold text-gray-800">Withdraw Funds</h1>
            <p className="text-sm text-gray-400 mt-1">Select a withdrawal method and amount.</p>
          </div>

          <GatewaySelector gateways={gateways} selected={selected} onSelect={handleSelect} />

          {selected && (selected.adminNote || selected.cpNote) && (
            <div className="space-y-2">
              {selected.adminNote && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                  ℹ️ {selected.adminNote}
                </div>
              )}
              {selected.cpNote && (
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">
                  📌 {selected.cpNote}
                </div>
              )}
            </div>
          )}

          {selected && (
            <PayoutFields
              selected={selected}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              userPayoutData={userPayoutData}
              setField={setField}
            />
          )}

          {selected && (
            <>
              <WithdrawQuoteBreakdown
                quote={quote}
                quoteLoading={quoteLoading}
                sym={sym}
                curr={curr}
                confirmed={confirmed}
                setConfirmed={setConfirmed}
              />

              <button onClick={handleWithdraw} disabled={!canWithdraw}
                className="w-full py-3 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                {submitting ? "Processing..." : `Withdraw via ${selected.name} →`}
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

export default Withdraw;
