import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

/* SOCKET CONNECTION */
const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, {
  transports: ["websocket"],
});

const AdminUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [progressInput, setProgressInput] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/admin/user-orders?search=${search}&page=1&limit=20`
      );
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ===============================
     SOCKET LIVE UPDATES
  =============================== */
  useEffect(() => {
    socket.on("orderUpdated", (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId
            ? {
                ...order,
                status: data.status,
                quantityDelivered: data.delivered,
              }
            : order
        )
      );
    });

    return () => socket.off("orderUpdated");
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setProcessingId(id);
      await API.post(`/admin/user-orders/${id}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProcessingId(null);
    }
  };

  const updateProgress = async (order) => {
    try {
      const value = Number(progressInput[order._id]);

      if (isNaN(value)) {
        return toast.error("Enter valid number");
      }

      setProcessingId(order._id);

      await API.patch(`/admin/user-orders/${order._id}/progress`, {
        quantityDelivered: value,
      });

      toast.success("Progress updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update progress");
    } finally {
      setProcessingId(null);
    }
  };

  /* ===============================
     REFUND HANDLER
  =============================== */
  const refundOrder = async (order, type) => {
    const email = order.userId?.email || "";
    const firstName = email.split("@")[0] || "User";

    let customAmount = null;

    if (type === "custom") {
      const input = window.prompt(
        `Enter custom refund amount (Max $${order.charge})`
      );

      if (!input) return;

      customAmount = Number(input);

      if (isNaN(customAmount) || customAmount <= 0) {
        return toast.error("Invalid refund amount");
      }
    }

    const confirmRefund = window.confirm(
      `Refund (${type}) for order ${order.orderId} to ${firstName}?`
    );

    if (!confirmRefund) return;

    try {
      setProcessingId(order._id);

      await API.post(`/admin/user-orders/${order._id}/refund`, {
        type,
        customAmount,
      });

      toast.success("Refund successful");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setProcessingId(null);
    }
  };

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-600",
    processing: "bg-blue-100 text-blue-600",
    completed: "bg-green-100 text-green-600",
    failed: "bg-red-100 text-red-600",
    refunded: "bg-gray-200 text-gray-600",
    cancelled: "bg-gray-200 text-gray-600",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Sidebar />

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">User Orders</h2>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by Order ID or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 w-72 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchOrders}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            No orders found
          </div>
        ) : (
          orders.map((order) => {
            const created = order.createdAt
              ? new Date(order.createdAt)
              : null;

            const progress =
              ((order.quantityDelivered || 0) /
                (order.quantity || 1)) *
              100;

            const locked =
              order.status === "refunded" ||
              order.status === "completed";

            return (
              <div
                key={order._id}
                className="bg-white p-6 mb-5 rounded-2xl shadow-sm border border-gray-100"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm text-gray-700">
                    {order.orderId || order._id}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Info */}
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Email:</strong> {order.userId?.email}</p>

                  <p>
                    <strong>User Balance:</strong>{" "}
                    ${order.userId?.balance?.toFixed(4) || "0.0000"}
                  </p>

                  <p><strong>Service:</strong> {order.service}</p>

                  <p>
                    <strong>Provider:</strong>{" "}
                    {order.provider || "N/A"}
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

                  <p><strong>Charge:</strong> ${order.charge}</p>

                  <p>
                    <strong>Created:</strong>{" "}
                    {created
                      ? created.toLocaleDateString() +
                        " " +
                        created.toLocaleTimeString()
                      : "N/A"}
                  </p>
                </div>

                {/* Progress */}
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

                {/* Progress Update */}
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

                {/* Actions */}
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

                <p className="mt-4 text-xs text-gray-400">
                  {created?.toLocaleDateString()}{" "}
                  {created?.toLocaleTimeString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminUserOrders;
