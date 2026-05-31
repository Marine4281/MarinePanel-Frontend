// src/pages/AddFunds.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const BRAND = "#f97316";

const PAYMENT_MODE_ICONS = {
  hosted:  "💳", mpesa: "📱", momo: "📲",
  airtel:  "📡", card:  "💳", bank: "🏦",
  crypto:  "🔐", binance: "🟡", manual: "📋",
};

const AddFunds = () => {
  const navigate  = useNavigate();

  const [gateways,      setGateways]      = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [usdAmount,     setUsdAmount]     = useState("");
  const [quote,         setQuote]         = useState(null);
  const [quoteLoading,  setQuoteLoading]  = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [confirmed,     setConfirmed]     = useState(false);
  const [userPayData,   setUserPayData]   = useState({});

  // ── Fetch gateways ──────────────────────────────────────
  useEffect(() => {
    API.get("/gateways")
      .then((r) => setGateways(r.data.gateways || []))
      .catch(() => toast.error("Failed to load payment methods"));
  }, []);

  // ── Live quote (debounced) ──────────────────────────────
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

  // ── Validate user payment fields ────────────────────────
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
    if (mode === "binance") {
      if (!userPayData.binanceOrderId || !userPayData.amountSent) {
        toast.error("Binance Order ID and amount sent are required"); return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!selected || !usdAmount || Number(usdAmount) <= 0) {
      return toast.error("Select a gateway and enter an amount");
    }
    if (selected.minDeposit && Number(usdAmount) < selected.minDeposit) {
      return toast.error(`Minimum deposit is $${selected.minDeposit}`);
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

  // ── Can pay? ────────────────────────────────────────────
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
                <button key={gw._id} onClick={() => handleSelect(gw)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all"
                  style={{
                    borderColor: selected?._id === gw._id ? BRAND : "#e5e7eb",
                    background:  selected?._id === gw._id ? "#fff7ed" : "#fff",
                    boxShadow:   selected?._id === gw._id ? `0 0 0 1px ${BRAND}` : "none",
                  }}>
                  <span className="text-2xl">{PAYMENT_MODE_ICONS[gw.paymentMode] || "💰"}</span>
                  <span className="text-xs font-bold text-gray-700 leading-tight">{gw.name}</span>
                  {gw.description && (
                    <span className="text-[10px] text-gray-400 leading-tight">{gw.description}</span>
                  )}
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

          {/* ── Binance instructions ── */}
          {selected && mode === "binance" && selected.binanceId && (
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 space-y-2">
              <p className="text-sm font-bold text-yellow-800">How to pay with Binance</p>
              <p className="text-sm text-yellow-700">
                1. Open your Binance app and send <b>${Number(usdAmount || 0).toFixed(2)} USDT</b> to:
              </p>
              <div className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-3 py-2">
                <code className="text-sm font-bold text-gray-800 flex-1">{selected.binanceId}</code>
                <button onClick={() => { navigator.clipboard.writeText(selected.binanceId); toast.success("Copied!"); }}
                  className="text-xs text-orange-500 font-semibold hover:text-orange-600">Copy</button>
              </div>
              <p className="text-sm text-yellow-700">
                2. After sending, fill in your Binance Order ID and the amount you sent below.
              </p>
            </div>
          )}

          {/* ── Manual instructions ── */}
          {selected && mode === "manual" && selected.paymentInstructions && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-1">Payment Instructions</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{selected.paymentInstructions}</p>
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
                  <input type="number" min="0" step="0.01" placeholder="0.00"
                    value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm outline-none focus:border-orange-400 transition" />
                </div>
                {selected.minDeposit > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Min: ${selected.minDeposit} USD</p>
                )}
              </div>

              {/* ════════════════════════════
                  DYNAMIC USER FIELDS
              ════════════════════════════ */}

              {/* M-Pesa / Airtel — phone only */}
              {(mode === "mpesa" || mode === "airtel") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    country="ke"
                    value={userPayData.phone || ""}
                    onChange={(val) => setField("phone", val)}
                    preferredCountries={["ke","ug","tz","gh","ng"]}
                    inputClass="!w-full !py-3 !rounded-xl !border-2 !text-sm"
                  />
                </div>
              )}

              {/* MoMo — phone + network */}
              {mode === "momo" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <PhoneInput country="gh" value={userPayData.phone || ""}
                      onChange={(val) => setField("phone", val)}
                      preferredCountries={["gh","ug","rw","ci","sn"]}
                      inputClass="!w-full !py-3 !rounded-xl !border-2 !text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Network
                    </label>
                    <select value={userPayData.network || ""}
                      onChange={(e) => setField("network", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400">
                      <option value="">Select network</option>
                      <option value="MTN">MTN MoMo</option>
                      <option value="Vodafone">Vodafone Cash</option>
                      <option value="AirtelTigo">AirtelTigo</option>
                      <option value="Moov">Moov</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Card */}
              {mode === "card" && (
                <div className="space-y-3">
                  <Field label="Card Number">
                    <input type="text" maxLength={19} placeholder="1234 5678 9012 3456"
                      value={userPayData.cardNumber || ""}
                      onChange={(e) => setField("cardNumber", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry (MM/YY)">
                      <input type="text" maxLength={5} placeholder="MM/YY"
                        value={userPayData.expiry || ""}
                        onChange={(e) => setField("expiry", e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                    </Field>
                    <Field label="CVV">
                      <input type="password" maxLength={4} placeholder="•••"
                        value={userPayData.cvv || ""}
                        onChange={(e) => setField("cvv", e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                    </Field>
                  </div>
                  <Field label="Cardholder Name">
                    <input type="text" placeholder="John Doe"
                      value={userPayData.cardName || ""}
                      onChange={(e) => setField("cardName", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </Field>
                </div>
              )}

              {/* Bank */}
              {mode === "bank" && (
                <div className="space-y-3">
                  <Field label="Bank Name">
                    <input type="text" placeholder="e.g. Equity Bank"
                      value={userPayData.bankName || ""}
                      onChange={(e) => setField("bankName", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </Field>
                  <Field label="Account Number">
                    <input type="text" placeholder="e.g. 0123456789"
                      value={userPayData.accountNumber || ""}
                      onChange={(e) => setField("accountNumber", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </Field>
                  <Field label="Account Name">
                    <input type="text" placeholder="e.g. John Doe"
                      value={userPayData.accountName || ""}
                      onChange={(e) => setField("accountName", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </Field>
                </div>
              )}

              {/* Crypto */}
              {mode === "crypto" && (
                <div className="space-y-3">
                  <Field label="Your Wallet Address">
                    <input type="text" placeholder="e.g. TRx..."
                      value={userPayData.walletAddress || ""}
                      onChange={(e) => setField("walletAddress", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
                  </Field>
                  <Field label="Network">
                    <select value={userPayData.network || ""}
                      onChange={(e) => setField("network", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400">
                      <option value="">Select network</option>
                      <option value="TRC20">USDT TRC20 (Tron)</option>
                      <option value="ERC20">USDT ERC20 (Ethereum)</option>
                      <option value="BEP20">USDT BEP20 (BSC)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Binance */}
              {mode === "binance" && (
                <div className="space-y-3">
                  <Field label="Binance Order ID (from your Binance app)">
                    <input type="text" placeholder="e.g. 1234567890"
                      value={userPayData.binanceOrderId || ""}
                      onChange={(e) => setField("binanceOrderId", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
                  </Field>
                  <Field label="Amount Sent (USDT)">
                    <input type="number" placeholder="e.g. 10.00"
                      value={userPayData.amountSent || ""}
                      onChange={(e) => setField("amountSent", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </Field>
                </div>
              )}

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
                    <QRow label="Deposit amount"    value={`${sym}${Number(quote.depositAmount).toFixed(2)} ${curr}`} />
                    {quote.fee > 0 && (
                      <QRow label="Processing fee"  value={`${sym}${Number(quote.fee).toFixed(2)} ${curr}`} color="text-red-500" />
                    )}
                    <QRow label="Total charged"     value={`${sym}${Number(quote.total).toFixed(2)} ${curr}`} bold />
                    <QRow label="You will receive"  value={`$${Number(quote.walletCredit).toFixed(4)} USD`} color="text-green-600" bold />
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

              <button onClick={handlePay} disabled={!canPay}
                className="w-full py-3 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #fb923c)` }}>
                {submitting ? "Processing..." : `Pay with ${selected.name} →`}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ─── Tiny helpers ─────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const QRow = ({ label, value, bold, color }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${color || "text-gray-700"}`}>{value}</span>
  </div>
);

export default AddFunds;
