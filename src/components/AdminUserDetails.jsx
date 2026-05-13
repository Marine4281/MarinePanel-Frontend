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
        Are you sure you want to permanently delete <strong>{email}</strong>?
        This will also delete all their orders and wallet. This cannot be undone.
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

// ─── Confirm Save Alert Modal ──────────────────────────────────
const ConfirmSaveModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border-t-4 border-orange-400">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xl font-bold">
          !
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Saving..." : "Yes, Save"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Status color ──────────────────────────────────────────────
const statusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-600";
  const s = status.toLowerCase();
  if (s === "completed") return "bg-green-100 text-green-700";
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  if (s === "processing") return "bg-blue-100 text-blue-700";
  return "bg-red-100 text-red-700";
};

// ─── Editable Field ────────────────────────────────────────────
const EditableField = ({
  label,
  hint,
  value,
  onChange,
  onSave,
  saving,
  type = "number",
  min,
  max,
  placeholder,
  extra, // extra JSX below the field
}) => {
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    onSave(() => setEditing(false));
  };

  return (
    <div>
      <label className="text-xs text-gray-500 font-medium uppercase mb-1 block">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex gap-2 items-center">
        <input
          type={type}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          readOnly={!editing}
          placeholder={placeholder}
          className={`p-2 border rounded w-full text-sm transition-colors ${
            editing
              ? "bg-white border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              : "bg-gray-50 border-gray-200 text-gray-600 cursor-default"
          }`}
        />
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm whitespace-nowrap font-medium"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm whitespace-nowrap font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      {extra}
    </div>
  );
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

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmSave, setConfirmSave] = useState(null); // { type: 'balance'|'commission', onConfirm }

  // ======================= FETCH USER =======================
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users/${id}`);
      const fetchedUser = res.data.user || res.data;
      setUser(fetchedUser);
      setNewBalance(fetchedUser?.balance ?? 0);
      setCommissionRate(fetchedUser?.commissionOverride ?? "");

      if (res.data.transactions) {
        setTransactions(res.data.transactions);
        setTxTotal(
          res.data.transactionPagination?.total || res.data.transactions.length
        );
        setTxPages(res.data.transactionPagination?.pages || 1);
        setTxPage(res.data.transactionPagination?.page || 1);
      }

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

  // Called by EditableField — opens confirm modal first
  const requestSaveBalance = (onDone) => {
    const value = Number(newBalance);
    if (isNaN(value)) return toast.error("Invalid amount");
    setConfirmSave({
      type: "balance",
      title: "Update Balance",
      message: `Set balance to $${value.toFixed(4)} for ${user?.email}? This will add an Admin Adjustment transaction.`,
      onConfirm: async () => {
        setUpdatingBalance(true);
        try {
          await API.put(`/admin/users/${id}/balance`, { balance: value });
          toast.success("Balance updated");
          fetchUser();
          onDone();
        } catch {
          toast.error("Failed to update balance");
        } finally {
          setUpdatingBalance(false);
          setConfirmSave(null);
        }
      },
    });
  };

  const requestSaveCommission = (onDone) => {
    const isEmpty = commissionRate === "" || commissionRate === null;
    const value = isEmpty ? null : Number(commissionRate);
    if (!isEmpty && (isNaN(value) || value < 0 || value > 1000))
      return toast.error("Commission must be 0–1000");

    setConfirmSave({
      type: "commission",
      title: "Update Commission",
      message: isEmpty
        ? `Clear commission override for ${user?.email}? They will use the global commission rate.`
        : `Set a custom commission of ${value}% for ${user?.email}? Their orders will use this rate instead of the global one.`,
      onConfirm: async () => {
        setUpdatingCommission(true);
        try {
          await API.patch(`/admin/users/${id}/commission`, {
            commissionOverride: value,
          });
          toast.success(
            isEmpty ? "Reverted to global commission" : "Commission updated"
          );
          setUser((u) => ({ ...u, commissionOverride: value }));
          onDone();
        } catch {
          toast.error("Failed to update commission");
        } finally {
          setUpdatingCommission(false);
          setConfirmSave(null);
        }
      },
    });
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
  const resellerOwner = user.resellerOwner;
  const cpOwner = user.childPanelOwner;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          email={user.email}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}

      {/* Confirm Save Modal */}
      {confirmSave && (
        <ConfirmSaveModal
          title={confirmSave.title}
          message={confirmSave.message}
          onConfirm={confirmSave.onConfirm}
          onCancel={() => setConfirmSave(null)}
          loading={updatingBalance || updatingCommission}
        />
      )}

      <div className="flex-1 p-6 max-w-5xl mx-auto">
        {/* HEADER */}
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

        {/* USER DETAILS CARD */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">User Details</h2>
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

          {/* Online status */}
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
            {/* LEFT — info */}
            <div className="space-y-1">
              <p><strong>Name:</strong> {user.name || "-"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "-"}</p>
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
                ) : "-"}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>

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

              {cpOwner && (
                <p>
                  <strong>Child Panel:</strong>{" "}
                  <span className="text-blue-700 font-medium">
                    {cpOwner.childPanelBrandName || cpOwner.email}
                  </span>
                </p>
              )}

              {user.scope && user.scope !== "platform" && (
                <p>
                  <strong>Scope:</strong>{" "}
                  <span className="text-gray-500 text-sm">{user.scope}</span>
                </p>
              )}
            </div>

            {/* RIGHT — actions */}
            <div className="space-y-4">
              <p>
                <strong>Balance:</strong> ${Number(user.balance || 0).toFixed(4)}
              </p>
              <p>
                <strong>Total Orders:</strong>{" "}
                <span className="text-blue-600 font-semibold">{totalOrders}</span>
              </p>

              {/* Balance field */}
              <EditableField
                label="Set Balance"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                onSave={requestSaveBalance}
                saving={updatingBalance}
                type="number"
                placeholder="0.00"
              />

              {/* Commission field */}
              <EditableField
                label="Commission Override (%)"
                hint={
                  user.commissionOverride != null
                    ? `Currently overriding global — set to ${user.commissionOverride}%`
                    : "Blank = use global commission from Admin Settings"
                }
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                onSave={requestSaveCommission}
                saving={updatingCommission}
                type="number"
                min="0"
                max="100"
                placeholder="Blank = global"
                extra={
                  user.commissionOverride != null ? (
                    <button
                      onClick={() => {
                        setCommissionRate("");
                        requestSaveCommission(() => {});
                      }}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 hover:underline"
                    >
                      Clear override → revert to global
                    </button>
                  ) : null
                }
              />

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap pt-1">
                <button
                  onClick={handleToggleAdmin}
                  disabled={promoting}
                  className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 text-sm"
                >
                  {user.isAdmin ? "Demote" : "Promote"}
                </button>
                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className={`px-4 py-2 rounded text-white text-sm ${
                    user.isBlocked
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={handleToggleFreeze}
                  disabled={freezing}
                  className={`px-4 py-2 rounded text-white text-sm ${
                    user.isFrozen
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-purple-600 hover:bg-purple-700"
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
                          className={`px-2 py-1 rounded-full text-xs ${statusColor(o.status)}`}
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
                      <td className="px-3 py-2 text-gray-500">
                        {t.note || "-"}
                      </td>
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
