// src/pages/childpanel/ChildPanelUserDetails.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";

// ─── Badges ────────────────────────────────────────────────────
const TYPE_COLORS = {
  Reseller: "bg-purple-100 text-purple-700",
  API:      "bg-yellow-100 text-yellow-700",
  User:     "bg-gray-100 text-gray-600",
};
const UserTypeBadge = ({ type }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type] || "bg-gray-100 text-gray-600"}`}>
    {type}
  </span>
);
const getUserTypes = (u) => {
  const t = [];
  if (u.isReseller)       t.push("Reseller");
  if (u.apiAccessEnabled) t.push("API");
  if (t.length === 0)     t.push("User");
  return t;
};

// ─── Delete Modal ──────────────────────────────────────────────
const DeleteModal = ({ email, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <h3 className="text-lg font-bold text-red-600 mb-2">Delete User</h3>
      <p className="text-sm text-gray-600 mb-4">
        Permanently delete <strong>{email}</strong>? Their orders and wallet will also be removed. This cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Confirm Save Modal ────────────────────────────────────────
const ConfirmSaveModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border-t-4 border-blue-400">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">!</div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Yes, Save"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Status color ──────────────────────────────────────────────
const statusColor = (s) => {
  if (!s) return "bg-gray-100 text-gray-600";
  const v = s.toLowerCase();
  if (v === "completed")  return "bg-green-100 text-green-700";
  if (v === "pending")    return "bg-yellow-100 text-yellow-700";
  if (v === "processing") return "bg-blue-100 text-blue-700";
  return "bg-red-100 text-red-700";
};

// ─── Editable Field ────────────────────────────────────────────
const EditableField = ({ label, hint, value, onChange, onSave, saving, type = "number", min, max, placeholder, extra }) => {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium uppercase mb-1 block">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex gap-2 items-center">
        <input
          type={type} min={min} max={max}
          value={value} onChange={onChange}
          readOnly={!editing} placeholder={placeholder}
          className={`p-2 border rounded w-full text-sm transition-colors ${
            editing
              ? "bg-white border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
            onClick={() => onSave(() => setEditing(false))}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm whitespace-nowrap font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      {extra}
    </div>
  );
};

// ─── Pagination bar ────────────────────────────────────────────
const PaginationBar = ({ page, pages, onPrev, onNext }) => (
  <div className="flex justify-between items-center mt-4 text-sm">
    <button disabled={page === 1} onClick={onPrev}
      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40">
      Prev
    </button>
    <span className="text-gray-400 text-xs">Page {page} / {pages}</span>
    <button disabled={page === pages} onClick={onNext}
      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40">
      Next
    </button>
  </div>
);

// ──────────────────────────────────────────────────────────────
export default function ChildPanelUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);

  // Transactions
  const [transactions, setTx]         = useState([]);
  const [txPage, setTxPage]           = useState(1);
  const [txPages, setTxPages]         = useState(1);
  const [txTotal, setTxTotal]         = useState(0);
  const [txLoading, setTxLoading]     = useState(false);

  // Orders
  const [orders, setOrders]           = useState([]);
  const [orderPage, setOrderPage]     = useState(1);
  const [orderPages, setOrderPages]   = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Form values
  const [newBalance, setNewBalance]   = useState("");
  const [commRate, setCommRate]       = useState("");

  // Action loading
  const [updBal, setUpdBal]           = useState(false);
  const [updComm, setUpdComm]         = useState(false);
  const [blocking, setBlocking]       = useState(false);
  const [freezing, setFreezing]       = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // Modals
  const [showDelete, setShowDelete]   = useState(false);
  const [confirmSave, setConfirmSave] = useState(null);

  // ── Fetch user ────────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get(`/cp/users/${id}`);
      const u = res.data.user;
      setUser(u);
      setNewBalance(u?.balance ?? 0);
      setCommRate(u?.commissionOverride ?? "");

      if (res.data.transactions) {
        setTx(res.data.transactions);
        setTxTotal(res.data.transactionPagination?.total || 0);
        setTxPages(res.data.transactionPagination?.pages || 1);
        setTxPage(1);
      }
      if (res.data.orderPagination) {
        setTotalOrders(res.data.orderPagination.total || 0);
        setOrderPages(res.data.orderPagination.pages || 1);
      }
    } catch {
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Fetch orders ──────────────────────────────────────────
  const fetchOrders = useCallback(async (p = 1) => {
    setOrdersLoading(true);
    try {
      const res = await API.get(`/cp/users/${id}/orders?page=${p}&limit=10`);
      setOrders(res.data.orders || []);
      setOrderPages(res.data.pages || 1);
      setOrderPage(res.data.page || 1);
      if (res.data.total !== undefined) setTotalOrders(res.data.total);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [id]);

  // ── Fetch transactions ────────────────────────────────────
  const fetchTx = useCallback(async (p = 1) => {
    setTxLoading(true);
    try {
      const res = await API.get(`/cp/users/${id}/transactions?page=${p}&limit=10`);
      if (Array.isArray(res.data)) {
        setTx(res.data); setTxTotal(res.data.length); setTxPages(1); setTxPage(1);
      } else {
        setTx(res.data.transactions || []);
        setTxTotal(res.data.total || 0);
        setTxPages(res.data.pages || 1);
        setTxPage(res.data.page || 1);
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setTxLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); fetchOrders(1); }, [fetchUser, fetchOrders]);

  // ── Actions ───────────────────────────────────────────────
  const requestSaveBalance = (onDone) => {
    const value = Number(newBalance);
    if (isNaN(value)) return toast.error("Invalid amount");
    setConfirmSave({
      title: "Update Balance",
      message: `Set balance to $${value.toFixed(4)} for ${user?.email}?`,
      onConfirm: async () => {
        setUpdBal(true);
        try {
          const res = await API.put(`/cp/users/${id}/balance`, { balance: value });
          setUser((u) => ({ ...u, balance: res.data.balance }));
          setNewBalance(res.data.balance);
          toast.success("Balance updated");
          onDone();
        } catch {
          toast.error("Failed to update balance");
        } finally {
          setUpdBal(false);
          setConfirmSave(null);
        }
      },
    });
  };

  const requestSaveCommission = (onDone) => {
    const isEmpty = commRate === "" || commRate === null;
    const value = isEmpty ? null : Number(commRate);
    if (!isEmpty && (isNaN(value) || value < 0 || value > 100))
      return toast.error("Commission must be 0–100");
    setConfirmSave({
      title: "Update Commission",
      message: isEmpty
        ? `Clear commission override for ${user?.email}? They'll use the panel default.`
        : `Set custom commission of ${value}% for ${user?.email}?`,
      onConfirm: async () => {
        setUpdComm(true);
        try {
          await API.patch(`/cp/users/${id}/commission`, { commissionOverride: value });
          setUser((u) => ({ ...u, commissionOverride: value }));
          toast.success(isEmpty ? "Reverted to panel default" : "Commission updated");
          onDone();
        } catch {
          toast.error("Failed to update commission");
        } finally {
          setUpdComm(false);
          setConfirmSave(null);
        }
      },
    });
  };

  const handleToggleBlock = async () => {
    setBlocking(true);
    try {
      const action = user.isBlocked ? "unblock" : "block";
      const res = await API.patch(`/cp/users/${id}/${action}`);
      setUser((u) => ({ ...u, isBlocked: res.data.isBlocked }));
      toast.success(user.isBlocked ? "User unblocked" : "User blocked");
    } catch {
      toast.error("Action failed");
    } finally {
      setBlocking(false);
    }
  };

  const handleToggleFreeze = async () => {
    setFreezing(true);
    try {
      const action = user.isFrozen ? "unfreeze" : "freeze";
      const res = await API.patch(`/cp/users/${id}/${action}`);
      setUser((u) => ({ ...u, isFrozen: res.data.isFrozen }));
      toast.success(user.isFrozen ? "User unfrozen" : "User frozen");
    } catch {
      toast.error("Action failed");
    } finally {
      setFreezing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/cp/users/${id}`);
      toast.success("User deleted");
      navigate("/cp/users");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  if (loading) return (
    <ChildPanelLayout>
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </ChildPanelLayout>
  );

  if (!user) return (
    <ChildPanelLayout>
      <div className="p-10 text-center text-gray-400">User not found</div>
    </ChildPanelLayout>
  );

  const types    = user.userTypes || getUserTypes(user);
  const isOnline = user.lastSeen === "Online";

  return (
    <ChildPanelLayout>
      {showDelete && (
        <DeleteModal
          email={user.email}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
      {confirmSave && (
        <ConfirmSaveModal
          title={confirmSave.title}
          message={confirmSave.message}
          onConfirm={confirmSave.onConfirm}
          onCancel={() => setConfirmSave(null)}
          loading={updBal || updComm}
        />
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { setLoading(true); fetchUser(); fetchOrders(orderPage); }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </div>

        {/* User info card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4 gap-2">
            <h2 className="text-xl font-bold text-gray-800">User Details</h2>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {types.map((t) => <UserTypeBadge key={t} type={t} />)}
              {user.isBlocked && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Blocked</span>
              )}
              {user.isFrozen && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Frozen</span>
              )}
            </div>
          </div>

          {/* Online indicator */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-xs text-gray-500">{user.lastSeen || "Offline"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left — info */}
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Email</span><span className="ml-2 font-medium text-gray-700">{user.email}</span></p>
              <p><span className="text-gray-400">Phone</span><span className="ml-2 text-gray-600">{user.phone || "—"}</span></p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400">Country</span>
                {user.countryCode ? (
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${user.countryCode.toLowerCase()}.png`}
                      alt={user.country}
                      className="w-6 h-4 ml-2"
                    />
                    <span className="text-gray-600">{user.country}</span>
                  </>
                ) : <span className="ml-2 text-gray-400">—</span>}
              </p>
              <p>
                <span className="text-gray-400">Joined</span>
                <span className="ml-2 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</span>
              </p>
              <p>
                <span className="text-gray-400">Balance</span>
                <span className="ml-2 font-semibold text-green-600">${Number(user.balance || 0).toFixed(4)}</span>
              </p>
              <p>
                <span className="text-gray-400">Total Orders</span>
                <span className="ml-2 font-semibold text-blue-600">{totalOrders}</span>
              </p>
            </div>

            {/* Right — controls */}
            <div className="space-y-4">

              <EditableField
                label="Set Balance"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                onSave={requestSaveBalance}
                saving={updBal}
                placeholder="0.00"
              />

              <EditableField
                label="Commission Override (%)"
                hint={
                  user.commissionOverride != null
                    ? `Currently ${user.commissionOverride}% — overriding panel default`
                    : "Blank = use your panel's default commission"
                }
                value={commRate}
                onChange={(e) => setCommRate(e.target.value)}
                onSave={requestSaveCommission}
                saving={updComm}
                min="0" max="100"
                placeholder="Blank = panel default"
                extra={
                  user.commissionOverride != null ? (
                    <button
                      onClick={() => { setCommRate(""); requestSaveCommission(() => {}); }}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 hover:underline"
                    >
                      Clear override → revert to panel default
                    </button>
                  ) : null
                }
              />

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap pt-1">
                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 ${
                    user.isBlocked
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {blocking ? "..." : user.isBlocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={handleToggleFreeze}
                  disabled={freezing}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 ${
                    user.isFrozen
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {freezing ? "..." : user.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Orders</h3>
            <span className="text-xs text-gray-400">
              Total: <strong className="text-gray-600">{totalOrders}</strong>
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-400">
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
                        <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{o.service}</td>
                        <td className="px-4 py-3 max-w-[140px] truncate">
                          <a
                            href={o.link || o.serviceLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            {o.link || o.serviceLink}
                          </a>
                        </td>
                        <td className="px-4 py-3">{o.quantity}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          ${Number(o.charge).toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orderPages > 1 && (
                <PaginationBar
                  page={orderPage} pages={orderPages}
                  onPrev={() => fetchOrders(orderPage - 1)}
                  onNext={() => fetchOrders(orderPage + 1)}
                />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No orders yet</p>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Transaction History</h3>
            <span className="text-xs text-gray-400">
              Total: <strong className="text-gray-600">{txTotal}</strong>
            </span>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-400">
                          {new Date(t.createdAt || t.date).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{t.type}</td>
                        <td className={`px-3 py-2 font-medium ${t.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {t.amount >= 0 ? "+" : ""}${Number(t.amount).toFixed(4)}
                        </td>
                        <td className="px-3 py-2 text-gray-500">{t.status}</td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{t.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {txPages > 1 && (
                <PaginationBar
                  page={txPage} pages={txPages}
                  onPrev={() => fetchTx(txPage - 1)}
                  onNext={() => fetchTx(txPage + 1)}
                />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No transactions yet</p>
          )}
        </div>

      </div>
    </ChildPanelLayout>
  );
}
