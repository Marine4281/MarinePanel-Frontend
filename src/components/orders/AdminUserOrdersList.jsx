//src/components/orders/AdminUserOrdersList.jsx
const statusStyles = {
  pending: "bg-yellow-100 text-yellow-600",
  processing: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-200 text-gray-600",
  cancelled: "bg-gray-200 text-gray-600",
};

const AdminUserOrdersList = ({
  orders,
  loading,
  processingId,
  progressInput,
  setProgressInput,
  updateStatus,
  updateProgress,
  refundOrder,
}) => {
  if (loading) return <p>Loading orders...</p>;

  if (!orders.length)
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        No orders found
      </div>
    );

  return orders.map((order) => {
    const created = order.createdAt ? new Date(order.createdAt) : null;

    const progress =
      ((order.quantityDelivered || 0) / (order.quantity || 1)) * 100;

    const locked =
      order.status === "refunded" || order.status === "completed";

    const ratePerK =
      order.rate != null
        ? Number(order.rate).toFixed(4)
        : order.charge != null && order.quantity
        ? ((Number(order.charge) / Number(order.quantity)) * 1000).toFixed(4)
        : null;

    return (
      <div
        key={order._id}
        className="bg-white p-6 mb-5 rounded-2xl shadow-sm border border-gray-100"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-sm text-gray-700">
            {order.orderId || order._id}
            {" | "}
            {order.customOrderId || "—"}
          </span>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        {/* ORDER INFO */}
        <div className="space-y-1 text-sm text-gray-700">
          <p>
            <strong>Email:</strong> {order.userId?.email}
          </p>

          <p>
            <strong>User Balance:</strong>{" "}
            ${order.userId?.balance?.toFixed(4) || "0.0000"}
          </p>

          <p>
            <strong>Service:</strong> {order.service}
          </p>

          <p>
            <strong>Service ID:</strong> {order.serviceId || "—"}
          </p>

          <p>
            <strong>Category:</strong> {order.category || "—"}
          </p>

          <p>
            <strong>Rate/K:</strong>{" "}
            {ratePerK != null ? `$${ratePerK}` : "—"}
          </p>

          <p>
            <strong>Provider:</strong> {order.provider || "N/A"}
          </p>

          <p>
            <strong>Link:</strong>{" "}
            <a
              href={order.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {order.link}
            </a>
          </p>

          <p>
            <strong>Charge:</strong> ${order.charge}
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {created
              ? created.toLocaleDateString() + " " + created.toLocaleTimeString()
              : "N/A"}
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mt-4">
          <p className="text-sm mb-1">
            <strong>Progress:</strong>{" "}
            {order.quantityDelivered || 0} / {order.quantity}
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* PROGRESS UPDATE */}
        {!locked && (
          <div className="flex gap-3 mt-4">
            <input
              type="number"
              min={0}
              max={order.quantity}
              placeholder="Delivered"
              value={progressInput[order._id] ?? ""}
              onChange={(e) =>
                setProgressInput({
                  ...progressInput,
                  [order._id]: e.target.value,
                })
              }
              className="px-3 py-1 border rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              disabled={processingId === order._id}
              onClick={() => updateProgress(order)}
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Update
            </button>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["pending", "processing", "completed", "failed"].map((s) => (
            <button
              key={s}
              disabled={locked || processingId === order._id}
              onClick={() => updateStatus(order._id, s)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-40"
            >
              {s}
            </button>
          ))}

          {!locked && (
            <>
              <button
                disabled={processingId === order._id}
                onClick={() => refundOrder(order, "full")}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Full Refund
              </button>

              {order.quantityDelivered > 0 &&
                order.quantityDelivered < order.quantity && (
                  <button
                    disabled={processingId === order._id}
                    onClick={() => refundOrder(order, "partial")}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    Partial Refund
                  </button>
                )}

              <button
                disabled={processingId === order._id}
                onClick={() => refundOrder(order, "custom")}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Custom Refund
              </button>
            </>
          )}
        </div>

        {/* FOOTER */}
        <p className="mt-4 text-xs text-gray-400">
          {created?.toLocaleDateString()} {created?.toLocaleTimeString()}
        </p>
      </div>
    );
  });
};

export default AdminUserOrdersList;
