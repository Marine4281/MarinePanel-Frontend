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

  // 🆕 ORDERS STATE
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
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 🆕 Fetch orders
  const fetchOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    try {
      const res = await API.get(
        `/admin/users/${id}/orders?page=${page}&limit=10`
      );

      setOrders(res.data.orders || []);
      setOrderPages(res.data.pages || 1);
      setOrderPage(res.data.page || 1);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
    fetchOrders(1);
  }, [fetchUser, fetchOrders]);

  // ✅ Update balance
  const handleUpdateBalance = async () => {
    setUpdatingBalance(true);
    try {
      await API.put(`/admin/users/${id}/balance`, {
        balance: Number(newBalance),
      });

      toast.success("Balance updated");
      fetchUser();
    } catch {
      toast.error("Failed to update balance");
    } finally {
      setUpdatingBalance(false);
    }
  };

  // ✅ Promote / Demote
  const handleToggleAdmin = async () => {
    setPromoting(true);
    try {
      if (user.isAdmin) {
        await API.patch(`/admin/users/${id}/demote`);
        toast.success("User demoted");
      } else {
        await API.patch(`/admin/users/${id}/promote`);
        toast.success("User promoted");
      }
      fetchUser();
    } catch {
      toast.error("Failed");
    } finally {
      setPromoting(false);
    }
  };

  // ✅ Block / Unblock
  const handleToggleBlock = async () => {
    setBlocking(true);
    try {
      const action = user.isBlocked ? "unblock" : "block";
      const res = await API.patch(`/admin/users/${id}/${action}`);
      setUser(res.data);
      toast.success(user.isBlocked ? "Unblocked" : "Blocked");
    } catch {
      toast.error("Failed");
    } finally {
      setBlocking(false);
    }
  };

  // 🆕 Freeze / Unfreeze
  const handleToggleFreeze = async () => {
    setFreezing(true);
    try {
      const action = user.isFrozen ? "unfreeze" : "freeze";
      const res = await API.patch(`/admin/users/${id}/${action}`);
      setUser(res.data);
      toast.success(user.isFrozen ? "Unfrozen" : "Frozen");
    } catch {
      toast.error("Failed to update freeze");
    } finally {
      setFreezing(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 max-w-6xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>

        {/* USER */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">User Details</h2>

          <p><b>Email:</b> {user.email}</p>
          <p><b>Balance:</b> ${Number(user.balance).toFixed(4)}</p>

          <div className="flex gap-2 mt-3">
            <input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={handleUpdateBalance}
              className="bg-orange-500 text-white px-4 rounded"
            >
              Save
            </button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">

            <button
              onClick={handleToggleAdmin}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {user.isAdmin ? "Demote" : "Promote"}
            </button>

            <button
              onClick={handleToggleBlock}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              {user.isBlocked ? "Unblock" : "Block"}
            </button>

            {/* 🆕 FREEZE BUTTON */}
            <button
              onClick={handleToggleFreeze}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              {user.isFrozen ? "Unfreeze" : "Freeze"}
            </button>

          </div>
        </div>

        {/* 🆕 ORDERS */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h3 className="font-bold mb-4">User Orders</h3>

          {ordersLoading ? (
            <p>Loading orders...</p>
          ) : orders.length ? (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Service</th>
                    <th>Link</th>
                    <th>Qty</th>
                    <th>Charge</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b">
                      <td>{o.service}</td>
                      <td className="truncate max-w-[150px]">{o.link}</td>
                      <td>{o.quantity}</td>
                      <td>${Number(o.charge).toFixed(4)}</td>
                      <td>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="flex justify-between mt-4">
                <button
                  disabled={orderPage === 1}
                  onClick={() => fetchOrders(orderPage - 1)}
                >
                  Prev
                </button>

                <span>Page {orderPage} / {orderPages}</span>

                <button
                  disabled={orderPage === orderPages}
                  onClick={() => fetchOrders(orderPage + 1)}
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
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-4">Transactions</h3>

          {transactions.length ? (
            <table className="w-full text-sm">
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i} className="border-b">
                    <td>{t.type}</td>
                    <td>{t.amount}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminUserDetails;
