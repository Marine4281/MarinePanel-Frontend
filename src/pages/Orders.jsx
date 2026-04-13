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

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [expandedService, setExpandedService] = useState(null);

  const [loadingAction, setLoadingAction] = useState(null); // 🔥 button loader

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
  }, [page, search, status, fromDate, toDate]);

  const handleSearch = () => setPage(1);

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
            ? {
                ...o,
                status: data.status,
                quantityDelivered: data.delivered,
              }
            : o
        )
      );
    });

    return () => socket.off("orderUpdated");
  }, []);

  /* ===============================
     ACTIONS
  =============================== */
  const handleCancel = async (orderId) => {
    try {
      setLoadingAction(orderId);

      await API.post(`/orders/${orderId}/cancel`);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, cancelRequested: true, cancelStatus: "pending" }
            : o
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRefill = async (orderId) => {
    try {
      setLoadingAction(orderId);

      await API.post(`/orders/${orderId}/refill`);

      alert("Refill request sent");
    } catch (err) {
      alert(err.response?.data?.message || "Refill failed");
    } finally {
      setLoadingAction(null);
    }
  };

  /* ===============================
     HELPERS
  =============================== */
  const shortenService = (service) =>
    service?.split(" ").slice(0, 2).join(" ") || "Service";

  const shortenLink = (link) =>
    link?.length > 35 ? link.slice(0, 35) + "..." : link;

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      partial: "bg-indigo-100 text-indigo-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-gray-200 text-gray-700",
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

  const renderAction = (order) => {
    // 🔴 CANCEL (pending/processing only)
    if (
      ["pending", "processing"].includes(order.status) &&
      !order.cancelRequested
    ) {
      return (
        <button
          onClick={() => handleCancel(order._id)}
          disabled={loadingAction === order._id}
          className="text-xs bg-red-500 text-white px-3 py-1 rounded"
        >
          {loadingAction === order._id ? "..." : "Cancel"}
        </button>
      );
    }

    // 🟡 CANCEL STATUS
    if (order.cancelRequested) {
      const map = {
        pending: "Cancel requested",
        processing: "Cancelling...",
        success: "Cancelled",
        failed: "Cancel failed",
      };

      return (
        <span className="text-xs text-gray-600">
          {map[order.cancelStatus] || "Canceling..."}
        </span>
      );
    }

    // 🟢 REFILL (completed only)
    if (order.status === "completed") {
      return (
        <button
          onClick={() => handleRefill(order._id)}
          disabled={loadingAction === order._id}
          className="text-xs bg-green-600 text-white px-3 py-1 rounded"
        >
          {loadingAction === order._id ? "..." : "Refill"}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto mt-6 flex-1 px-4 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">My Orders</h2>
            <Link
              to="/home"
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            >
              + New Order
            </Link>
          </div>

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

          <UserOrdersStats fromDate={fromDate} toDate={toDate} />

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Charge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th> {/* 🔥 NEW */}
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

                  const isExpanded = expandedService === order._id;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-blue-600">
                        #{order.customOrderId || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div
                          onClick={() =>
                            setExpandedService(isExpanded ? null : order._id)
                          }
                          className="cursor-pointer"
                        >
                          {isExpanded
                            ? order.service
                            : shortenService(order.service)}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs truncate">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {shortenLink(order.link)}
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

                      <td className="px-4 py-3">
                        {renderAction(order)}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center p-6 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
