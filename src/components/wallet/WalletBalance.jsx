// src/components/wallet/WalletBalance.jsx
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const WalletBalance = ({ balance, setBalance, setTransactions, onAddFunds, onWithdraw }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("wallet:update", ({ userId, balance: newBalance, transactions: newTxs }) => {
      if (String(userId) !== String(user._id)) return;

      setBalance(newBalance);

      if (newTxs) {
        const sorted = [...newTxs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
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
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center gap-6">

      {/* Balance */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Wallet Balance
        </h2>
        <p className="text-4xl font-bold text-green-600">
          ${Number(balance).toFixed(4)}
        </p>
        <p className="text-xs text-gray-400 mt-1">USD · Updates in real-time</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAddFunds}
          className="px-6 py-3 rounded-xl text-white font-semibold text-sm bg-green-500 hover:bg-green-600 transition"
        >
          + Add Funds
        </button>
        <button
          onClick={onWithdraw}
          className="px-6 py-3 rounded-xl text-white font-semibold text-sm bg-red-500 hover:bg-red-600 transition"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WalletBalance;
