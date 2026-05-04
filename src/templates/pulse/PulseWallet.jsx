// src/templates/pulse/PulseWallet.jsx
import { useState, useEffect } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useAuth } from "../../context/AuthContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiArrowDownLeft, FiArrowUpRight, FiPlus } from "react-icons/fi";

export default function PulseWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();

  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [methods, setMethods]           = useState([]);
  const [method, setMethod]             = useState("");
  const [amount, setAmount]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  const brand = { color: childPanel?.themeColor || "#6366f1" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [w, m] = await Promise.all([API.get("/wallet"), API.get("/payment-methods")]);
        setBalance(w.data.balance || 0);
        setTransactions(
          (w.data.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        setMethods(m.data.methods || []);
      } catch { toast.error("Failed to load wallet"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDeposit = async () => {
    if (!method || !amount) return toast.error("Select method and enter amount");
    setSubmitting(true);
    try {
      const res = await API.post("/payment/initiate", { methodId: method, amount: Number(amount) });
      if (res.data.paymentUrl) window.location.href = res.data.paymentUrl;
      else toast.success("Initiated — check instructions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const isCredit = (type) => type === "credit" || type === "deposit";

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-5">

        {/* Balance hero card */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}cc 100%)`,
            boxShadow: `0 8px 32px ${brand.color}44`,
          }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white opacity-10" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white opacity-5" />
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Your Balance</p>
          <p className="text-white text-4xl font-black mt-1">${Number(balance).toFixed(2)}</p>
          <p className="text-white/60 text-xs mt-2">{user?.email}</p>
        </div>

        {/* Deposit card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
          <p className="font-black text-gray-800 text-sm flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: `${brand.color}15` }}
            >
              <FiPlus size={13} style={{ color: brand.color }} />
            </span>
            Add Funds
          </p>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 appearance-none"
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
          >
            <option value="">Select payment method…</option>
            {methods.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800"
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
          />

          <button
            onClick={handleDeposit}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}
          >
            {submitting ? "Processing…" : "Deposit"}
          </button>
        </div>

        {/* Transactions */}
        <div className="space-y-2">
          <p className="font-black text-gray-800 text-sm px-1">Recent Transactions</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No transactions yet</p>
          ) : (
            transactions.slice(0, 20).map((tx) => (
              <div key={tx._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isCredit(tx.type) ? "#dcfce7" : "#fee2e2",
                    }}
                  >
                    {isCredit(tx.type)
                      ? <FiArrowDownLeft size={15} className="text-green-600" />
                      : <FiArrowUpRight size={15} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span
                  className="text-sm font-black"
                  style={{ color: isCredit(tx.type) ? "#16a34a" : "#dc2626" }}
                >
                  {isCredit(tx.type) ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </PulseLayout>
  );
}
