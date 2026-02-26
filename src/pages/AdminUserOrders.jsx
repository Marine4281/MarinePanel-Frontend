import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

const AdminUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [progressInput, setProgressInput] = useState({});

  /* ================= FETCH ORDERS ================= */
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

  /* ================= UPDATE STATUS ================= */
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

  /* ================= UPDATE PROGRESS ================= */
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

  /* ================= REFUND ================= */
  const refundOrder = async (order) => {
    const email = order.userId?.email || "";
    const firstName = email.split("@")[0] || "User";

    const confirmRefund = window.confirm(
      `Refund $${order.charge} to ${firstName}?`
    );

    if (!confirmRefund) return;

    try {
      setProcessingId(order._id);
      await API.post(`/admin/user-orders/${order._id}/refund`);
      toast.success("Refund successful");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setProcessingId(null);
    }
  };

  /* ================= STATUS BADGE ================= */
  const statusBadge = (status) => {
    const map = {
      pending: "#f59e0b",
      processing: "#2563eb",
      completed: "#16a34a",
      failed: "#dc2626",
      refunded: "#6b7280",
      cancelled: "#6b7280",
    };

    return (
      <span
        style={{
          background: map[status] + "20",
          color: map[status] || "#000",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>User Orders</h2>

        {/* SEARCH */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search by Order ID or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "300px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={fetchOrders}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
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
                style={{
                  background: "#fff",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <strong>{order.orderId || order._id}</strong>
                  {statusBadge(order.status)}
                </div>

                <p><strong>Email:</strong> {order.userId?.email}</p>
                <p><strong>Service:</strong> {order.service}</p>
                <p><strong>Charge:</strong> ${order.charge}</p>

                {/* PROGRESS */}
                <p>
                  <strong>Progress:</strong>{" "}
                  {order.quantityDelivered || 0} / {order.quantity}
                </p>

                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "6px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "8px",
                      background: "#2563eb",
                      borderRadius: "6px",
                    }}
                  />
                </div>

                {!locked && (
                  <div style={{ display: "flex", gap: "10px" }}>
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
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        width: "120px",
                      }}
                    />

                    <button
                      disabled={processingId === order._id}
                      onClick={() => updateProgress(order)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#2563eb",
                        color: "#fff",
                        cursor: "pointer",
                        opacity:
                          processingId === order._id ? 0.6 : 1,
                      }}
                    >
                      Update
                    </button>
                  </div>
                )}

                {/* ACTIONS */}
                <div style={{ marginTop: "12px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["pending", "processing", "completed", "failed"].map((s) => (
                    <button
                      key={s}
                      disabled={locked || processingId === order._id}
                      onClick={() => updateStatus(order._id, s)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#e5e7eb",
                        cursor: "pointer",
                        opacity: locked ? 0.4 : 1,
                      }}
                    >
                      {s}
                    </button>
                  ))}

                  {!locked && order.quantityDelivered === 0 && (
                    <button
                      disabled={processingId === order._id}
                      onClick={() => refundOrder(order)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        cursor: "pointer",
                        opacity:
                          processingId === order._id ? 0.6 : 1,
                      }}
                    >
                      Refund
                    </button>
                  )}
                </div>

                <p style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
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
