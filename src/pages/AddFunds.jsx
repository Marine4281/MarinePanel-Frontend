// src/pages/AddFunds.jsx
import { useEffect, useState } from "react";
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

export default function AddFunds() {
  const { user } = useAuth();

  const [gateways,      setGateways]      = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [usdAmount,     setUsdAmount]     = useState("");
  const [quote,         setQuote]         = useState(null);
  const [quoteLoading,  setQuoteLoading]  = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [confirmed,     setConfirmed]     = useState(false);

  // ── Fetch visible gateways ──────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/gateways");
        setGateways(res.data.gateways || []);
      } catch {
        toast.error("Failed to load payment methods");
      }
    };
    fetch();
  }, []);

  // ── Fetch quote whenever gateway or amount changes ──────
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
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [selected, usdAmount]);

  // ── Select gateway ──────────────────────────────────────
  const handleSelect = (gw) => {
    setSelected(gw);
    setQuote(null);
    setConfirmed(false);
  };

  // ── Proceed to payment ──────────────────────────────────
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

      // Providers that return a redirect URL
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        // M-Pesa STK push — no redirect
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
    <div className="min-h-screen flex flex-col" style={{ background: "#060a12" }}>
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-6">

        {/* ── Heading ── */}
        <div>
          <h1 className="text-2xl font-black text-white">Add Funds</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Select a payment method and enter the amount you want to deposit.
          </p>
        </div>

        {/* ── Gateway Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gateways.length === 0 && (
            <p className="col-span-3 text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              No payment methods available
            </p>
          )}
          {gateways.map((gw) => (
            <button
              key={gw._id}
              onClick={() => handleSelect(gw)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-left transition-all"
              style={{
                background:   selected?._id === gw._id ? `${BRAND}15` : "rgba(255,255,255,0.03)",
                borderColor:  selected?._id === gw._id ? BRAND        : "rgba(255,255,255,0.08)",
                boxShadow:    selected?._id === gw._id ? `0 0 0 1px ${BRAND}` : "none",
              }}
            >
              <span className="text-2xl">{providerIcons[gw.provider] || "💰"}</span>
              <span className="text-sm font-bold text-white text-center leading-tight">{gw.label}</span>
              {gw.processingCurrency !== "USD" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  {gw.processingCurrency}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notes ── */}
        {selected && (selected.adminNote || selected.cpNote) && (
          <div className="space-y-2">
            {selected.adminNote && (
              <div className="flex gap-3 p-3 rounded-xl text-sm"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                ℹ️ {selected.adminNote}
              </div>
            )}
            {selected.cpNote && (
              <div className="flex gap-3 p-3 rounded-xl text-sm"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fcd34d" }}>
                📌 {selected.cpNote}
              </div>
            )}
          </div>
        )}

        {/* ── Amount Input ── */}
        {selected && (
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

            <label className="block text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Amount (USD)
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                style={{ color: "rgba(255,255,255,0.4)" }}>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3.5 rounded-xl text-white text-sm outline-none"
                style={{
                  background:  "rgba(255,255,255,0.06)",
                  border:      "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => { e.target.style.borderColor = `${BRAND}70`; e.target.style.boxShadow = `0 0 0 3px ${BRAND}18`; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {selected.minDeposit > 0 && (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                Minimum deposit: ${selected.minDeposit} USD
              </p>
            )}

            {/* ── Quote Breakdown ── */}
            {quoteLoading && (
              <div className="text-xs text-center py-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                Calculating...
              </div>
            )}

            {quote && !quoteLoading && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                  Payment Breakdown
                </div>

                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <Row label="Deposit amount"
                    value={`${sym}${Number(quote.depositAmount).toFixed(2)} ${curr}`} />

                  {quote.fee > 0 && (
                    <Row label="Processing fee"
                      value={`${sym}${Number(quote.fee).toFixed(2)} ${curr}`}
                      highlight="red" />
                  )}

                  <Row label="Total charged"
                    value={`${sym}${Number(quote.total).toFixed(2)} ${curr}`}
                    bold />

                  <Row label="You will receive"
                    value={`$${Number(quote.walletCredit).toFixed(4)} USD`}
                    highlight="green" />
                </div>
              </div>
            )}

            {/* ── Confirm checkbox for non-USD ── */}
            {quote && curr !== "USD" && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 accent-orange-500" />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  I understand I will be charged {sym}{Number(quote.total).toFixed(2)} {curr} and will
                  receive ${Number(quote.walletCredit).toFixed(4)} USD in my wallet.
                </span>
              </label>
            )}

            <button
              onClick={handlePay}
              disabled={submitting || !usdAmount || (curr !== "USD" && !confirmed)}
              className="w-full py-4 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:  `linear-gradient(135deg, ${BRAND}, #fb923c)`,
                boxShadow:   `0 4px 24px ${BRAND}40`,
              }}
            >
              {submitting ? "Processing..." : `Pay with ${selected.label} →`}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Small helper row component
function Row({ label, value, bold, highlight }) {
  const color =
    highlight === "green" ? "#4ade80"
    : highlight === "red" ? "#f87171"
    : "rgba(255,255,255,0.7)";

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span className="text-sm" style={{ color, fontWeight: bold ? 800 : 500 }}>{value}</span>
    </div>
  );
}
