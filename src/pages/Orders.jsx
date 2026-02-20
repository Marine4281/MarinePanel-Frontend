// pages/Orders.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";

// Connect Socket.IO
const socket = io("https://your-backend-url"); // Replace with your backend URL

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Fetch orders once
  useEffect(() => {
    API.get("/orders/my-orders")
      .then((res) => setOrders(res.data))
      .catch(() => console.error("Failed to load orders"));
  }, []);

  // Listen for live order updates from webhook
  useEffect(() => {
    socket.on("order:update", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder.orderId
            ? { ...order, status: updatedOrder.status, quantityDelivered: updatedOrder.quantityDelivered }
            : order
        )
      );
    });

    return () => socket.off("order:update");
  }, []);

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-gray-200 text-gray-600",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
        {status}
      </span>
    );
  };

  const displayedOrders = showAll ? orders : orders.slice(0, 2);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <main className="max-w-6xl mt-6 flex-1">
        <div className="bg-white rounded-2xl shadow-lg p-6">

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
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Charge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {displayedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{order._id.slice(-6)}</td>
                    <td className="px-4 py-3">{order.service}</td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3">${Number(order.charge).toFixed(2)}</td>
                    <td className="px-4 py-3">{statusBadge(order.status)}</td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View more / View less */}
          {orders.length > 2 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 pb-10 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                {showAll ? "View less" : "View more"}
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
