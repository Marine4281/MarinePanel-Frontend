// src/components/AdminUserDetails.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPages, setOrderPages] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [newBalance, setNewBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [freezing, setFreezing] = useState(false);

  // ======================= FETCH USER =======================
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users/${id}`);

      const fetchedUser = res.data.user || res.data;
      const fetchedTransactions = (res.data.transactions || []).sort(
        (a, b) =>
          new Date(b.createdAt || b.date) -
          new Date(a.createdAt || a.date)
      );

      setUser(fetchedUser);
      setTransactions(fetchedTransactions);
      setNewBalance(fetchedUser?.balance || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ======================= FETCH ORDERS =======================
  const fetchOrders = useCallback(
    async (page = 1) => {
      setOrdersLoading(true);
      try {
        const res = await API.get(
          `/admin/users/${id}/orders?page=${page}&limit=10`
        );

        setOrders(res.data.orders || []);
        setOrderPages(res.data.pages || 1);
        setOrderPage(res.data.page || 1);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch orders");
      } finally {
        setOrdersLoading(false);
      }
    },
    [id]
  );

  // ======================= INITIAL LOAD =======================
  useEffect(() => {
    fetchUser();
    fetchOrders(1);
  }, [fetchUser, fetchOrders]);

  // ======================= ACTIONS =======================
  const handleUpdateBalance = async () => {
    if (!user) return;

    const value = Number(newBalance);
    if (isNaN(value)) return toast.error("Invalid amount");

    setUpdatingBalance(true);

    try {
      await API.put(`/admin/users/${id}/balance`, { balance: value });
      toast.success("Balance updated");
      fetchUser();
    } catch {
      toast.error("Failed to update balance");
    } finally {
      setUpdatingBalance(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (!user) return;
    setPromoting(true);

    try {
      if (user.isAdmin) {
        await API.patch(`/admin/users/${id}/demote`);
      } else {
        await API.patch(`/admin/users/${id}/promote`);
      }
      fetchUser();
    } catch {
      toast.error("Failed to update admin");
    } finally {
      setPromoting(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!user) return;
    setBlocking(true);

    try {
      const action = user.isBlocked ? "unblock" : "block";
      const res = await API.patch(`/admin/users/${id}/${action}`);
      setUser(res.data);
    } catch {
      toast.error("Failed to update block");
    } finally {
      setBlocking(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!user) return;
    setFreezing(true);

    try {
      const action = user.isFrozen ? "unfreeze" : "freeze";
      const res = await API.patch(`/admin/users/${id}/${action}`);
      setUser(res.data);
    } catch {
      toast.error("Failed to update freeze");
    } finally {
      setFreezing(false);
    }
  };

  // ======================= MANUAL REFRESH =======================
  const handleRefresh = () => {
    setLoading(true);
    fetchUser();
    fetchOrders(orderPage);
  };

  // ======================= UI STATES =======================
  if (loading) return <div className="p-6 text-center">Loading user...</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  const isOnline = user.lastSeen === "Online";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        {/* HEADER ACTIONS */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Back
          </button>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* USER DETAILS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>

          {/* ONLINE STATUS */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-gray-600">
              {user.lastSeen || "Offline"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {user.name || "-"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "-"}</p>

              <p className="flex items-center gap-2">
                <strong>Country:</strong>
                {user.countryCode ? (
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${user.countryCode
                        .toLowerCase()
                        .slice(0, 2)}.png`}
                      alt=""
                      className="w-6 h-4"
                    />
                    {user.country}
                  </>
                ) : "-"}
              </p>

              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p>
                <strong>Balance:</strong> $
                {Number(user.balance || 0).toFixed(4)}
              </p>

              <p className="mt-2">
                <strong>Total Orders:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {user.totalOrders || orders.length}
                </span>
              </p>

              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="p-2 border rounded w-full"
                />
                <button
                  onClick={handleUpdateBalance}
                  disabled={updatingBalance}
                  className="px-4 py-2 bg-orange-500 text-white rounded"
                >
                  {updatingBalance ? "Updating..." : "Save"}
                </button>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={handleToggleAdmin}
                  disabled={promoting}
                  className="px-4 py-2 rounded text-white bg-green-500"
                >
                  {user.isAdmin ? "Demote" : "Promote"}
                </button>

                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className="px-4 py-2 rounded text-white bg-gray-500"
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  onClick={handleToggleFreeze}
                  disabled={freezing}
                  className="px-4 py-2 rounded text-white bg-purple-600"
                >
                  {user.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ORDERS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold">User Orders</h3>
            <span className="text-sm text-gray-500">
              Showing {orders.length} orders
            </span>
          </div>

          {ordersLoading ? (
            <p>Loading...</p>
          ) : orders.length ? (
            <>
              <table className="w-full text-sm border rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Link</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Charge</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((o) => {
                    const statusColor =
                      o.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : o.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700";

                    return (
                      <tr key={o._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{o.service}</td>

                        <td className="px-4 py-3 truncate max-w-[200px]">
                          <a
                            href={o.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {o.link}
                          </a>
                        </td>

                        <td className="px-4 py-3">{o.quantity}</td>

                        <td className="px-4 py-3 font-semibold">
                          ${Number(o.charge).toFixed(4)}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-between mt-4">
                <button
                  disabled={orderPage === 1}
                  onClick={() => fetchOrders(orderPage - 1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Prev
                </button>

                <span>Page {orderPage} / {orderPages}</span>

                <button
                  disabled={orderPage === orderPages}
                  onClick={() => fetchOrders(orderPage + 1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>No orders found</p>
          )}
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Transaction History</h3>

          {transactions.length ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((t, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2">
                      {new Date(t.createdAt || t.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{t.type}</td>
                    <td className={`px-3 py-2 ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${t.amount.toFixed(4)}
                    </td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">{t.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
