import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/admin/user-orders?search=${search}&page=${page}&limit=${limit}`
      );

      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, page]);

  // ===============================
  // Update Status
  // ===============================
  const updateStatus = async (orderId, status) => {
    try {
      await axios.post(`/api/admin/user-orders/${orderId}/status`, {
        status,
      });

      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  // ===============================
  // Update Progress
  // ===============================
  const updateProgress = async (orderId, quantityDelivered) => {
    try {
      await axios.post(`/api/admin/user-orders/${orderId}/progress`, {
        quantityDelivered,
      });

      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Progress update failed");
    }
  };

  // ===============================
  // Refund Order
  // ===============================
  const refundOrder = async (orderId, type) => {
    try {
      let customAmount = null;

      if (type === "custom") {
        customAmount = prompt("Enter refund amount");
        if (!customAmount) return;
      }

      await axios.post(`/api/admin/user-orders/${orderId}/refund`, {
        type,
        customAmount,
      });

      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Refund failed");
    }
  };

  return (
    <div className="p-4">

      <h2 className="text-xl font-bold mb-4">User Orders</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search order ID or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">

          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Link</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Delivered</th>
              <th className="p-2 border">Charge</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  No orders found
                </td>
              </tr>
            )}

            {!loading &&
              orders.map((order) => (
                <tr key={order._id}>

                  <td className="border p-2">{order.orderId}</td>

                  <td className="border p-2">
                    {order.userId?.email || "N/A"}
                  </td>

                  <td className="border p-2">{order.service}</td>

                  <td className="border p-2">
                    <a
                      href={order.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open
                    </a>
                  </td>

                  <td className="border p-2">{order.quantity}</td>

                  <td className="border p-2">
                    {order.quantityDelivered || 0}

                    {/* Manual progress */}
                    <button
                      className="ml-2 text-xs bg-blue-500 text-white px-2 py-1"
                      onClick={() => {
                        const val = prompt(
                          "Enter delivered quantity",
                          order.quantityDelivered || 0
                        );
                        if (val !== null) {
                          updateProgress(order._id, val);
                        }
                      }}
                    >
                      Edit
                    </button>
                  </td>

                  <td className="border p-2">
                    ${order.charge?.toFixed(2)}
                  </td>

                  <td className="border p-2">{order.status}</td>

                  <td className="border p-2 space-x-2">

                    <button
                      className="bg-yellow-500 text-white px-2 py-1"
                      onClick={() =>
                        updateStatus(order._id, "processing")
                      }
                    >
                      Processing
                    </button>

                    <button
                      className="bg-green-600 text-white px-2 py-1"
                      onClick={() =>
                        updateStatus(order._id, "completed")
                      }
                    >
                      Complete
                    </button>

                    <button
                      className="bg-red-600 text-white px-2 py-1"
                      onClick={() =>
                        updateStatus(order._id, "cancelled")
                      }
                    >
                      Cancel
                    </button>

                    <button
                      className="bg-purple-600 text-white px-2 py-1"
                      onClick={() =>
                        refundOrder(order._id, "partial")
                      }
                    >
                      Refund
                    </button>

                  </td>

                </tr>
              ))}

          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1"
        >
          Prev
        </button>

        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default AdminUserOrders;
