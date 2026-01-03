import { useEffect, useState } from "react";
import API from "../../api/axios"; // ✅ use your axios instance
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await API.get("/payment-methods"); // ✅ call your backend
        setMethods(response.data);
      } catch (err) {
        toast.error("Failed to load payment methods");
      }
    };
    fetchMethods();
  }, []);

  const handleDeposit = async () => {
    if (!amount || !selectedMethod) return toast.error("Enter amount and select method");

    try {
      await API.post("/wallet/deposit", {
        amount: Number(amount),
        method: selectedMethod.name,
      });
      toast.success("Deposit request submitted");
      setAmount("");
      setSelectedMethod(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Deposit failed");
    }
  };

  const handleWithdraw = () => {
    toast("Withdrawal coming soon", { icon: "⏳" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24">
      <Header />

      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-6">
        {/* Deposit Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Deposit</h2>

          <input
            type="number"
            placeholder="Enter Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-xl mb-4"
          />

          <select
            value={selectedMethod?.name || ""}
            onChange={(e) => {
              const method = methods.find((m) => m.name === e.target.value);
              setSelectedMethod(method);
            }}
            className="w-full p-3 border rounded-xl"
          >
            <option value="">Select Payment Method</option>
            {methods.map((m) => (
              <option key={m._id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {selectedMethod?.description && (
            <p className="mt-2 text-gray-500 italic">{selectedMethod.description}</p>
          )}

          <button
            onClick={handleDeposit}
            className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600"
          >
            Proceed to Payment
          </button>
        </div>

        {/* Withdraw */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Withdraw</h2>
          <button
            onClick={handleWithdraw}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600"
          >
            Withdraw Funds
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentMethods;