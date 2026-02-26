import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

const AdminUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const updateStatus = async (id, status) => {
    try {
      await API.post(`/admin/user-orders/${id}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const refundOrder = async (id) => {
    try {
      await API.post(`/admin/user-orders/${id}/refund`);
      toast.success("Refund successful");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "completed":
        return "#16a34a";
      case "processing":
        return "#2563eb";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#dc2626";
      case "refunded":
        return "#6b7280";
      default:
        return "#000";
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>User Orders</h2>

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search by Order ID or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "300px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={fetchOrders}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
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
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <div style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}>
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: "#fff",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{order.orderId || order._id}</strong>
                <span style={{ color: statusColor(order.status), fontWeight: 600 }}>
                  {order.status}
                </span>
              </div>

              <p>Email: {order.userId?.email}</p>
              <p>Service: {order.service}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Charge: ${order.charge}</p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["pending", "processing", "completed", "failed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order._id, s)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      background: "#e5e7eb",
                    }}
                  >
                    {s}
                  </button>
                ))}

                {order.status !== "refunded" && (
                  <button
                    onClick={() => refundOrder(order._id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#dc2626",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Refund
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserOrders;
