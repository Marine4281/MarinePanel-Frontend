// src/components/wallet/WalletBalance.jsx

import { useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";

const WalletBalance = ({
  balance,
  setBalance,
  setTransactions,
  onAddFunds,
  onWithdraw,
}) => {
  const { user } = useAuth();
  const { formatMoney, selected } = useCurrency();

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("wallet:update", ({ userId, balance: newBalance, transactions: newTxs }) => {
      if (String(userId) !== String(user._id)) return;

      setBalance(newBalance);

      if (Array.isArray(newTxs)) {
        const sorted = [...newTxs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTransactions(sorted);

        sorted
          .filter((tx) => tx.status === "Completed" && !tx.notified)
          .forEach((tx) => {
            toast.success(`Deposit of ${formatMoney(tx.amount, 4)} confirmed!`);
            tx.notified = true;
          });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setBalance, setTransactions, formatMoney]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
      {/* Balance */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Wallet Balance
        </h2>

        <p className="text-4xl font-bold text-green-600">
          {formatMoney(balance, 4)}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {selected?.code === "USD" || !selected?._id
            ? "Base currency (USD)"
            : `Displayed in ${selected.code}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAddFunds}
          className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition"
        >
          + Add Funds
        </button>

        <button
          onClick={onWithdraw}
          className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WalletBalance;
