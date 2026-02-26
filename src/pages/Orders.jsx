// pages/Orders.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, {
  transports: ["websocket"],
});

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [expandedService, setExpandedService] = useState(null);

  /* ===============================
     FETCH ORDERS
  =============================== */
  useEffect(() => {
    API.get("/orders/my-orders")
      .then((res) => setOrders(res.data || []))
      .catch(() => console.error("Failed to load orders"));
  }, []);

  /* ===============================
     SOCKET LIVE UPDATES
  =============================== */
  useEffect(() => {
    socket.on("order:update", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id
            ? {
                ...order,
                status: updatedOrder.status,
                quantityDelivered: updatedOrder.quantityDelivered,
              }
            : order
        )
      );
    });

    return () => socket.off("order:update");
  }, []);

  /* ===============================
     SHORT SERVICE NAME
  =============================== */
  const shortenService = (service) => {
    if (!service) return "Service";

    // Extract first two words only
    const words = service.split(" ");
    return words.slice(0, 2).join(" ");
  };

  /* ===============================
     STATUS BADGE
  =============================== */
  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-purple-100 text-purple-700",
      cancelled: "bg-gray-200 text-gray-600",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
          map[status?.toLowerCase()] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const displayedOrders = showAll ? orders : orders.slice(0, 4);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <main className="max-w-6xl mx-auto mt-6 flex-1 px-4 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Orders</h2>
            <Link
              to="/home"
              className="bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              + New Order
            </Link>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[900px]">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Charge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {displayedOrders.map((order) => {
                  const created = order.createdAt
                    ? new Date(order.createdAt)
                    : null;

                  const progress =
                    ((order.quantityDelivered || 0) /
                      (order.quantity || 1)) *
                    100;

                  const isExpanded = expandedService === order._id;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        #{order._id.slice(-6)}
                      </td>

                      {/* SERVICE */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {isExpanded
                              ? order.service
                              : shortenService(order.service)}
                          </span>

                          {order.service &&
                            order.service.length > 25 && (
                              <button
                                onClick={() =>
                                  setExpandedService(
                                    isExpanded ? null : order._id
                                  )
                                }
                                className="text-blue-500 text-sm font-bold hover:underline"
                              >
                                &gt;
                              </button>
                            )}
                        </div>
                      </td>

                      {/* LINK */}
                      <td className="px-4 py-3 max-w-xs truncate">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </td>

                      {/* PROGRESS */}
                      <td className="px-4 py-3">
                        {order.quantityDelivered || 0} / {order.quantity}
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                          <div
                            className="h-2 bg-blue-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>

                      {/* CHARGE */}
                      <td className="px-4 py-3 font-medium">
                        ${Number(order.charge).toFixed(2)}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        {statusBadge(order.status)}
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {created
                          ? created.toLocaleDateString() +
                            " " +
                            created.toLocaleTimeString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View More / Less */}
          {orders.length > 4 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                {showAll ? "View Less" : "View More"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
