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

  // 🆕 Orders state
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPages, setOrderPages] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [newBalance, setNewBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [freezing, setFreezing] = useState(false); // 🆕

  // ✅ Fetch user + transactions
  const fetchUser = useCallback(async () => {
    setLoading(true);
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
      console.error("FETCH USER ERROR:", err.response?.data || err.message);
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 🆕 Fetch orders (paginated)
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
        console.error("ORDERS ERROR:", err.response?.data || err.message);
        toast.error("Failed to fetch orders");
      } finally {
        setOrdersLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchUser();
    fetchOrders(1);
  }, [fetchUser, fetchOrders]);

  // ✅ Update balance
  const handleUpdateBalance = async () => {
    if (!user) return;
    setUpdatingBalance(true);

    try {
      await API.put(`/admin/users/${id}/balance`, {
        balance: Number(newBalance),
      });

      toast.success("Balance updated");
      fetchUser();
    } catch (err) {
      console.error("BALANCE ERROR:", err.response?.data || err.message);
      toast.error("Failed to update balance");
    } finally {
      setUpdatingBalance(false);
    }
  };

  // ✅ Promote / Demote
  const handleToggleAdmin = async () => {
    if (!user) return;
    setPromoting(true);

    try {
      if (user.isAdmin) {
        await API.patch(`/admin/users/${id}/demote`);
        toast.success("User demoted to normal user");
      } else {
        await API.patch(`/admin/users/${id}/promote`);
        toast.success("User promoted to admin");
      }
      fetchUser();
    } catch (err) {
      console.error("ADMIN ERROR:", err.response?.data || err.message);
      toast.error("Failed to update admin status");
    } finally {
      setPromoting(false);
    }
  };

  // ✅ Block / Unblock
  const handleToggleBlock = async () => {
    if (!user) return;
    setBlocking(true);

    try {
      const action = user.isBlocked ? "unblock" : "block";
      const res = await API.patch(`/admin/users/${id}/${action}`);
      setUser(res.data);
      toast.success(user.isBlocked ? "User unblocked" : "User blocked");
    } catch (err) {
      console.error("BLOCK ERROR:", err.response?.data || err.message);
      toast.error("Failed to update block status");
    } finally {
      setBlocking(false);
    }
  };

  // 🆕 Freeze / Unfreeze
  const handleToggleFreeze = async () => {
    if (!user) return;
    setFreezing(true);

    try {
      const action = user.isFrozen ? "unfreeze" : "freeze";
      const res = await API.patch(`/admin/users/${id}/${action}`);
      setUser(res.data);
      toast.success(user.isFrozen ? "User unfrozen" : "User frozen");
    } catch (err) {
      console.error("FREEZE ERROR:", err.response?.data || err.message);
      toast.error("Failed to update freeze status");
    } finally {
      setFreezing(false);
    }
  };

  // ✅ UI states
  if (loading) return <div className="p-6 text-center">Loading user...</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>

        {/* USER DETAILS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {user.name || "-"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "-"}</p>

              <p className="flex items-center gap-2">
                <strong>Country:</strong>{" "}
                {user.country ? (
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${user.country.toLowerCase().slice(0, 2)}.png`}
                      alt={user.country}
                      className="w-6 h-4 object-cover"
                    />
                    <span>{user.country}</span>
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
                <strong>Balance:</strong> ${Number(user.balance || 0).toFixed(4)}
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
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  {updatingBalance ? "Updating..." : "Save"}
                </button>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={handleToggleAdmin}
                  disabled={promoting}
                  className={`px-4 py-2 rounded text-white ${
                    user.isAdmin
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {promoting
                    ? "Processing..."
                    : user.isAdmin
                    ? "Demote to User"
                    : "Promote to Admin"}
                </button>

                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className={`px-4 py-2 rounded text-white ${
                    user.isBlocked
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {blocking
                    ? "Processing..."
                    : user.isBlocked
                    ? "Unblock User"
                    : "Block User"}
                </button>

                {/* 🆕 FREEZE BUTTON */}
                <button
                  onClick={handleToggleFreeze}
                  disabled={freezing}
                  className="px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700"
                >
                  {freezing
                    ? "Processing..."
                    : user.isFrozen
                    ? "Unfreeze User"
                    : "Freeze User"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 ORDERS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">User Orders</h3>

          {ordersLoading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : orders.length ? (
            <>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase">
                  <tr>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Link</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">Charge</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{o.service}</td>
                      <td className="px-3 py-2 truncate max-w-[200px]">{o.link}</td>
                      <td className="px-3 py-2">{o.quantity}</td>
                      <td className="px-3 py-2">${Number(o.charge).toFixed(4)}</td>
                      <td className="px-3 py-2">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between mt-4">
                <button
                  disabled={orderPage === 1}
                  onClick={() => fetchOrders(orderPage - 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span>Page {orderPage} / {orderPages}</span>

                <button
                  disabled={orderPage === orderPages}
                  onClick={() => fetchOrders(orderPage + 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No orders found</p>
          )}
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Transaction History</h3>

          {transactions.length ? (
            <table className="w-full text-sm text-left rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-100 text-gray-600 uppercase">
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
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {new Date(t.createdAt || t.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{t.type}</td>
                    <td className={`px-3 py-2 font-semibold ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${t.amount.toFixed(4)}
                    </td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">{t.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
