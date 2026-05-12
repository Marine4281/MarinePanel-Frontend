// src/pages/Wallet.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletBalance from "../components/wallet/WalletBalance";
import TransactionHistory from "../components/wallet/TransactionHistory";
import API from "../api/axios";
import toast from "react-hot-toast";

const Wallet = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [balance,      setBalance]      = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWallet = async () => {
      try {
        const res = await API.get("/wallet");
        setBalance(res.data.balance || 0);
        const sorted = [...(res.data.transactions || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sorted);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col pb-24">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto mt-8 px-4 space-y-6">
        <WalletBalance
          balance={balance}
          setBalance={setBalance}
          setTransactions={setTransactions}
          onAddFunds={() => navigate("/add-funds")}
          onWithdraw={() => toast("Withdrawal coming soon", { icon: "⏳" })}
        />

        <TransactionHistory transactions={transactions} />
      </main>

      <Footer />
    </div>
  );
};

export default Wallet;
