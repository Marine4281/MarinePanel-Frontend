import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

import OrdersStats from "../components/orders/OrdersStats";
import OrdersFilters from "../components/orders/OrdersFilters";
import OrdersList from "../components/orders/OrdersList";

/* SOCKET */
const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

const socket = io(baseURL, { transports: ["websocket"] });

const AdminUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [progressInput, setProgressInput] = useState({});

  /* FETCH */
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/admin/user-orders`, {
        params: {
          search,
          status,
          fromDate,
          toDate,
          page,
          limit: 20,
        },
      });

      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  /* SOCKET */
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

  /* ACTIONS */
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

      if (isNaN(value)) return toast.error("Enter valid number");

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

  const refundOrder = async (order, type) => {
    let customAmount = null;

    if (type === "custom") {
      const input = window.prompt(
        `Enter custom refund amount (Max $${order.charge})`
      );
      if (!input) return;

      customAmount = Number(input);
      if (isNaN(customAmount) || customAmount <= 0)
        return toast.error("Invalid amount");
    }

    if (!window.confirm(`Refund ${type} for ${order.orderId}?`)) return;

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Sidebar />

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">User Orders</h2>

        <OrdersStats 
          search={search}
          status={status}
          fromDate={fromDate}
          toDate={toDate}
          />

        <OrdersFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onSearch={() => {
            setPage(1);
            fetchOrders();
          }}
        />

        <OrdersList
          orders={orders}
          loading={loading}
          processingId={processingId}
          progressInput={progressInput}
          setProgressInput={setProgressInput}
          updateStatus={updateStatus}
          updateProgress={updateProgress}
          refundOrder={refundOrder}
        />

        {/* Pagination */}
        <div className="flex justify-between mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
          >
            Previous
          </button>

          <span className="font-semibold">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserOrders;
