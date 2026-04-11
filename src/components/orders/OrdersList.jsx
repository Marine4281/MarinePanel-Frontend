const statusStyles = {
  pending: "bg-yellow-100 text-yellow-600",
  processing: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
};

const OrdersList = ({
  orders,
  loading,
  processingId,
  progressInput,
  setProgressInput,
  updateStatus,
  updateProgress,
  refundOrder,
}) => {
  if (loading) return <p>Loading...</p>;
  if (!orders.length)
    return <div className="bg-white p-6 rounded-xl">No orders</div>;

  return orders.map((order) => {
    const created = order.createdAt ? new Date(order.createdAt) : null;

    const progress =
      ((order.quantityDelivered || 0) / (order.quantity || 1)) * 100;

    const locked =
      order.status === "refunded" || order.status === "completed";

    return (
      <div
        key={order._id}
        className="bg-white p-6 mb-5 rounded-2xl shadow-sm"
      >
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">
              {order.orderId} | {order.customOrderId || "—"}
            </p>
            <p className="text-xs text-gray-400">{order.userId?.email}</p>
          </div>

          <span
            className={`px-3 py-1 text-xs rounded-full capitalize ${statusStyles[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        <div className="mt-3 text-sm">
          <p>Service: {order.service}</p>
          <p>Charge: ${order.charge}</p>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {["pending", "processing", "completed", "failed"].map((s) => (
            <button
              key={s}
              disabled={locked || processingId === order._id}
              onClick={() => updateStatus(order._id, s)}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              {s}
            </button>
          ))}

          {!locked && (
            <>
              <button
                onClick={() => refundOrder(order, "full")}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Refund
              </button>
            </>
          )}
        </div>
      </div>
    );
  });
};

export default OrdersList;
