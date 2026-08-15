// src/templates/neon/NeonWallet.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiArrowDownLeft, FiArrowUpRight, FiPlusCircle, FiMinusCircle,
} from "react-icons/fi";

const baseURL = import.meta.env.VITE_API_URL?.replace("/api", "");
const PAGE_SIZE = 10;

const STATUS_COLOR = { Completed: "#4ade80", Pending: "#fbbf24" };

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

export default function NeonWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();
  const { formatMoney, selected } = useCurrency();
  const navigate = useNavigate();

  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visible, setVisible]           = useState(PAGE_SIZE);
  const loaderRef = useRef(null);

  const neon = childPanel?.themeColor || "#00ff88";

  const sortTx = (list) =>
    [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/wallet");
      setBalance(res.data.balance || 0);
      setTransactions(sortTx(res.data.transactions || []));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  /* ---- realtime balance/transaction updates ---- */
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

  /* ---- infinite scroll ---- */
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

  if (loading) {
    return (
      <NeonLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
        </div>
      </NeonLayout>
    );
  }

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Financial Hub</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Wallet</h2>
        </div>

        {/* Balance terminal */}
        <div className="rounded-2xl p-6" style={{ background: "#1b1b2a", border: `1px solid ${neon}30`, boxShadow: `0 0 40px ${neon}10` }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: `${neon}55` }}>Available Credits</p>
          <p className="text-5xl font-black" style={{ color: neon, textShadow: `0 0 24px ${neon}88` }}>
            {formatMoney(balance, 4)}
          </p>
          <p className="text-xs mt-2" style={{ color: "#5c5c82" }}>
            {selected?.code === "USD" || !selected?._id ? "Base currency (USD)" : `Displayed in ${selected.code}`}
          </p>
        </div>

        {/* Actions */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
          <button
            onClick={() => navigate("/add-funds")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest"
            style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}
          >
            <FiPlusCircle size={15} /> Add Funds
          </button>
          <button
            onClick={() => navigate("/withdraw")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest"
            style={{ color: "#f87171", background: "#2a1414", border: "1px solid #dc262633" }}
          >
            <FiMinusCircle size={15} /> Withdraw
          </button>
        </div>

        {/* Tx log */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: `${neon}66` }}>Transaction Log</p>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: `${neon}14`, color: neon }}>
              {transactions.length} total
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "#5c5c82" }}>No entries</p>
          ) : (
            <>
              <div className="space-y-2">
                {displayed.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div key={tx._id} className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: "#1b1b2a", border: `1px solid ${neon}10` }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isCredit ? `${neon}14` : "rgba(248,113,113,0.1)" }}>
                          {isCredit
                            ? <FiArrowDownLeft size={15} style={{ color: neon }} />
                            : <FiArrowUpRight size={15} style={{ color: "#f87171" }} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold" style={{ color: "#c4c4e0" }}>{tx.type}</p>
                          <p className="text-xs truncate max-w-[180px]" style={{ color: "#6c6c92" }}>{describe(tx)}</p>
                          <p className="text-xs" style={{ color: "#5c5c82" }}>{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black" style={{ color: isCredit ? neon : "#f87171", textShadow: isCredit ? `0 0 8px ${neon}66` : "none" }}>
                          {isCredit ? "+" : "-"}{formatMoney(Math.abs(tx.amount), 4)}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: STATUS_COLOR[tx.status] || "#5c5c82" }}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-4">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
                </div>
              )}
              {!hasMore && (
                <p className="text-center text-xs py-4" style={{ color: "#5c5c82" }}>
                  All {transactions.length} transactions loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </NeonLayout>
  );
        }
