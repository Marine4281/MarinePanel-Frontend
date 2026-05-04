// src/templates/neon/NeonWallet.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";

export default function NeonWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();
  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [methods, setMethods]           = useState([]);
  const [method, setMethod]             = useState("");
  const [amount, setAmount]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  const brand = { color: childPanel?.themeColor || "#00ff88" };
  const neon = brand.color;

  const inputStyle = { background: "#0d0d1a", border: `1px solid ${neon}22`, color: "#c4c4e0", width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, outline: "none", appearance: "none" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [w, m] = await Promise.all([API.get("/wallet"), API.get("/payment-methods")]);
        setBalance(w.data.balance || 0);
        setTransactions((w.data.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setMethods(m.data.methods || []);
      } catch { toast.error("Failed to load"); } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDeposit = async () => {
    if (!method || !amount) return toast.error("Select method and amount");
    setSubmitting(true);
    try {
      const res = await API.post("/payment/initiate", { methodId: method, amount: Number(amount) });
      if (res.data.paymentUrl) window.location.href = res.data.paymentUrl;
      else toast.success("Initiated");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const isCredit = (t) => t === "credit" || t === "deposit";

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Financial Hub</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Wallet</h2>
        </div>

        {/* Balance terminal */}
        <div className="rounded-2xl p-6" style={{ background: "#0d0d1a", border: `1px solid ${neon}30`, boxShadow: `0 0 40px ${neon}10` }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: `${neon}55` }}>Available Credits</p>
          <p className="text-5xl font-black" style={{ color: neon, textShadow: `0 0 24px ${neon}88` }}>
            ${Number(balance).toFixed(2)}
          </p>
          <p className="text-xs mt-2" style={{ color: "#3a3a5a" }}>{user?.email}</p>
        </div>

        {/* Deposit terminal */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#0d0d1a", border: `1px solid ${neon}18` }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: neon }}>Inject Funds</p>
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}>
            <option value="" style={{ background: "#0d0d1a" }}>Select channel…</option>
            {methods.map((m) => <option key={m._id} value={m._id} style={{ background: "#0d0d1a" }}>{m.name}</option>)}
          </select>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (USD)" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
          <button onClick={handleDeposit} disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${neon}cc, ${neon}88)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}>
            {submitting ? "Processing…" : "Inject"}
          </button>
        </div>

        {/* Tx log */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: `${neon}66` }}>Transaction Log</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "#3a3a5a" }}>No entries</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "#0d0d1a", border: `1px solid ${neon}10` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: isCredit(tx.type) ? `${neon}14` : "rgba(248,113,113,0.1)" }}>
                      {isCredit(tx.type)
                        ? <FiArrowDownLeft size={13} style={{ color: neon }} />
                        : <FiArrowUpRight size={13} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold capitalize" style={{ color: "#8888a8" }}>{tx.type}</p>
                      <p className="text-xs" style={{ color: "#3a3a5a" }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black" style={{ color: isCredit(tx.type) ? neon : "#f87171", textShadow: isCredit(tx.type) ? `0 0 8px ${neon}66` : "none" }}>
                    {isCredit(tx.type) ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NeonLayout>
  );
}
