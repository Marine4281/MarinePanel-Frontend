import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const AdminUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/admin/user-orders?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", res.data);

      // ✅ Safe handling (prevents white screen crash)
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/admin/user-orders/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchOrders();
    } catch (err) {
      console.error("Update Status Error:", err);
      alert("Failed to update status");
    }
  };

  const refundOrder = async (id) => {
    if (!window.confirm("Are you sure you want to refund this order?"))
      return;

    try {
      await axios.post(
        `/api/admin/user-orders/${id}/refund`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchOrders();
    } catch (err) {
      console.error("Refund Error:", err);
      alert("Refund failed");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>Admin - User Orders</h2>

        {/* 🔍 Search */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search by Order ID or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px",
              width: "300px",
              marginRight: "10px",
            }}
          />
          <button onClick={fetchOrders}>Search</button>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="10"
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Email</th>
                  <th>User Balance</th>
                  <th>Service</th>
                  <th>Qty</th>
                  <th>Link</th>
                  <th>Amount</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="11" align="center">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.user?.email || "N/A"}</td>
                      <td>${order.user?.balance ?? 0}</td>
                      <td>{order.service?.name || "N/A"}</td>
                      <td>{order.quantity}</td>
                      <td>
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      </td>
                      <td>${order.amount}</td>
                      <td>{order.progress ?? 0}%</td>
                      <td>{order.status}</td>
                      <td>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          <button onClick={() => updateStatus(order._id, "pending")}>
                            Pending
                          </button>
                          <button onClick={() => updateStatus(order._id, "processing")}>
                            Processing
                          </button>
                          <button onClick={() => updateStatus(order._id, "completed")}>
                            Completed
                          </button>
                          <button onClick={() => updateStatus(order._id, "failed")}>
                            Failed
                          </button>

                          {order.status !== "refunded" && (
                            <button
                              onClick={() => refundOrder(order._id)}
                              style={{
                                backgroundColor: "red",
                                color: "white",
                              }}
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserOrders;
