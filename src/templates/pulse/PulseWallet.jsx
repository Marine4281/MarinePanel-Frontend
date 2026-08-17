// src/templates/pulse/PulseWallet.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiArrowDownLeft, FiArrowUpRight, FiPlus, FiMinus } from "react-icons/fi";

const baseURL = import.meta.env.VITE_API_URL?.replace("/api", "");
const PAGE_SIZE = 10;

const STATUS_COLOR = { Completed: "#16a34a", Pending: "#ca8a04" };

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

export default function PulseWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();
  const { formatMoney, selected } = useCurrency();
  const navigate = useNavigate();

  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visible, setVisible]           = useState(PAGE_SIZE);
  const loaderRef = useRef(null);

  const brand = { color: childPanel?.themeColor || "#6366f1" };

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
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-5 → max-w-2xl mx-auto space-y-5">

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
          <p className="text-white text-4xl font-black mt-1">{formatMoney(balance, 4)}</p>
          <p className="text-white/60 text-xs mt-2">
            {selected?.code === "USD" || !selected?._id ? user?.email : `Displayed in ${selected.code} · ${user?.email}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/add-funds")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white"
            style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}
          >
            <FiPlus size={15} /> Add Funds
          </button>
          <button
            onClick={() => navigate("/withdraw")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black"
            style={{ background: "#fef2f2", color: "#dc2626" }}
          >
            <FiMinus size={15} /> Withdraw
          </button>
        </div>

        {/* Transactions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="font-black text-gray-800 text-sm">Recent Transactions</p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${brand.color}12`, color: brand.color }}>
              {transactions.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No transactions yet</p>
          ) : (
            <>
              {displayed.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isCredit ? "#dcfce7" : "#fee2e2" }}
                      >
                        {isCredit
                          ? <FiArrowDownLeft size={15} className="text-green-600" />
                          : <FiArrowUpRight size={15} className="text-red-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800">{tx.type}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{describe(tx)}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black" style={{ color: isCredit ? "#16a34a" : "#dc2626" }}>
                        {isCredit ? "+" : "-"}{formatMoney(Math.abs(tx.amount), 4)}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: STATUS_COLOR[tx.status] || "#9ca3af" }}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-4">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
                </div>
              )}
              {!hasMore && (
                <p className="text-center text-xs text-gray-400 py-4">All {transactions.length} transactions loaded</p>
              )}
            </>
          )}
        </div>
      </div>
    </PulseLayout>
  );
      }
