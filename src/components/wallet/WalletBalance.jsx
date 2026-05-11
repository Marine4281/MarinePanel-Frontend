// src/components/wallet/WalletBalance.jsx
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function WalletBalance({ balance, setBalance, setTransactions, onAddFunds, onWithdraw }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("wallet:update", ({ userId, balance: newBalance, transactions: newTxs }) => {
      if (String(userId) !== String(user._id)) return;

      setBalance(newBalance);

      if (newTxs) {
        const sorted = [...newTxs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sorted);

        sorted
          .filter((tx) => tx.status === "Completed" && !tx.notified)
          .forEach((tx) => {
            toast.success(`Deposit of $${tx.amount} confirmed!`);
            tx.notified = true;
          });
      }
    });

    return () => socket.disconnect();
  }, [user]);

  return (
    <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "rgba(255,255,255,0.4)" }}>Wallet Balance</p>
        <p className="text-4xl font-black text-white">
          <span style={{ color: "#4ade80" }}>$</span>
          {Number(balance).toFixed(4)}
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>USD · Updates in real-time</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onAddFunds}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}>
          + Add Funds
        </button>
        <button onClick={onWithdraw}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          Withdraw
        </button>
      </div>
    </div>
  );
}
