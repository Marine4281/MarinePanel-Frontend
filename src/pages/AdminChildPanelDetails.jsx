// src/pages/AdminChildPanelDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import {
  FiArrowLeft,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiEdit2,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiGlobe,
  FiRefreshCw,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (v, d = 2) => Number(v || 0).toFixed(d);

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "completed": return "bg-green-100 text-green-700";
    case "processing": return "bg-blue-100 text-blue-700";
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "failed": return "bg-red-100 text-red-700";
    case "refunded": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

// ======================= STAT CARD =======================

function StatCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-purple-50 text-purple-500",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 shrink-0">{label}:</span>
      {editing ? (
        <>
          <input
            type="number"
            min="0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handle}
            disabled={loading}
            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <FiCheck size={12} />
          </button>
          <button
            onClick={() => { setEditing(false); setVal(value); }}
            className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <FiX size={12} />
          </button>
        </>
      ) : (
        <>
          <span className="text-sm font-bold text-gray-800">
            {prefix}{fmt(value)}{suffix}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-blue-500"
          >
            <FiEdit2 size={12} />
          </button>
        </>
      )}
    </div>
  );
}

// ======================= BILLING EDIT =======================

function BillingEdit({ cp, onSaved }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(cp?.childPanelBillingMode || "monthly");
  const [monthly, setMonthly] = useState(cp?.childPanelMonthlyFee ?? 0);
  const [perOrder, setPerOrder] = useState(cp?.childPanelPerOrderFee ?? 0);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/child-panels/${cp._id}/billing`, {
        billingMode: mode,
        monthlyFee: Number(monthly),
        perOrderFee: Number(perOrder),
      });
      toast.success("Billing updated");
      onSaved({ billingMode: mode, monthlyFee: Number(monthly), perOrderFee: Number(perOrder) });
      setOpen(false);
    } catch {
      toast.error("Failed to update billing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
      >
        <FiEdit2 size={11} /> Edit Billing
      </button>

      {open && (
        <div className="mt-3 bg-gray-50 border rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Billing Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="monthly">Monthly</option>
              <option value="per_order">Per Order</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>

          {(mode === "monthly" || mode === "both") && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Monthly Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          )}

          {(mode === "per_order" || mode === "both") && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Per-Order Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={perOrder}
                onChange={(e) => setPerOrder(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================= CONFIRM MODAL =======================

function ConfirmModal({ message, onConfirm, onClose, danger }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              await onConfirm();
              setLoading(false);
            }}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================= MAIN =======================

export default function AdminChildPanelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [resellerPage, setResellerPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  // ======================= FETCH =======================

  const fetchDetails = async (oPage = orderPage, rPage = resellerPage) => {
    try {
      setLoading(true);
      const res = await API.get(
        `/admin/child-panels/${id}?page=${oPage}&limit=10`
      );
      setData(res.data.data);
    } catch {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // ======================= ACTIONS =======================

  const handleToggle = async () => {
    setToggling(true);
    try {
      await API.put(`/admin/child-panels/${id}/toggle-status`);
      setData((prev) => ({
        ...prev,
        childPanel: {
          ...prev.childPanel,
          childPanelIsActive: !prev.childPanel.childPanelIsActive,
        },
      }));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const handleCommission = async (rate) => {
    try {
      await API.put(`/admin/child-panels/${id}/commission`, {
        commission: rate,
      });
      setData((prev) => ({
        ...prev,
        childPanel: {
          ...prev.childPanel,
          childPanelCommissionRate: rate,
        },
      }));
      toast.success("Commission updated");
    } catch {
      toast.error("Failed to update commission");
    }
  };

  const handleBillingSaved = (patch) => {
    setData((prev) => ({
      ...prev,
      childPanel: { ...prev.childPanel, ...patch },
    }));
  };

  const handleDeactivate = () => {
    setConfirm({
      message: `Permanently deactivate "${
        data?.childPanel?.childPanelBrandName || "this panel"
      }"? Their users and data remain but the panel is shut down.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.delete(`/admin/child-panels/${id}`);
          toast.success("Panel deactivated");
          navigate("/admin/child-panels");
        } catch {
          toast.error("Failed to deactivate");
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  // ======================= LOADING =======================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Child panel not found</p>
        </div>
      </div>
    );
  }

  const cp = data.childPanel;
  const stats = data.stats;
  const pagination = data.pagination;

  // ======================= RENDER =======================

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/child-panels")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
            >
              <FiArrowLeft size={14} /> Back
            </button>

            {cp.childPanelLogo && (
              <img
                src={cp.childPanelLogo}
                alt="logo"
                className="w-10 h-10 rounded-xl object-contain border p-0.5"
              />
            )}

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {cp.childPanelBrandName || "Child Panel"}
              </h1>
              <p className="text-sm text-gray-500">{cp.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                cp.childPanelIsActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {cp.childPanelIsActive ? "Active" : "Suspended"}
            </span>

            {/* Toggle */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-60 transition ${
                cp.childPanelIsActive
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {toggling
                ? "..."
                : cp.childPanelIsActive
                ? "Suspend Panel"
                : "Activate Panel"}
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchDetails()}
              className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Panel Wallet"
            value={`$${fmt(stats.childPanelWallet)}`}
            icon={<FiDollarSign size={18} />}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FiShoppingCart size={18} />}
            color="orange"
          />
          <StatCard
            title="Total Revenue"
            value={`$${fmt(stats.totalRevenue)}`}
            icon={<FiTrendingUp size={18} />}
            color="blue"
          />
          <StatCard
            title="Total Resellers"
            value={stats.totalResellers}
            icon={<FiUsers size={18} />}
            color="purple"
          />
        </div>

        {/* Controls + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Panel info */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">
              Panel Info
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FiGlobe className="text-gray-400 shrink-0" size={14} />
                <span className="text-gray-500">Domain:</span>
                <span className="font-semibold text-gray-800 truncate">
                  {cp.childPanelDomain || cp.childPanelSlug
                    ? `${cp.childPanelSlug}.marinepanel.online`
                    : "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">Payment Mode:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {cp.childPanelPaymentMode || "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">Service Mode:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {cp.childPanelServiceMode || "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">Theme:</span>
                <div
                  className="w-5 h-5 rounded-full border"
                  style={{
                    backgroundColor: cp.childPanelThemeColor || "#1e40af",
                  }}
                />
                <span className="text-xs font-mono text-gray-600">
                  {cp.childPanelThemeColor || "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">Activated:</span>
                <span className="font-semibold text-gray-800">
                  {cp.childPanelActivatedAt
                    ? new Date(cp.childPanelActivatedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )
                    : "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">Withdraw Min:</span>
                <span className="font-semibold text-gray-800">
                  ${cp.childPanelWithdrawMin ?? 10}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">
              Controls
            </h3>

            <InlineEdit
              label="Commission Rate"
              value={cp.childPanelCommissionRate || 0}
              suffix="%"
              onSave={handleCommission}
            />

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-1">
                Billing Mode:{" "}
                <span className="font-semibold text-gray-800 capitalize">
                  {cp.childPanelBillingMode || "—"}
                </span>
                {cp.childPanelMonthlyFee > 0 && (
                  <> · ${cp.childPanelMonthlyFee}/mo</>
                )}
                {cp.childPanelPerOrderFee > 0 && (
                  <> · ${cp.childPanelPerOrderFee}/order</>
                )}
              </p>
              <BillingEdit cp={cp} onSaved={handleBillingSaved} />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase">
                Danger Zone
              </p>
              <button
                onClick={handleDeactivate}
                className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold"
              >
                Deactivate Panel
              </button>
            </div>
          </div>
        </div>

        {/* Resellers */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">
              Resellers ({stats.totalResellers})
            </h3>
          </div>

          {data.resellers.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No resellers yet
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Brand</th>
                      <th className="px-4 py-2 text-left">Domain</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.resellers.map((r) => (
                      <tr key={r._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 truncate max-w-[160px]">
                          {r.email}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {r.brandName || "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {r.resellerDomain || "—"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              r.isSuspended
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {r.isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.resellerPages > 1 && (
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-gray-400">
                    Page {resellerPage} of {pagination.resellerPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={resellerPage === 1}
                      onClick={() => {
                        setResellerPage((p) => p - 1);
                        fetchDetails(orderPage, resellerPage - 1);
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      disabled={resellerPage === pagination.resellerPages}
                      onClick={() => {
                        setResellerPage((p) => p + 1);
                        fetchDetails(orderPage, resellerPage + 1);
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">
              Orders ({stats.totalOrders})
            </h3>
            <span className="text-xs text-green-600 font-semibold">
              Total Earnings: ${fmt(stats.totalEarnings)}
            </span>
          </div>

          {data.orders.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No orders yet
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Qty</th>
                      <th className="px-4 py-2 text-left">Charge</th>
                      <th className="px-4 py-2 text-left">Commission</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-bold text-gray-800">
                          #{o.customOrderId || o._id?.slice(-6)}
                        </td>
                        <td className="px-4 py-2 truncate max-w-[140px] text-gray-700">
                          {o.service}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {o.quantity}
                        </td>
                        <td className="px-4 py-2 font-semibold text-gray-800">
                          ${fmt(o.charge)}
                        </td>
                        <td className="px-4 py-2 text-green-600 font-semibold">
                          ${fmt(o.childPanelCommission)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.orderPages > 1 && (
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-gray-400">
                    Page {orderPage} of {pagination.orderPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={orderPage === 1}
                      onClick={() => {
                        setOrderPage((p) => p - 1);
                        fetchDetails(orderPage - 1, resellerPage);
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      disabled={orderPage === pagination.orderPages}
                      onClick={() => {
                        setOrderPage((p) => p + 1);
                        fetchDetails(orderPage + 1, resellerPage);
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
