// src/pages/childpanel/ChildPanelWallet.jsx
//
// Child panel owner's earnings wallet.
// This is NOT the same as a regular user wallet.
// It shows:
//   - Commission earned from orders on their panel
//   - Earnings from user deposits (when using platform gateway)
//   - Withdrawal request to main admin
//
// Child panel owners do NOT deposit here.
// They EARN into this wallet and WITHDRAW out.

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiDollarSign,
  FiArrowDownCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (v, d = 2) => Number(v || 0).toFixed(d);

const getTxStyle = (amount) =>
  amount >= 0
    ? "text-green-600 font-semibold"
    : "text-red-500 font-semibold";

const getTxPrefix = (amount) => (amount >= 0 ? "+" : "");

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return <FiCheckCircle className="text-green-500" size={14} />;
    case "pending":
      return <FiClock className="text-yellow-500" size={14} />;
    case "failed":
    case "rejected":
      return <FiXCircle className="text-red-500" size={14} />;
    default:
      return null;
  }
};

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ======================= WITHDRAWAL MODAL =======================

function WithdrawalModal({ balance, minWithdraw, onClose, onSubmitted }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const canWithdraw = balance >= minWithdraw;

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error("Enter a valid amount");
    if (num < minWithdraw)
      return toast.error(`Minimum withdrawal is $${minWithdraw}`);
    if (num > balance)
      return toast.error("Amount exceeds available balance");
    if (!method.trim()) return toast.error("Enter withdrawal method");
    if (!details.trim()) return toast.error("Enter payment details");

    setLoading(true);
    try {
      await API.post("/child-panel/withdraw", {
        amount: num,
        method: method.trim(),
        details: details.trim(),
      });
      toast.success("Withdrawal request submitted");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit withdrawal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-800">Request Withdrawal</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {!canWithdraw ? (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Balance Too Low</p>
              <p className="text-xs mt-0.5">
                You need at least ${minWithdraw} to withdraw. Current balance:
                ${fmt(balance)}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Available */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Available to withdraw</p>
              <p className="text-2xl font-bold text-green-600">
                ${fmt(balance)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Minimum: ${minWithdraw}
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={minWithdraw}
                  max={balance}
                  step="0.01"
                  placeholder={`Min $${minWithdraw}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Method */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Withdrawal Method
              </label>
              <input
                type="text"
                placeholder="e.g. Mpesa, Paypal, Bank Transfer"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Details */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Payment Details
              </label>
              <textarea
                placeholder="e.g. 0712345678 (Safaricom Mpesa) or paypal@email.com"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          {canWithdraw && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelWallet() {
  const [wallet, setWallet] = useState(null);
  const [settings, setSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  // ======================= FETCH =======================

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [walletRes, settingsRes] = await Promise.all([
        API.get("/wallet"),
        API.get("/cp/settings"),
      ]);

      const txs = (walletRes.data?.transactions || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setWallet(walletRes.data);
      setTransactions(txs);
      setSettings(settingsRes.data);
    } catch {
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const balance = wallet?.balance || 0;
  const minWithdraw = settings?.withdrawMin ?? 10;

  // Split transactions into earnings vs other
  const earnings = transactions.filter((t) =>
    ["CP Commission", "CP Deposit Earning"].includes(t.type)
  );
  const totalEarned = earnings
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === "Withdrawal" && t.status === "Completed")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const pendingWithdrawals = transactions.filter(
    (t) => t.type === "Withdrawal" && t.status === "Pending"
  );

  const displayed = showAll ? transactions : transactions.slice(0, 10);

  if (loading) {
    return (
      <ChildPanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ChildPanelLayout>
    );
  }

  return (
    <ChildPanelLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Wallet</h1>
          <p className="text-sm text-gray-500">
            Your panel earnings and withdrawals
          </p>
        </div>

        {/* Pending withdrawal notice */}
        {pendingWithdrawals.length > 0 && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <FiClock className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                {pendingWithdrawals.length} Pending Withdrawal
                {pendingWithdrawals.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs mt-0.5">
                Total pending:{" "}
                <strong>
                  $
                  {fmt(
                    pendingWithdrawals.reduce(
                      (a, t) => a + Math.abs(t.amount),
                      0
                    )
                  )}
                </strong>
                . The admin will process it shortly.
              </p>
            </div>
          </div>
        )}

        {/* Balance card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-80 mb-1">Available Balance</p>
          <p className="text-4xl font-bold mb-4">${fmt(balance)}</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs opacity-70">Total Earned</p>
              <p className="text-lg font-bold">${fmt(totalEarned)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs opacity-70">Total Withdrawn</p>
              <p className="text-lg font-bold">${fmt(totalWithdrawn)}</p>
            </div>
          </div>

          <button
            onClick={() => setShowWithdrawal(true)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition"
          >
            <FiArrowDownCircle size={16} />
            Request Withdrawal
          </button>

          {balance < minWithdraw && (
            <p className="text-center text-xs opacity-70 mt-2">
              Minimum withdrawal is ${minWithdraw}. You need $
              {fmt(minWithdraw - balance)} more.
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-green-500">
              <FiTrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Commission Earned</p>
              <p className="font-bold text-gray-800">
                $
                {fmt(
                  transactions
                    .filter((t) => t.type === "CP Commission" && t.amount > 0)
                    .reduce((a, t) => a + t.amount, 0)
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
              <FiDollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Deposit Earnings</p>
              <p className="font-bold text-gray-800">
                $
                {fmt(
                  transactions
                    .filter(
                      (t) =>
                        t.type === "CP Deposit Earning" && t.amount > 0
                    )
                    .reduce((a, t) => a + t.amount, 0)
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500">
              <FiCheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed Withdrawals</p>
              <p className="font-bold text-gray-800">
                ${fmt(totalWithdrawn)}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-800 text-sm">
              Transaction History
            </h3>
            <span className="text-xs text-gray-400">
              {transactions.length} total
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">
              No transactions yet
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-sm">
                  <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Type</th>
                      <th className="px-5 py-3 text-left">Note</th>
                      <th className="px-5 py-3 text-left">Amount</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((tx, i) => (
                      <tr key={tx._id || i} className="border-t hover:bg-gray-50">
                        {/* Type */}
                        <td className="px-5 py-3 font-medium text-gray-700 whitespace-nowrap">
                          {tx.type}
                        </td>

                        {/* Note */}
                        <td className="px-5 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                          {tx.note || "—"}
                        </td>

                        {/* Amount */}
                        <td className={`px-5 py-3 whitespace-nowrap ${getTxStyle(tx.amount)}`}>
                          {getTxPrefix(tx.amount)}$
                          {fmt(Math.abs(tx.amount), 4)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                              tx.status
                            )}`}
                          >
                            {getStatusIcon(tx.status)}
                            {tx.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(
                            tx.createdAt || tx.date
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions.length > 10 && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => setShowAll((s) => !s)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {showAll
                      ? "Show less"
                      : `View all ${transactions.length} transactions`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Withdrawal modal */}
      {showWithdrawal && (
        <WithdrawalModal
          balance={balance}
          minWithdraw={minWithdraw}
          onClose={() => setShowWithdrawal(false)}
          onSubmitted={fetchAll}
        />
      )}
    </ChildPanelLayout>
  );
  }
