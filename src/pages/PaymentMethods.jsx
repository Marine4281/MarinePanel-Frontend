import { useEffect, useState } from "react";
import API from "../../api/axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24">
      <Header />

      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-6">

        {/* Deposit */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            Deposit
          </h2>

          <input
            type="number"
            placeholder="Enter Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-xl mb-5"
          />

          {/* Modern Payment Selector */}
          <div className="grid gap-3">

            {methods.map((method) => {

              const active = selectedMethod?._id === method._id;

              return (
                <div
                  key={method._id}
                  onClick={() => setSelectedMethod(method)}
                  className={`cursor-pointer border rounded-xl p-4 flex justify-between items-center transition
                  
                  ${active
                    ? "border-orange-500 bg-orange-50"
                    : "hover:border-gray-400"
                  }
                  
                  `}
                >

                  <div>
                    <p className="font-semibold">
                      {method.name}
                    </p>

                    {method.description && (
                      <p className="text-sm text-gray-500">
                        {method.description}
                      </p>
                    )}
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
            className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600"
          >
            Proceed to Payment
          </button>

        </div>

        {/* Withdraw */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            Withdraw
          </h2>

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
