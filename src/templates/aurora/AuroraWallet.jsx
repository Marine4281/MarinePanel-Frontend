// src/templates/aurora/AuroraWallet.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiPlus, FiMinus, FiArrowUpRight, FiArrowDownLeft, FiClock } from "react-icons/fi";

const baseURL = import.meta.env.VITE_API_URL?.replace("/api", "");
const PAGE_SIZE = 10;

const STATUS_COLOR = { Completed: "#34d399", Pending: "#fbbf24" };

const describe = (tx) => {
  const note = tx.note?.trim() || "";
  switch (tx.type) {
    case "Deposit": return tx.method ? `Deposit via ${tx.method}` : note || "Funds deposited";
    case "Withdrawal": return note ? note.replace(/^Method:\s*/i, "Withdrawal via ") : "Withdrawal request";
    case "Order": return note || "Order placement";
    case "Refund": return note || "Order refund";
    case "Admin Adjustment":
    case "CP Admin Adjustment": return note || "Balance adjustment";
    case "Commission": return note || "Commission earned";
    default: return note || tx.type;
  }
};

export default function AuroraWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();
  const { formatMoney, selected } = useCurrency();
  const navigate = useNavigate();

  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visible, setVisible]           = useState(PAGE_SIZE);
  const loaderRef = useRef(null);

  const brand = { color: childPanel?.themeColor || "#a78bfa" };

  const sortTx = (list) => [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/wallet");
      setBalance(res.data.balance || 0);
      setTransactions(sortTx(res.data.transactions || []));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load wallet");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  /* realtime */
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(baseURL);
    socket.on("wallet:update", ({ userId, balance: newBalance, transactions: newTxs }) => {
      if (String(userId) !== String(user._id)) return;
      setBalance(newBalance);
      if (Array.isArray(newTxs)) {
        const sorted = sortTx(newTxs);
        setTransactions(sorted);
        sorted
          .filter((tx) => tx.status === "Completed" && !tx._notified)
          .forEach((tx) => {
            toast.success(`Deposit of ${formatMoney(tx.amount, 4)} confirmed!`);
            tx._notified = true;
          });
      }
    });
    return () => socket.disconnect();
  }, [user, formatMoney]);

  /* infinite scroll */
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visible < transactions.length) {
          setVisible((v) => v + PAGE_SIZE);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visible, transactions.length]);

  const displayed = transactions.slice(0, visible);
  const hasMore = visible < transactions.length;

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
            {formatMoney(balance, 4)}
          </p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            {selected?.code === "USD" || !selected?._id ? user?.email : `Displayed in ${selected.code} · ${user?.email}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/add-funds")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`,
              color: "#fff",
              boxShadow: `0 4px 24px ${brand.color}40`,
            }}
          >
            <FiPlus size={15} /> Add Funds
          </button>
          <button
            onClick={() => navigate("/withdraw")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
          >
            <FiMinus size={15} /> Withdraw
          </button>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <FiClock size={14} style={{ color: brand.color }} />
              Transaction History
            </p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${brand.color}20`, color: brand.color }}>
              {transactions.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              No transactions yet
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {displayed.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isCredit ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)" }}
                        >
                          {isCredit
                            ? <FiArrowDownLeft size={15} className="text-green-400" />
                            : <FiArrowUpRight size={15} className="text-red-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">{tx.type}</p>
                          <p className="text-xs truncate max-w-[160px]" style={{ color: "rgba(255,255,255,0.4)" }}>{describe(tx)}</p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: isCredit ? "#4ade80" : "#f87171" }}>
                          {isCredit ? "+" : "-"}{formatMoney(Math.abs(tx.amount), 4)}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: STATUS_COLOR[tx.status] || "rgba(255,255,255,0.35)" }}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-4">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
                </div>
              )}
              {!hasMore && (
                <p className="text-center text-xs py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                  All {transactions.length} transactions loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AuroraLayout>
  );
}
