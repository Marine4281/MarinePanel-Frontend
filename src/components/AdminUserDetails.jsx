// src/components/AdminUserDetails.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

// ─── User Type Badge ───────────────────────────────────────────
const TYPE_COLORS = {
  "Child Panel": "bg-blue-100 text-blue-700",
  Reseller: "bg-purple-100 text-purple-700",
  API: "bg-yellow-100 text-yellow-700",
  User: "bg-gray-100 text-gray-600",
};

const UserTypeBadge = ({ type }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      TYPE_COLORS[type] || "bg-gray-100 text-gray-600"
    }`}
  >
    {type}
  </span>
);

// ─── Confirm Delete Modal ──────────────────────────────────────
const DeleteModal = ({ email, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <h3 className="text-lg font-bold text-red-600 mb-2">Delete User</h3>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to permanently delete{" "}
        <strong>{email}</strong>? This will also delete all their orders and
        wallet. This cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Status Badge ──────────────────────────────────────────────
const statusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-600";
  const s = status.toLowerCase();
  if (s === "completed") return "bg-green-100 text-green-700";
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  if (s === "processing") return "bg-blue-100 text-blue-700";
  return "bg-red-100 text-red-700";
};

// ──────────────────────────────────────────────────────────────
const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // Transactions (paginated)
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txPages, setTxPages] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txLoading, setTxLoading] = useState(false);

  // Orders (paginated)
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPages, setOrderPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Form states
  const [newBalance, setNewBalance] = useState("");
  const [commissionRate, setCommissionRate] = useState("");

  // Loading / action states
  const [loading, setLoading] = useState(true);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [updatingCommission, setUpdatingCommission] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ======================= FETCH USER =======================
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users/${id}`);
      const fetchedUser = res.data.user || res.data;
      setUser(fetchedUser);
      setNewBalance(fetchedUser?.balance || 0);
      setCommissionRate(fetchedUser?.resellerCommissionRate ?? "");

      // Transactions from initial load
      if (res.data.transactions) {
        setTransactions(res.data.transactions);
        setTxTotal(res.data.transactionPagination?.total || res.data.transactions.length);
        setTxPages(res.data.transactionPagination?.pages || 1);
        setTxPage(res.data.transactionPagination?.page || 1);
      }

      // Total orders count
      if (res.data.pagination) {
        setTotalOrders(res.data.pagination.total || 0);
        setOrderPages(res.data.pagination.pages || 1);
      }
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
        if (res.data.total !== undefined) setTotalOrders(res.data.total);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch orders");
      } finally {
        setOrdersLoading(false);
      }
    },
    [id]
  );

  // ======================= FETCH TRANSACTIONS =======================
  const fetchTransactions = useCallback(
    async (page = 1) => {
      setTxLoading(true);
      try {
        const res = await API.get(
          `/admin/users/${id}/transactions?page=${page}&limit=10`
        );
        // Support both old flat array and new paginated shape
        if (Array.isArray(res.data)) {
          setTransactions(res.data);
          setTxTotal(res.data.length);
          setTxPages(1);
          setTxPage(1);
        } else {
          setTransactions(res.data.transactions || []);
          setTxTotal(res.data.total || 0);
          setTxPages(res.data.pages || 1);
          setTxPage(res.data.page || 1);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch transactions");
      } finally {
        setTxLoading(false);
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

  const handleUpdateCommission = async () => {
    if (!user) return;
    const value = Number(commissionRate);
    if (isNaN(value) || value < 0 || value > 100)
      return toast.error("Commission must be 0–100");
    setUpdatingCommission(true);
    try {
      await API.patch(`/admin/users/${id}/commission`, {
        commissionRate: value,
      });
      toast.success("Commission updated");
      setUser((u) => ({ ...u, resellerCommissionRate: value }));
    } catch {
      toast.error("Failed to update commission");
    } finally {
      setUpdatingCommission(false);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      navigate(-1);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchUser();
    fetchOrders(orderPage);
  };

  // ======================= UI STATES =======================
  if (loading) return <div className="p-6 text-center">Loading user...</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  const isOnline = user.lastSeen === "Online";
  const types = user.userTypes || ["User"];

  // Reseller owner info
  const resellerOwner = user.resellerOwner;
  const cpOwner = user.childPanelOwner;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showDeleteModal && (
        <DeleteModal
          email={user.email}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}

      <div className="flex-1 p-6 max-w-5xl mx-auto">
        {/* HEADER ACTIONS */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </div>

        {/* USER DETAILS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">User Details</h2>
            {/* User type badges */}
            <div className="flex gap-2 flex-wrap justify-end">
              {types.map((t) => (
                <UserTypeBadge key={t} type={t} />
              ))}
              {user.isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Admin
                </span>
              )}
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-1">
              <p>
                <strong>Name:</strong> {user.name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone || "-"}
              </p>
              <p className="flex items-center gap-2">
                <strong>Country:</strong>
                {user.countryCode ? (
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${user.countryCode.toLowerCase()}.png`}
                      alt={user.country}
                      className="w-6 h-4"
                    />
                    {user.country}
                  </>
                ) : (
                  "-"
                )}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>

              {/* Reseller owner */}
              {resellerOwner && (
                <p>
                  <strong>Reseller:</strong>{" "}
                  <span className="text-purple-700 font-medium">
                    {resellerOwner.brandName || resellerOwner.email}
                  </span>
                  {resellerOwner.brandSlug && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({resellerOwner.brandSlug})
                    </span>
                  )}
                </p>
              )}

              {/* Child panel owner */}
              {cpOwner && (
                <p>
                  <strong>Child Panel:</strong>{" "}
                  <span className="text-blue-700 font-medium">
                    {cpOwner.childPanelBrandName || cpOwner.email}
                  </span>
                </p>
              )}

              {/* Scope */}
              {user.scope && user.scope !== "platform" && (
                <p>
                  <strong>Scope:</strong>{" "}
                  <span className="text-gray-500 text-sm">{user.scope}</span>
                </p>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-3">
              <p>
                <strong>Balance:</strong> ${Number(user.balance || 0).toFixed(4)}
              </p>

              <p>
                <strong>Total Orders:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {totalOrders}
                </span>
              </p>

              {/* Update Balance */}
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase mb-1 block">
                  Set Balance
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="p-2 border rounded w-full text-sm"
                  />
                  <button
                    onClick={handleUpdateBalance}
                    disabled={updatingBalance}
                    className="px-4 py-2 bg-orange-500 text-white rounded text-sm whitespace-nowrap"
                  >
                    {updatingBalance ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Commission */}
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase mb-1 block">
                  Commission Rate (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="e.g. 5"
                    className="p-2 border rounded w-full text-sm"
                  />
                  <button
                    onClick={handleUpdateCommission}
                    disabled={updatingCommission}
                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm whitespace-nowrap"
                  >
                    {updatingCommission ? "Saving..." : "Set"}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-2 flex-wrap">
                <button
                  onClick={handleToggleAdmin}
                  disabled={promoting}
                  className="px-4 py-2 rounded text-white bg-green-500 text-sm"
                >
                  {user.isAdmin ? "Demote" : "Promote"}
                </button>

                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className={`px-4 py-2 rounded text-white text-sm ${
                    user.isBlocked ? "bg-green-600" : "bg-gray-500"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  onClick={handleToggleFreeze}
                  disabled={freezing}
                  className={`px-4 py-2 rounded text-white text-sm ${
                    user.isFrozen ? "bg-blue-500" : "bg-purple-600"
                  }`}
                >
                  {user.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ORDERS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">User Orders</h3>
            <span className="text-sm text-gray-500">
              Total: <strong>{totalOrders}</strong> orders
            </span>
          </div>

          {ordersLoading ? (
            <p className="text-sm text-gray-500">Loading orders...</p>
          ) : orders.length ? (
            <>
              <table className="w-full text-sm border rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Link</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Charge</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{o.service}</td>
                      <td className="px-4 py-3 truncate max-w-[180px]">
                        <a
                          href={o.link || o.serviceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {o.link || o.serviceLink}
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${statusColor(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={orderPage === 1}
                  onClick={() => fetchOrders(orderPage - 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm">
                  Page {orderPage} / {orderPages}
                </span>
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
            <p className="text-sm text-gray-500">No orders found</p>
          )}
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <span className="text-sm text-gray-500">
              Total: <strong>{txTotal}</strong>
            </span>
          </div>

          {txLoading ? (
            <p className="text-sm text-gray-500">Loading transactions...</p>
          ) : transactions.length ? (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">
                        {new Date(t.createdAt || t.date).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{t.type}</td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          t.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.amount >= 0 ? "+" : ""}${t.amount.toFixed(4)}
                      </td>
                      <td className="px-3 py-2">{t.status}</td>
                      <td className="px-3 py-2 text-gray-500">{t.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {txPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={txPage === 1}
                    onClick={() => fetchTransactions(txPage - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {txPage} / {txPages}
                  </span>
                  <button
                    disabled={txPage === txPages}
                    onClick={() => fetchTransactions(txPage + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
