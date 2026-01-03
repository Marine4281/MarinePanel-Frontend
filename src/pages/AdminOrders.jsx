// AdminOrders.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import debounce from "lodash.debounce";

const socket = io("https://marinepanel-backend.onrender.com");

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // items per page

  // --------------------------
  // Fetch paginated orders
  // --------------------------
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/admin/orders?search=${search}&page=${page}&limit=${limit}`
      );
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  }, [search, page]);

  // --------------------------
  // Fetch wallet stats (all users)
  // --------------------------
  const fetchWalletStats = useCallback(async () => {
    try {
      const { data } = await axios.get("/admin/orders/wallets/stats");
      setTotalMoney(data.totalBalance || 0);
      setTotalUsed(data.totalUsed || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // --------------------------
  // Debounced search
  // --------------------------
  const handleSearch = debounce((value) => {
    setPage(1);
    setSearch(value);
  }, 500);

  // --------------------------
  // Complete order
  // --------------------------
  const completeOrder = async (id) => {
    try {
      await axios.post(`/admin/orders/${id}/complete`);
      fetchOrders();
      fetchWalletStats();
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------
  // Refund order
  // --------------------------
  const refundOrder = async (id) => {
    try {
      await axios.post(`/admin/orders/${id}/refund`);
      fetchOrders();
      fetchWalletStats();
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------
  // Real-time updates
  // --------------------------
  useEffect(() => {
    fetchOrders();
    fetchWalletStats();

    socket.on("order:update", async () => {
      await fetchOrders();
      await fetchWalletStats();
    });

    socket.on("wallet:update", () => {
      fetchWalletStats();
    });

    return () => {
      socket.off("order:update");
      socket.off("wallet:update");
    };
  }, [fetchOrders, fetchWalletStats]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <header className="bg-white shadow rounded mb-6 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <span className="text-sm text-gray-500">Orders Management</span>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">Total Money in Users Wallets</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">${totalMoney.toFixed(2)}</h2>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">Total Money Used by Users</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">${totalUsed.toFixed(2)}</h2>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="Search by Order ID or User Email"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M16.65 10.5a6.15 6.15 0 11-12.3 0 6.15 6.15 0 0112.3 0z"
            />
          </svg>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">User Email</th>
                <th className="px-6 py-3 text-left">User Balance</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-left">Quantity</th>
                <th className="px-6 py-3 text-left">Link</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Progress</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const progress = ((order.quantityDelivered || 0) / (order.quantity || 1)) * 100;
                const userEmail = order.user?.email || "Unknown";
                const userBalance = order.user?.balance || 0;

                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order._id.slice(-6)}</td>
                    <td className="px-6 py-4">{userEmail}</td>
                    <td className="px-6 py-4 font-semibold">${userBalance.toFixed(2)}</td>
                    <td className="px-6 py-4">{order.service}</td>
                    <td className="px-6 py-4">{order.quantity}</td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <a href={order.link} className="text-blue-600 hover:underline">{order.link}</a>
                    </td>
                    <td className="px-6 py-4 font-semibold">${(order.charge || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold mb-1 text-gray-700">
                        {order.quantityDelivered || 0} / {order.quantity || 0}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progress === 100 ? "bg-green-600" : "bg-blue-600"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "completed" ? "bg-green-100 text-green-700" :
                          order.status === "refunded" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {["processing", "pending"].includes(order.status) ? (
                        <>
                          <button onClick={() => completeOrder(order._id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded">Complete</button>
                          <button onClick={() => refundOrder(order._id)} className="px-3 py-1 text-xs bg-red-600 text-white rounded">Refund</button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}