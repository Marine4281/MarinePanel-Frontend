// src/templates/aurora/AuroraWallet.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiPlus, FiArrowUpRight, FiArrowDownLeft, FiClock } from "react-icons/fi";

export default function AuroraWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();

  const [balance, setBalance]             = useState(0);
  const [transactions, setTransactions]   = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [method, setMethod]               = useState("");
  const [amount, setAmount]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#a78bfa",
    name:  childPanel?.brandName  || "Panel",
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [walletRes, methodsRes] = await Promise.all([
          API.get("/wallet"),
          API.get("/payment-methods"),
        ]);
        setBalance(walletRes.data.balance || 0);
        setTransactions(
          (walletRes.data.transactions || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        setPaymentMethods(methodsRes.data.methods || []);
      } catch {
        toast.error("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeposit = async () => {
    if (!method || !amount) return toast.error("Select method and enter amount");
    setSubmitting(true);
    try {
      const res = await API.post("/payment/initiate", {
        methodId: method,
        amount: Number(amount),
      });
      if (res.data.paymentUrl) window.location.href = res.data.paymentUrl;
      else toast.success("Deposit initiated — check instructions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const txIcon = (type) => {
    if (type === "credit" || type === "deposit")
      return <FiArrowDownLeft size={14} className="text-green-400" />;
    return <FiArrowUpRight size={14} className="text-red-400" />;
  };

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-6 pt-2">

        {/* Balance card */}
        <div
          className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${brand.color}30, ${brand.color}10)`,
            border: `1px solid ${brand.color}30`,
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
            style={{ background: brand.color }}
          />
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            Available Balance
          </p>
          <p className="text-5xl font-black text-white">
            ${Number(balance).toFixed(2)}
          </p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            {user?.email}
          </p>
        </div>

        {/* Deposit */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <FiPlus size={15} style={{ color: brand.color }} />
            Add Funds
          </p>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: method ? "#e2e8f0" : "rgba(255,255,255,0.35)",
            }}
          >
            <option value="">Select payment method…</option>
            {paymentMethods.map((m) => (
              <option key={m._id} value={m._id} style={{ background: "#1a1730", color: "#e2e8f0" }}>
                {m.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />

          <button
            onClick={handleDeposit}
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`,
              color: "#fff",
              boxShadow: `0 4px 24px ${brand.color}40`,
            }}
          >
            {submitting ? "Processing..." : "Deposit"}
          </button>
        </div>

        {/* Transactions */}
        <div>
          <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <FiClock size={14} style={{ color: brand.color }} />
            Transaction History
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {txIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white capitalize">
                        {tx.type}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        tx.type === "credit" || tx.type === "deposit"
                          ? "#4ade80"
                          : "#f87171",
                    }}
                  >
                    {tx.type === "credit" || tx.type === "deposit" ? "+" : "-"}
                    ${Number(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuroraLayout>
  );
}
