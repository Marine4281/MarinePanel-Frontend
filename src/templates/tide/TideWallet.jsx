// src/templates/tide/TideWallet.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard } from "react-icons/fi";

export default function TideWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();
  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [methods, setMethods]           = useState([]);
  const [method, setMethod]             = useState("");
  const [amount, setAmount]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [w, m] = await Promise.all([API.get("/wallet"), API.get("/payment-methods")]);
        setBalance(w.data.balance || 0);
        setTransactions((w.data.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setMethods(m.data.methods || []);
      } catch { toast.error("Failed to load wallet"); } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDeposit = async () => {
    if (!method || !amount) return toast.error("Select method and amount");
    setSubmitting(true);
    try {
      const res = await API.post("/payment/initiate", { methodId: method, amount: Number(amount) });
      if (res.data.paymentUrl) window.location.href = res.data.paymentUrl;
      else toast.success("Initiated — check instructions");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const isCredit = (t) => t === "credit" || t === "deposit";
  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors appearance-none";

  return (
    <TideLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: balance + deposit */}
        <div className="space-y-4">
          {/* Balance card */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)` }}>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Account Balance</p>
              <p className="text-4xl font-black mt-1">${Number(balance).toFixed(2)}</p>
              <p className="text-white/60 text-xs mt-2">{user?.email}</p>
            </div>
          </div>

          {/* Deposit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <FiCreditCard size={14} style={{ color: brand.color }} />
              Add Funds
            </h3>

            <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}
              onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}>
              <option value="">Select payment method…</option>
              {methods.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>

            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (USD)" className={inputClass}
              onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />

            <button onClick={handleDeposit} disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: brand.color, boxShadow: `0 4px 14px ${brand.color}44` }}>
              {submitting ? "Processing…" : "Deposit"}
            </button>
          </div>
        </div>

        {/* Right: transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100" style={{ borderLeft: `4px solid ${brand.color}` }}>
              <h3 className="font-black text-gray-900">Transaction History</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-400">No transactions yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {transactions.slice(0, 20).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: isCredit(tx.type) ? `${brand.color}14` : "#fee2e2" }}>
                        {isCredit(tx.type)
                          ? <FiArrowDownLeft size={16} style={{ color: brand.color }} />
                          : <FiArrowUpRight size={16} className="text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black" style={{ color: isCredit(tx.type) ? "#16a34a" : "#dc2626" }}>
                      {isCredit(tx.type) ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TideLayout>
  );
}
