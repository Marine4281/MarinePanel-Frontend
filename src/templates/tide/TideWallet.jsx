// src/templates/tide/TideWallet.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useCurrency } from "../../context/CurrencyContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiArrowDownLeft, FiArrowUpRight, FiPlusCircle, FiMinusCircle,
} from "react-icons/fi";

const baseURL = import.meta.env.VITE_API_URL?.replace("/api", "");
const PAGE_SIZE = 10;

const STATUS_COLOR = { Completed: "text-green-600", Pending: "text-amber-500" };

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

export default function TideWallet() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();
  const { formatMoney, selected } = useCurrency();
  const navigate = useNavigate();

  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visible, setVisible]           = useState(PAGE_SIZE);
  const loaderRef = useRef(null);

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel" };

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
      <TideLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
        </div>
      </TideLayout>
    );
  }

  return (
    <TideLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: balance + actions */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)` }}>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Wallet Balance</p>
              <p className="text-4xl font-black mt-1">{formatMoney(balance, 4)}</p>
              <p className="text-white/60 text-xs mt-2">
                {selected?.code === "USD" || !selected?._id ? "Base currency (USD)" : `Displayed in ${selected.code}`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <button
              onClick={() => navigate("/add-funds")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
              style={{ background: brand.color, boxShadow: `0 4px 14px ${brand.color}44` }}
            >
              <FiPlusCircle size={15} /> Add Funds
            </button>
            <button
              onClick={() => navigate("/withdraw")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100"
            >
              <FiMinusCircle size={15} /> Withdraw
            </button>
          </div>
        </div>

        {/* Right: transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ borderLeft: `4px solid ${brand.color}` }}>
              <h3 className="font-black text-gray-900">Transaction History</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                {transactions.length} total
              </span>
            </div>

            {transactions.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-400">No transactions yet</p>
            ) : (
              <>
                <div className="divide-y divide-gray-50">
                  {displayed.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <div key={tx._id} className="flex items-center justify-between px-6 py-4 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: isCredit ? `${brand.color}14` : "#fee2e2" }}>
                            {isCredit
                              ? <FiArrowDownLeft size={16} style={{ color: brand.color }} />
                              : <FiArrowUpRight size={16} className="text-red-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{tx.type}</p>
                            <p className="text-xs text-gray-400 truncate">{describe(tx)}</p>
                            <p className="text-xs text-gray-300">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black" style={{ color: isCredit ? "#16a34a" : "#dc2626" }}>
                            {isCredit ? "+" : "-"}{formatMoney(Math.abs(tx.amount), 4)}
                          </p>
                          <p className={`text-xs font-semibold ${STATUS_COLOR[tx.status] || "text-gray-400"}`}>
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
                  <p className="text-center text-xs text-gray-300 py-4">
                    All {transactions.length} transactions loaded
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </TideLayout>
  );
              }
