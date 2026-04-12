import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";

import UserOrdersFilters from "../components/orders/UserOrdersFilters";
import UserOrdersStats from "../components/orders/UserOrdersStats";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

const Orders = () => {
  const [orders, setOrders] = useState([]);

  /* ✅ FILTER STATES */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ✅ PAGINATION */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ===============================
     FETCH ORDERS
  =============================== */
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders", {
        params: {
          search,
          status,
          fromDate,
          toDate,
          page,
          limit: 10,
        },
      });

      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      console.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  /* 🔥 FILTER TRIGGER */
  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  /* ===============================
     SOCKET
  =============================== */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) socket.emit("join_user_room", user._id);
  }, []);

  useEffect(() => {
    socket.on("orderUpdated", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId
            ? { ...o, status: data.status, quantityDelivered: data.delivered }
            : o
        )
      );
    });

    return () => socket.off("orderUpdated");
  }, []);

  /* ===============================
     HELPERS
  =============================== */
  const shortenService = (service) =>
    service?.split(" ").slice(0, 2).join(" ") || "Service";

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      partial: "bg-indigo-100 text-indigo-700",
      failed: "bg-red-100 text-red-700",
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

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto mt-6 flex-1 px-4 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">My Orders</h2>
            <Link
              to="/home"
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            >
              + New Order
            </Link>
          </div>

          {/* ✅ FILTERS */}
          <UserOrdersFilters
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            onSearch={handleSearch}
          />

          {/* ✅ STATS */}
          <UserOrdersStats
            fromDate={fromDate}
            toDate={toDate}
          />

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-100 text-xs uppercase">
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

              <tbody>
                {orders.map((order) => {
                  const progress = Math.min(
                    ((order.quantityDelivered || 0) /
                      (order.quantity || 1)) *
                      100,
                    100
                  );

                  return (
                    <tr key={order._id}>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        #{order.customOrderId || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {shortenService(order.service)}
                      </td>

                      <td className="px-4 py-3">
                        <a
                          href={order.link}
                          target="_blank"
                          className="text-blue-500"
                        >
                          View
                        </a>
                      </td>

                      <td className="px-4 py-3">
                        {order.quantityDelivered || 0}/{order.quantity}
                        <div className="w-full bg-gray-200 h-2 mt-1 rounded">
                          <div
                            className="h-2 bg-blue-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        ${Number(order.charge).toFixed(4)}
                      </td>

                      <td className="px-4 py-3">
                        {statusBadge(order.status)}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION */}
          <div className="flex justify-between mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
