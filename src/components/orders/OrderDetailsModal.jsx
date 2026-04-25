// src/components/orders/OrderDetailsModal.jsx

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">

        <h2 className="text-xl font-bold mb-4">Order Details</h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Order ID:</strong>{" "}
            #{order.customOrderId || order._id?.slice(-6)}
          </p>

          <p>
            <strong>Service ID:</strong>{" "}
            {order.serviceId || "—"}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {order.category || "—"}
          </p>

          <p>
            <strong>Service Name:</strong>{" "}
            {order.service || "—"}
          </p>

          <p>
            <strong>Rate / 1K:</strong>{" "}
            {order.rate !== undefined && order.rate !== null
              ? `$${Number(order.rate).toFixed(4)}`
              : "—"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
