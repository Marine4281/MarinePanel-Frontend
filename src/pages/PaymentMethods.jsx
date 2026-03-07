import { useEffect, useState } from "react";
import API from "../../api/axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";
import { FaCheckCircle, FaBitcoin, FaUniversity } from "react-icons/fa";
import { SiTether, SiBinance } from "react-icons/si";

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await API.get("/payment-methods");
        setMethods(response.data);
      } catch (err) {
        toast.error("Failed to load payment methods");
      }
    };
    fetchMethods();
  }, []);

  const handleDeposit = async () => {
    if (!amount || !selectedMethod)
      return toast.error("Enter amount and select method");

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

  const getIcon = (name) => {
    switch (name.toLowerCase()) {
      case "bitcoin":
        return <FaBitcoin className="text-orange-500 text-2xl" />;
      case "usdt":
        return <SiTether className="text-green-500 text-2xl" />;
      case "binance":
        return <SiBinance className="text-yellow-500 text-2xl" />;
      case "bank":
        return <FaUniversity className="text-blue-500 text-2xl" />;
      default:
        return <FaUniversity className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24">
      <Header />

      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-6">

        {/* Deposit */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            Deposit Funds
          </h2>

          <input
            type="number"
            placeholder="Enter Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-xl mb-6 focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <p className="font-medium mb-3 text-gray-600">
            Select Payment Method
          </p>

          {/* Payment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {methods.map((method) => {

              const active = selectedMethod?._id === method._id;

              return (
                <div
                  key={method._id}
                  onClick={() => setSelectedMethod(method)}
                  className={`cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all
                  
                  ${active
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-orange-400 hover:shadow-sm"
                  }
                  
                  `}
                >

                  <div className="flex items-center gap-3">

                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getIcon(method.name)}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {method.name}
                      </p>

                      {method.description && (
                        <p className="text-xs text-gray-500">
                          {method.description}
                        </p>
                      )}
                    </div>

                  </div>

                  {active && (
                    <FaCheckCircle className="text-orange-500 text-xl" />
                  )}

                </div>
              );
            })}

          </div>

          <button
            onClick={handleDeposit}
            className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition"
          >
            Proceed to Payment
          </button>

        </div>

        {/* Withdraw */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            Withdraw Funds
          </h2>

          <button
            onClick={handleWithdraw}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition"
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
