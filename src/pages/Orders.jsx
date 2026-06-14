// src/pages/Orders.jsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";

import UserOrdersFilters from "../components/orders/UserOrdersFilters";
import UserOrdersStats from "../components/orders/UserOrdersStats";
import OrderActions from "../components/orders/OrderActions";

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

const STATUS_MAP = {
  pending:       "bg-yellow-100 text-yellow-700",
  processing:    "bg-blue-100 text-blue-700",
  "in progress": "bg-blue-100 text-blue-700",
  completed:     "bg-green-100 text-green-700",
  partial:       "bg-indigo-100 text-indigo-700",
  failed:        "bg-red-100 text-red-700",
  cancelled:     "bg-gray-200 text-gray-700",
  refunded:      "bg-gray-300 text-gray-700",
};

const statusBadge = (label) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
      STATUS_MAP[label?.toLowerCase()] || "bg-gray-100 text-gray-600"
    }`}
  >
    {label}
  </span>
);

const shortenService = (s) => s?.split(" ").slice(0, 2).join(" ") || "Service";
const shortenLink    = (l) => (l?.length > 35 ? l.slice(0, 35) + "..." : l || "");

const getPageNumbers = (page, totalPages) => {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const left  = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    if (left > 1)          pages.push(1, "...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) pages.push("...", totalPages);
  }

  return pages;
};

const Orders = () => {
  const [orders,      setOrders]      = useState([]);
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("");
  const [fromDate,    setFromDate]    = useState("");
  const [toDate,      setToDate]      = useState("");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedService, setExpandedService] = useState(null);

  /* ── FETCH ── */
  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("/orders/my-orders", {
        params: { search, status, fromDate, toDate, page, limit: 10 },
      });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.total || 0);
    } catch {
      console.error("Failed to load orders");
    }
  }, [search, status, fromDate, toDate, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ── SOCKET ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) socket.emit("join_user_room", user._id);
  }, []);

  useEffect(() => {
    // Backend emits "order:update" with { _id, status, quantityDelivered }
    socket.on("order:update", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id?.toString() === data._id?.toString()
            ? {
                ...o,
                status:            data.status            ?? o.status,
                quantityDelivered: data.quantityDelivered ?? o.quantityDelivered,
                displayStatus: data.providerStatus
                  ? data.providerStatus
                      .replace("inprogress", "In Progress")
                      .replace("in progress", "In Progress")
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : data.status ?? o.status,
                refundProcessed: data.refundProcessed ?? o.refundProcessed,
              }
            : o
        )
      );
    });

    return () => socket.off("order:update");
  }, []);

  /* ── LOCAL ORDER UPDATE (for OrderActions optimistic updates) ── */
  const updateOrder = (orderId, updates) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, ...updates } : o))
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto mt-6 flex-1 px-4 w-full pb-24">
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

          {/* FILTERS */}
          <UserOrdersFilters
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            onSearch={() => setPage(1)}
          />

          {/* STATS */}
          <UserOrdersStats fromDate={fromDate} toDate={toDate} />

          {/* TABLE */}
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
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center p-6 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}

                {orders.map((order) => {
                  const progress    = Math.min(
                    ((order.quantityDelivered || 0) / (order.quantity || 1)) * 100,
                    100
                  );
                  const isExpanded  = expandedService === order._id;
                  const statusLabel = order.displayStatus || order.status;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      {/* Order ID */}
                      <td className="px-4 py-3 font-bold text-blue-600">
                        #{order.customOrderId || "—"}
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() =>
                              setExpandedService(isExpanded ? null : order._id)
                            }
                            className="font-medium text-gray-800 cursor-pointer"
                          >
                            {isExpanded ? order.service : shortenService(order.service)}
                          </span>
                          {order.service?.length > 25 && (
                            <span className="text-blue-500 text-xs font-bold">
                              {isExpanded ? "^" : ">"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Link */}
                      <td className="px-4 py-3 max-w-xs truncate">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title={order.link}
                        >
                          {shortenLink(order.link)}
                        </a>
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-3">
                        {order.quantityDelivered || 0}/{order.quantity}
                        <div className="w-full bg-gray-200 h-2 mt-1 rounded">
                          <div
                            className="h-2 bg-blue-600 rounded"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>

                      {/* Charge */}
                      <td className="px-4 py-3">
                        ${Number(order.charge).toFixed(4)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {statusBadge(statusLabel)}

                          {order.status === "failed" && order.refundProcessed && (
                            <span className="text-xs font-semibold text-green-600">
                              Refunded
                            </span>
                          )}

                          {order.status === "partial" && order.refundProcessed && (
                            <span className="text-xs font-semibold text-green-600">
                              Partial Refund Processed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <OrderActions order={order} onUpdate={updateOrder} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {getPageNumbers(page, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                      page === p
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <span className="text-xs text-gray-400 ml-2">
                {totalOrders} total · Page {page} of {totalPages}
              </span>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
