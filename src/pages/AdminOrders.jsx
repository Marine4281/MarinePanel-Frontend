import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import debounce from "lodash.debounce";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  /* ===============================
     FETCH ORDERS
  ==================================*/
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/admin/orders?search=${search}&page=${page}&limit=${limit}`
      );

      console.log("Fetched orders:", data.orders);

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
    }
  }, [search, page]);

  /* ===============================
     FETCH WALLET STATS
  ==================================*/
  const fetchWalletStats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "/admin/orders/wallets/stats"
      );

      setTotalMoney(data.totalBalance || 0);
      setTotalUsed(data.totalUsed || 0);
    } catch (err) {
      console.error("Wallet stats error:", err);
    }
  }, []);

  /* ===============================
     SEARCH (Debounced)
  ==================================*/
  const handleSearch = debounce((value) => {
    setPage(1);
    setSearch(value);
  }, 500);

  /* ===============================
     COMPLETE ORDER
  ==================================*/
  const completeOrder = async (id) => {
    try {
      await axios.post(`/admin/orders/${id}/complete`);
      fetchOrders(); // refresh table
      fetchWalletStats();
    } catch (err) {
      console.error(err);
    }
  };

  /* ===============================
     REFUND ORDER
  ==================================*/
  const refundOrder = async (id) => {
    try {
      await axios.post(`/admin/orders/${id}/refund`);
      fetchOrders(); // refresh table
      fetchWalletStats();
    } catch (err) {
      console.error(err);
    }
  };

  /* ===============================
     INITIAL LOAD
  ==================================*/
  useEffect(() => {
    fetchOrders();
    fetchWalletStats();
  }, [fetchOrders, fetchWalletStats]);

  /* ===============================
     SOCKET REALTIME
  ==================================*/
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
    });

    socket.on("order:update", () => {
      fetchOrders();
    });

    socket.on("order:new", () => {
      fetchOrders();
    });

    socket.on("wallet:update", () => {
      fetchWalletStats();
    });

    return () => socket.disconnect();
  }, [fetchOrders, fetchWalletStats]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <header className="bg-white shadow rounded mb-6 p-4 flex justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <span className="text-sm text-gray-500">
            Orders Management
          </span>
        </header>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">
              Total Money in Users Wallets
            </p>
            <h2 className="text-2xl font-bold mt-1">
              ${Number(totalMoney).toFixed(2)}
            </h2>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">
              Total Money Used
            </p>
            <h2 className="text-2xl font-bold mt-1">
              ${Number(totalUsed).toFixed(2)}
            </h2>
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="mb-6 w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search by Order ID or User Email"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">User Email</th>
                <th className="px-6 py-3 text-left">User Balance</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-left">Qty</th>
                <th className="px-6 py-3 text-left">Link</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Progress</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-6 text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}

              {orders.map((order) => {
                const progress =
                  ((order.quantityDelivered || 0) /
                    (order.quantity || 1)) *
                  100;

                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {order.orderId}
                    </td>

                    <td className="px-6 py-4">
                      {order.userId?.email || "Unknown"}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      $
                      {Number(
                        order.userId?.balance || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      {order.service}
                    </td>

                    <td className="px-6 py-4">
                      {order.quantity}
                    </td>

                    <td className="px-6 py-4 truncate max-w-xs">
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {order.link}
                      </a>
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      ${Number(order.charge || 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      {order.quantityDelivered || 0} /{" "}
                      {order.quantity || 0}
                      <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex gap-2">
                      {["processing", "pending"].includes(
                        order.status
                      ) && (
                        <>
                          <button
                            onClick={() =>
                              completeOrder(order._id)
                            }
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                          >
                            Complete
                          </button>

                          <button
                            onClick={() =>
                              refundOrder(order._id)
                            }
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                          >
                            Refund
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
          }                    
