// src/components/ServiceDescriptionModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ServiceDescriptionModal = ({ service, onClose }) => {
  const navigate = useNavigate();

  if (!service) return null;

  const copyDescription = () => {
    navigator.clipboard.writeText(service.description || "");
    toast.success("Description copied");
  };

  const placeOrder = () => {
    navigate("/home", {
      state: {
        prefill: {
          platform: service.platform || "All",
          category: service.category || "",
          service: service.name || "",
          link: "",
          quantity: "",
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Service Description
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-line max-h-64 overflow-y-auto">
            {service.description || "No description available"}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-6">

            <button
              onClick={copyDescription}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg transition text-sm"
            >
              Copy
            </button>

            <button
              onClick={placeOrder}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition text-sm"
            >
              Place Order
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ServiceDescriptionModal;
