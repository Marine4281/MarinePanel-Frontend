import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios"; // ✅ your axios instance
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {io} from "socket.io-client"
// Flag selector import for mobile money (you can add country flags)
import countryList from "react-select-country-list";
import Select from "react-select";

const Wallet = () => {
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [actionType, setActionType] = useState("add"); // 'add' or 'withdraw'
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [methodDescription, setMethodDescription] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [countryOptions, setCountryOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // ================= FETCH WALLET =================
  const fetchWallet = async () => {
    try {
      const response = await API.get("/wallet");
      setBalance(response.data.balance);
      // Sort newest first
      const sortedTransactions = (response.data.transactions || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("WALLET ERROR:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to load wallet");
    }
  };


  // ================= FETCH PAYMENT METHODS =================
  const fetchPaymentMethods = async () => {
    try {
      const response = await API.get("/payment-methods");
      setPaymentMethods(response.data.methods || []);
    } catch (error) {
      console.error("PAYMENT METHODS ERROR:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to load payment methods");
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchPaymentMethods();
      setCountryOptions(countryList().getData());

      // 🔔 Initialize Socket.IO
      const socket = io(import.meta.env.VITE_API_URL); // change URL if deployed

      // Listen for wallet updates
      socket.on("wallet:update", ({ userId, balance: newBalance, transactions: newTxs }) => {
        if (userId === user._id) {
          setBalance(newBalance);
          if (newTxs) {
            const sortedTransactions = newTxs.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setTransactions(sortedTransactions);
          }
        }
      });

      // Cleanup on unmount
      return () => socket.disconnect();
    }
  }, [user]);

  // ================= ADD FUNDS =================
  const handleAddFunds = async () => {
    if (!amount || !method) {
      return toast.error("Enter amount and select payment method");
    }

    try {
      const selectedMethod = paymentMethods.find((m) => m.name === method);

      // Add selected country for mobile money if available
      const detailsWithCountry = { ...paymentDetails };
      if ((selectedMethod.type === "mobile-money" || selectedMethod.type === "mpesa") && selectedCountry) {
        detailsWithCountry.country = selectedCountry.value;
      }

      const response = await API.post("/payment/initialize", {
        amount: Number(amount),
        methodId: selectedMethod?._id,
        paymentDetails: detailsWithCountry,
      });

      toast.success(response.data.message);
      setAmount("");
      setMethod("");
      setMethodDescription("");
      setPaymentDetails({});
      setSelectedCountry(null);
      fetchWallet();
      // 🔹 Redirect to Paystack checkout page
    window.location.href = response.data.authorization_url;

    } catch (error) {
      console.error("ADD FUNDS ERROR:", error.response || error);
      toast.error(error.response?.data?.message || "Deposit failed");
    }
  };

  // ================= WITHDRAW FUNDS =================
  const handleWithdraw = () => {
    toast("Withdrawal coming soon", { icon: "⏳" });
  };

  // Get transactions to display (latest 3 or all)
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 3);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col pb-24">
      <Header />
      <main className="flex-1 max-w-4xl mt-8  space-y-6">
        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-lg text-gray-500">Wallet Balance</h2>
            <p className="text-3xl font-bold text-green-600">${Number(balance).toFixed(2)}</p>
          </div>
          <div className="flex gap-4">
            <button
              className={`px-6 py-3 rounded-xl text-white ${actionType === "add" ? "bg-green-600" : "bg-green-500"}`}
              onClick={() => setActionType("add")}
            >
              Add Funds
            </button>
            <button
              className={`px-6 py-3 rounded-xl text-white ${actionType === "withdraw" ? "bg-red-600" : "bg-red-500"}`}
              onClick={() => setActionType("withdraw")}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Add Funds Section */}
        {actionType === "add" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Add Funds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Enter Amount (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400"
              />
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  const selected = paymentMethods.find((m) => m.name === e.target.value);
                  setMethodDescription(selected?.description || "");
                  setPaymentDetails({});
                  setSelectedCountry(null);
                }}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 shadow-xl"
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((m) => (
                  <option key={m._id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {methodDescription && <p className="mt-2 text-gray-500 italic">{methodDescription}</p>}

            {/* Dynamic Form Fields Based on Method Type */}
            {method && (() => {
              const selected = paymentMethods.find((m) => m.name === method);
              if (!selected) return null;

              switch (selected.type) {
                case "card":
                  return (
                    <div className="space-y-3 mt-4">
                      <select
                        className="w-full p-3 border rounded-xl"
                        value={paymentDetails.cardType || ""}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, cardType: e.target.value })
                        }
                      >
                        <option value="">Select Card Type</option>
                        <option value="Visa">Visa</option>
                        <option value="Verve">Verve</option>
                        <option value="MasterCard">MasterCard</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full p-3 border rounded-xl"
                        value={paymentDetails.cardNumber || ""}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Expiry MM/YY"
                          className="w-full p-3 border rounded-xl"
                          value={paymentDetails.expiry || ""}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, expiry: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="w-full p-3 border rounded-xl"
                          value={paymentDetails.cvv || ""}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, cvv: e.target.value })
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        className="w-full p-3 border rounded-xl"
                        value={paymentDetails.cardName || ""}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, cardName: e.target.value })
                        }
                      />
                    </div>
                  );

                case "mobile-money":
                case "mpesa":
                  return (
                    <div className="space-y-3 mt-4">
                      <select
                        className="w-full p-3 border rounded-xl"
                        value={paymentDetails.network || ""}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, network: e.target.value })
                        }
                      >
                        <option value="">Select Mobile Money Network</option>
                        <option value="Mpesa">Mpesa</option>
                        <option value="MoMo">MoMo</option>
                        <option value="Airtel Money">Airtel Money</option>
                      </select>
                      <label className="block font-semibold mb-1">Phone</label>
                      <PhoneInput
                        country={paymentDetails.country || "ke"}
                        value={paymentDetails.phone || ""}
                        onChange={(phone, data) => {
                          setPaymentDetails({
                            ...paymentDetails,
                            phone: phone,
                            country: data.countryCode.toUpperCase(),
                          });
                        }}
                        inputClass="w-full p-3 rounded-xl border"
                      />
                    </div>
                  );

                case "bank":
                  return (
                    <div className="space-y-3 mt-4">
                      <input
                        type="text"
                        placeholder="Bank Name"
                        className="w-full p-3 border rounded-xl"
                        value={paymentDetails.bankName || ""}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, bankName: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Account Number"
                        className="w-full p-3 border rounded-xl"
                        value={paymentDetails.accountNumber || ""}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })
                        }
                      />
                    </div>
                  );

                case "manual":
                  return (
                    <div className="mt-4 p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg text-yellow-700">
                      Please visit our support to deposit manually.
                    </div>
                  );

                default:
                  return null;
              }
            })()}

            <button
              onClick={handleAddFunds}
              className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600"
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {/* Withdraw Section */}
        {actionType === "withdraw" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Withdraw Funds</h3>
            <input
              type="number"
              placeholder="Enter Amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 mb-4"
            />
            <button
              onClick={handleWithdraw}
              className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600"
            >
              Proceed to Withdraw
            </button>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                )}
                {displayedTransactions.map((tx) => (
                  <tr key={tx._id} className="border-t">
                    <td className="p-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{tx.type}</td>
                    <td className={`p-3 ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : "-"} ${Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td
                      className={`p-3 ${
                        tx.status === "Completed"
                          ? "text-green-600"
                          : tx.status === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length > 3 && (
              <div className="mt-4 text-center">
                <button
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                >
                  {showAllTransactions ? "Show Less" : "View All"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wallet;
