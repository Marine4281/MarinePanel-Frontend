// src/pages/AdminChildPanelDetails.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";

// Split components
import CPDetailStatCards   from "../components/admin/childpanel/CPDetailStatCards";
import CPDetailInfoCard    from "../components/admin/childpanel/CPDetailInfoCard";
import CPDetailControls    from "../components/admin/childpanel/CPDetailControls";
import CPDetailResellersTab from "../components/admin/childpanel/CPDetailResellersTab";
import CPDetailUsersTab    from "../components/admin/childpanel/CPDetailUsersTab";
import CPDetailOrdersTab   from "../components/admin/childpanel/CPDetailOrdersTab";
import CPConfirmModal      from "../components/admin/childpanel/CPConfirmModal";

const TABS = [
  { id: "resellers", label: "Resellers" },
  { id: "users",     label: "Users"     },
  { id: "orders",    label: "Orders"    },
];

export default function AdminChildPanelDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  // Data state
  const [cp, setCp]           = useState(null);
  const [stats, setStats]     = useState({});
  const [resellers, setResellers] = useState([]);
  const [users, setUsers]     = useState([]);
  const [orders, setOrders]   = useState([]);
  const [pagination, setPagination] = useState({});

  // UI state
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("resellers");
  const [confirm, setConfirm]     = useState(null); // { message, danger, showReason, onConfirm }

  // Pagination per tab
  const [resellerPage, setResellerPage] = useState(1);
  const [userPage,     setUserPage]     = useState(1);
  const [orderPage,    setOrderPage]    = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchDetails = useCallback(async (rPage = resellerPage, uPage = userPage, oPage = orderPage) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/admin/child-panels/${id}?resellerPage=${rPage}&userPage=${uPage}&orderPage=${oPage}&limit=15`
      );
      const d = res.data.data;
      setCp(d.childPanel);
      setStats(d.stats);
      setResellers(d.resellers  || []);
      setUsers(d.users          || []);
      setOrders(d.orders        || []);
      setPagination(d.pagination || {});
    } catch {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  }, [id, resellerPage, userPage, orderPage]);

  useEffect(() => { fetchDetails(1, 1, 1); }, [id]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleToggle = () => {
    const suspending = cp.childPanelIsActive;
    setConfirm({
      message: suspending
        ? `Suspend "${cp.childPanelBrandName || cp.email}"? The owner will be blocked from their dashboard.`
        : `Activate "${cp.childPanelBrandName || cp.email}"?`,
      danger:     suspending,
      showReason: suspending,
      onConfirm: async (reason) => {
        try {
          await API.put(`/admin/child-panels/${id}/toggle-status`, {
            ...(reason ? { reason } : {}),
          });
          setCp((prev) => ({
            ...prev,
            childPanelIsActive:      !prev.childPanelIsActive,
            childPanelSuspendReason: suspending ? reason : null,
          }));
          toast.success(suspending ? "Panel suspended" : "Panel activated");
        } catch {
          toast.error("Failed to update status");
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  const handleCommissionSaved = async (rate) => {
    try {
      await API.put(`/admin/child-panels/${id}/commission`, { commission: rate });
      setCp((prev) => ({ ...prev, childPanelCommissionRate: rate }));
      toast.success("Commission updated");
    } catch {
      toast.error("Failed to update commission");
    }
  };

  const handleBillingSaved = (patch) => {
    setCp((prev) => ({ ...prev, ...patch }));
  };

  const handleDeactivate = () => {
    setConfirm({
      message: `Permanently deactivate "${cp.childPanelBrandName || "this panel"}"? Their account stays intact but the panel is shut down.`,
      danger:     true,
      showReason: false,
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

  // ── Pagination handlers ────────────────────────────────────────────
  const goResellerPage = (p) => { setResellerPage(p); fetchDetails(p, userPage, orderPage); };
  const goUserPage     = (p) => { setUserPage(p);     fetchDetails(resellerPage, p, orderPage); };
  const goOrderPage    = (p) => { setOrderPage(p);    fetchDetails(resellerPage, userPage, p); };

  // ── Tab label helper ───────────────────────────────────────────────
  const tabLabel = (id) => {
    if (id === "resellers") return `Resellers (${stats.totalResellers ?? 0})`;
    if (id === "users")     return `Users (${stats.totalUsers ?? 0})`;
    if (id === "orders")    return `Orders (${stats.totalOrders ?? 0})`;
    return id;
  };

  // ── Loading / not found ────────────────────────────────────────────
  if (loading && !cp) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!cp) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Child panel not found</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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
              <p className="text-xs text-gray-500">{cp.email}</p>
            </div>

            {/* Active badge */}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              cp.childPanelIsActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}>
              {cp.childPanelIsActive ? "Active" : "Suspended"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Suspend / Activate */}
            <button
              onClick={handleToggle}
              className={`text-sm px-4 py-2 rounded-lg font-semibold transition ${
                cp.childPanelIsActive
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {cp.childPanelIsActive ? "Suspend Panel" : "Activate Panel"}
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchDetails(resellerPage, userPage, orderPage)}
              className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <CPDetailStatCards stats={stats} />

        {/* ── Info + Controls ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CPDetailInfoCard cp={cp} />
          <CPDetailControls
            cp={cp}
            onCommissionSaved={handleCommissionSaved}
            onBillingSaved={handleBillingSaved}
            onDeactivate={handleDeactivate}
          />
        </div>

        {/* ── Tabbed data: Resellers | Users | Orders ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b bg-gray-50">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === t.id
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tabLabel(t.id)}
              </button>
            ))}

            {/* Loading indicator inside tab bar */}
            {loading && (
              <div className="ml-auto flex items-center pr-4">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="p-5">
            {activeTab === "resellers" && (
              <CPDetailResellersTab
                resellers={resellers}
                stats={stats}
                pagination={pagination}
                page={resellerPage}
                onPageChange={goResellerPage}
              />
            )}

            {activeTab === "users" && (
              <CPDetailUsersTab
                users={users}
                pagination={pagination}
                page={userPage}
                onPageChange={goUserPage}
              />
            )}

            {activeTab === "orders" && (
              <CPDetailOrdersTab
                orders={orders}
                stats={stats}
                pagination={pagination}
                page={orderPage}
                onPageChange={goOrderPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm modal ── */}
      {confirm && (
        <CPConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          showReason={confirm.showReason}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
                                                             }
