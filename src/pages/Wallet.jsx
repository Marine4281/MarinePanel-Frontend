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

export default function Wallet() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [balance,       setBalance]      = useState(0);
  const [transactions,  setTransactions] = useState([]);
  const [loading,       setLoading]      = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await API.get("/wallet");
        setBalance(res.data.balance || 0);
        const sorted = [...(res.data.transactions || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sorted);
      } catch {
        toast.error("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060a12" }}>
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#060a12" }}>
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-5">
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
}
