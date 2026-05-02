// src/pages/childpanel/ChildPanelResellers.jsx

import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiEdit2,
  FiX,
  FiCheck,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (val, d = 2) => Number(val || 0).toFixed(d);

const Badge = ({ active }) => (
  <span
    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      active
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-600"
    }`}
  >
    {active ? "Active" : "Suspended"}
  </span>
);

// ======================= STAT CARD =======================

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-3 flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// ======================= INLINE EDIT =======================

function InlineEdit({ label, value, onSave, prefix = "", suffix = "" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onSave(Number(val));
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{label}:</span>
      {editing ? (
        <>
          <div className="relative">
            {prefix && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {prefix}
              </span>
            )}
            <input
              type="number"
              min="0"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className={`border rounded-lg py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                prefix ? "pl-5 pr-2" : "px-2"
              }`}
            />
            {suffix && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {suffix}
              </span>
            )}
          </div>
          <button
            onClick={handle}
            disabled={loading}
            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <FiCheck size={12} />
          </button>
          <button
            onClick={() => { setEditing(false); setVal(value); }}
            className="p-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
          >
            <FiX size={12} />
          </button>
        </>
      ) : (
        <>
          <span className="text-xs font-semibold text-gray-800">
            {prefix}{fmt(value)}{suffix}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-blue-500"
          >
            <FiEdit2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}

// ======================= RESELLER ROW =======================

function ResellerRow({ reseller, onToggle, onCommissionUpdate, onBalanceUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchDetails = async () => {
    if (details) { setExpanded((e) => !e); return; }
    setExpanded(true);
    setLoadingDetails(true);
    try {
      const res = await API.get(`/cp/resellers/${reseller._id}`);
      setDetails(res.data.data);
    } catch {
      toast.error("Failed to load reseller details");
      setExpanded(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(reseller._id);
    setToggling(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Row header */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {reseller.email?.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {reseller.email}
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <Badge active={!reseller.isSuspended} />
              <span className="text-xs text-gray-400">
                {reseller.usersCount || 0} users ·{" "}
                {reseller.ordersCount || 0} orders
              </span>
              <span className="text-xs text-green-600 font-medium">
                Wallet: ${fmt(reseller.resellerWallet || reseller.wallet)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-60 ${
              reseller.isSuspended
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {toggling
              ? "..."
              : reseller.isSuspended
              ? "Activate"
              : "Suspend"}
          </button>

          <button
            onClick={fetchDetails}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            {expanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
            {expanded ? "Less" : "Details"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t bg-gray-50 px-4 py-4 space-y-4">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : details ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  title="Wallet"
                  value={`$${fmt(details.stats?.wallet)}`}
                  icon={<FiDollarSign size={14} />}
                />
                <StatCard
                  title="Orders"
                  value={details.stats?.totalOrders || 0}
                  icon={<FiShoppingCart size={14} />}
                />
                <StatCard
                  title="Revenue"
                  value={`$${fmt(details.stats?.totalRevenue)}`}
                  icon={<FiTrendingUp size={14} />}
                />
                <StatCard
                  title="Earnings"
                  value={`$${fmt(details.stats?.resellerEarnings)}`}
                  icon={<FiDollarSign size={14} />}
                />
              </div>

              {/* Controls */}
              <div className="bg-white rounded-xl border p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Controls
                </p>

                <InlineEdit
                  label="Commission Rate"
                  value={details.reseller?.resellerCommissionRate || 0}
                  suffix="%"
                  onSave={(v) => onCommissionUpdate(reseller._id, v)}
                />

                <InlineEdit
                  label="Wallet Balance"
                  value={details.stats?.wallet || 0}
                  prefix="$"
                  onSave={(v) => onBalanceUpdate(reseller._id, v)}
                />
              </div>

              {/* Recent users */}
              {details.users?.length > 0 && (
                <div className="bg-white rounded-xl border p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                    Users ({details.pagination?.totalUsers || 0})
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-gray-400 uppercase">
                        <tr>
                          <th className="text-left pb-2">Email</th>
                          <th className="text-left pb-2">Balance</th>
                          <th className="text-left pb-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.users.map((u) => (
                          <tr key={u._id} className="border-t">
                            <td className="py-1.5 pr-4 truncate max-w-[160px]">
                              {u.email}
                            </td>
                            <td className="py-1.5 text-green-600 font-medium">
                              ${fmt(u.balance)}
                            </td>
                            <td className="py-1.5 text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent orders */}
              {details.orders?.length > 0 && (
                <div className="bg-white rounded-xl border p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                    Recent Orders
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-gray-400 uppercase">
                        <tr>
                          <th className="text-left pb-2">ID</th>
                          <th className="text-left pb-2">Service</th>
                          <th className="text-left pb-2">Charge</th>
                          <th className="text-left pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.orders.slice(0, 5).map((o) => (
                          <tr key={o._id} className="border-t">
                            <td className="py-1.5 font-bold">
                              #{o.customOrderId || o._id?.slice(-6)}
                            </td>
                            <td className="py-1.5 truncate max-w-[120px]">
                              {o.service}
                            </td>
                            <td className="py-1.5">${fmt(o.charge)}</td>
                            <td className="py-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-xs ${
                                  o.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : o.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelResellers() {
  const [resellers, setResellers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchResellers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/cp/resellers?page=${page}&limit=20`);
      setResellers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      toast.error("Failed to load resellers");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  const handleToggle = async (id) => {
    try {
      await API.put(`/cp/resellers/${id}/toggle-status`);
      toast.success("Status updated");
      setResellers((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isSuspended: !r.isSuspended } : r
        )
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCommissionUpdate = async (id, value) => {
    try {
      await API.put(`/cp/resellers/${id}/commission`, { commission: value });
      toast.success("Commission updated");
      setResellers((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, resellerCommissionRate: value } : r
        )
      );
    } catch {
      toast.error("Failed to update commission");
    }
  };

  const handleBalanceUpdate = async (id, value) => {
    try {
      await API.put(`/cp/resellers/${id}/balance`, { balance: value });
      toast.success("Balance updated");
    } catch {
      toast.error("Failed to update balance");
    }
  };

  return (
    <ChildPanelLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Resellers</h1>
            <p className="text-sm text-gray-500">
              {pagination.total || 0} reseller
              {pagination.total !== 1 ? "s" : ""} on your panel
            </p>
          </div>

          <button
            onClick={fetchResellers}
            className="flex items-center gap-1.5 text-sm px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resellers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <p className="text-gray-400 text-sm">No resellers yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Resellers who sign up on your panel will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resellers.map((r) => (
              <ResellerRow
                key={r._id}
                reseller={r}
                onToggle={handleToggle}
                onCommissionUpdate={handleCommissionUpdate}
                onBalanceUpdate={handleBalanceUpdate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between text-sm pt-2">
            <span className="text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ChildPanelLayout>
  );
}
