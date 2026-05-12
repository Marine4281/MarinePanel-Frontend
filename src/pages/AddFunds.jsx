// src/pages/AddFunds.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";

const BRAND = "#f97316";

const providerIcons = {
  paystack:    "💳",
  flutterwave: "🦋",
  mpesa:       "📱",
  kora:        "🔵",
  binance:     "🟡",
  cryptomus:   "🔐",
  manual:      "🏦",
};

const AddFunds = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [gateways,     setGateways]     = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [usdAmount,    setUsdAmount]    = useState("");
  const [quote,        setQuote]        = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [confirmed,    setConfirmed]    = useState(false);

  // ── Fetch visible gateways ──────────────────────────
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const res = await API.get("/gateways");
        setGateways(res.data.gateways || []);
      } catch {
        toast.error("Failed to load payment methods");
      }
    };
    fetchGateways();
  }, []);

  // ── Live quote (debounced) ──────────────────────────
  useEffect(() => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      setQuote(null);
      setConfirmed(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const res = await API.get("/gateways/quote", {
          params: { gatewayId: selected._id, usdAmount },
        });
        setQuote(res.data);
        setConfirmed(false);
      } catch {
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selected, usdAmount]);

  const handleSelect = (gw) => {
    setSelected(gw);
    setQuote(null);
    setConfirmed(false);
    setUsdAmount("");
  };

  const handlePay = async () => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      return toast.error("Select a gateway and enter an amount");
    }
    if (selected.minDeposit && Number(usdAmount) < selected.minDeposit) {
      return toast.error(`Minimum deposit is $${selected.minDeposit}`);
    }
    try {
      setSubmitting(true);
      const res = await API.post("/gateways/pay", {
        gatewayId: selected._id,
        usdAmount: Number(usdAmount),
      });
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        toast.success(res.data.message || "Payment initiated. Check your phone.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const sym  = selected?.processingCurrencySymbol || "$";
  const curr = selected?.processingCurrency       || "USD";

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col pb-24">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto mt-8 px-4 space-y-6">

        {/* Back */}
        <button onClick={() => navigate("/wallet")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
          ← Back to Wallet
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">

          <div>
            <h1 className="text-xl font-bold text-gray-800">Add Funds</h1>
            <p className="text-sm text-gray-400 mt-1">
              Select a payment method and enter the amount to deposit.
            </p>
          </div>

          {/* ── Gateway Grid ── */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Payment Method
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gateways.length === 0 && (
                <p className="col-span-3 text-center py-6 text-sm text-gray-400">
                  No payment methods available
                </p>
              )}
              {gateways.map((gw) => (
                <button
                  key={gw._id}
                  onClick={() => handleSelect(gw)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all"
                  style={{
                    borderColor:   selected?._id === gw._id ? BRAND : "#e5e7eb",
                    background:    selected?._id === gw._id ? "#fff7ed" : "#fff",
                    boxShadow:     selected?._id === gw._id ? `0 0 0 1px ${BRAND}` : "none",
                  }}
                >
                  <span className="text-2xl">{providerIcons[gw.provider] || "💰"}</span>
                  <span className="text-xs font-bold text-gray-700 leading-tight">{gw.label}</span>
                  {gw.processingCurrency !== "USD" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                      {gw.processingCurrency}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notes ── */}
          {selected && (selected.adminNote || selected.cpNote) && (
            <div className="space-y-2">
              {selected.adminNote && (
                <div className="flex gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                  ℹ️ {selected.adminNote}
                </div>
              )}
              {selected.cpNote && (
                <div className="flex gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">
                  📌 {selected.cpNote}
                </div>
              )}
            </div>
          )}

          {/* ── Amount Input ── */}
          {selected && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm outline-none transition focus:border-orange-400"
                  />
                </div>
                {selected.minDeposit > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum deposit: ${selected.minDeposit} USD
                  </p>
                )}
              </div>

              {/* ── Quote Breakdown ── */}
              {quoteLoading && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
                  <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                  Calculating...
                </div>
              )}

              {quote && !quoteLoading && (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="px-4 py-2 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Payment Breakdown
                    </p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <QuoteRow label="Deposit amount"
                      value={`${sym}${Number(quote.depositAmount).toFixed(2)} ${curr}`} />
                    {quote.fee > 0 && (
                      <QuoteRow label="Processing fee"
                        value={`${sym}${Number(quote.fee).toFixed(2)} ${curr}`}
                        color="text-red-500" />
                    )}
                    <QuoteRow label="Total charged"
                      value={`${sym}${Number(quote.total).toFixed(2)} ${curr}`}
                      bold />
                    <QuoteRow label="You will receive"
                      value={`$${Number(quote.walletCredit).toFixed(4)} USD`}
                      color="text-green-600"
                      bold />
                  </div>
                </div>
              )}

              {/* ── Confirm for non-USD ── */}
              {quote && curr !== "USD" && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 accent-orange-500" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I understand I will be charged {sym}{Number(quote.total).toFixed(2)} {curr} and
                    will receive ${Number(quote.walletCredit).toFixed(4)} USD in my wallet.
                  </span>
                </label>
              )}

              <button
                onClick={handlePay}
                disabled={submitting || !usdAmount || Number(usdAmount) <= 0 || (curr !== "USD" && !confirmed)}
                className="w-full py-3 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #fb923c)` }}
              >
                {submitting ? "Processing..." : `Pay with ${selected.label} →`}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Quote row helper
const QuoteRow = ({ label, value, bold, color }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${color || "text-gray-700"}`}>
      {value}
    </span>
  </div>
);

export default AddFunds;
