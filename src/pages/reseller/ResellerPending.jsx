// src/pages/reseller/ResellerPending.jsx
import { useNavigate } from "react-router-dom";
import { FiClock } from "react-icons/fi";

export default function ResellerPending() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-lg rounded-xl p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
        <FiClock className="text-yellow-500 text-3xl" />
      </div>

      <h1 className="text-xl font-bold mb-2">Your Reseller Panel is on Pause</h1>

      <p className="text-sm text-gray-500 mb-6">
        Your panel was created but is still being finalized. This can take a
        little while — we'll activate it automatically as soon as it's ready.
        No further action is needed from you.
      </p>

      <button
        onClick={() => navigate("/support")}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg mb-3"
      >
        Contact Support
      </button>

      <button
        onClick={() => navigate("/home")}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg"
      >
        Back to Home
      </button>
    </div>
  );
}
