// src/pages/childpanel/ChildPanelDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiUsers,
  FiShoppingCart,
  FiCreditCard,
  FiDollarSign,
  FiUserCheck,
  FiCopy,
  FiAlertCircle,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (val, decimals = 2) =>
  Number(val || 0).toFixed(decimals);

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

function StatCard({ title, value, icon, sub, color = "blue" }) {
  const colors = {
    blue: "text-blue-500 bg-blue-50",
    green: "text-green-500 bg-green-50",
    orange: "text-orange-500 bg-orange-50",
    purple: "text-purple-500 bg-purple-50",
    pink: "text-pink-500 bg-pink-50",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
      <div className={`p-3 rounded-xl text-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ======================= MINI TABLE =======================

function MiniTable({ title, rows, columns, emptyMsg }) {
  const [visible, setVisible] = useState(5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <span className="text-xs text-gray-400">{rows.length} total</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">{emptyMsg}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase">
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, visible).map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > visible && (
            <button
              onClick={() => setVisible((v) => v + 5)}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              View more
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ======================= DASHBOARD =======================

export default function ChildPanelDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, usersRes, ordersRes] = await Promise.all([
          API.get("/child-panel/dashboard"),
          API.get("/cp/users"),
          API.get("/cp/orders"),
        ]);

        setData(dashRes.data);
        setUsers(usersRes.data || usersRes.data[]);
        setOrders(ordersRes.data?.orders || []);
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const copyLink = () => {
    const domain = data?.domain || user?.childPanelSlug + ".marinepanel.online";
    navigator.clipboard.writeText(`https://${domain}`);
    toast.success("Panel link copied");
  };

  if (loading) {
    return (
      <ChildPanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ChildPanelLayout>
    );
  }

  const panelDomain =
    data?.domain ||
    (user?.childPanelSlug
      ? `${user.childPanelSlug}.marinepanel.online`
      : null);

  // Billing warning — monthly fee info
  const billingMode = user?.billingMode || data?.billingMode;
  const monthlyFee = user?.monthlyFee || data?.monthlyFee;
  const lastBilledAt = user?.lastBilledAt || data?.lastBilledAt;

  return (
    <ChildPanelLayout>
      <div className="space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {user?.childPanelBrandName || "Child Panel"} — Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back. Here's what's happening on your panel.
          </p>
        </div>

        {/* Monthly fee notice */}
        {(billingMode === "monthly" || billingMode === "both") &&
          monthlyFee > 0 && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Monthly Billing Active</p>
                <p className="text-xs mt-0.5">
                  Your panel is billed ${monthlyFee}/month.
                  {lastBilledAt && (
                    <> Last billed on {new Date(lastBilledAt).toLocaleDateString()}.</>
                  )}
                </p>
              </div>
            </div>
          )}

        {/* Panel link */}
        {panelDomain && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
              Your Panel Link
            </p>
            <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 truncate">
                https://{panelDomain}
              </span>
              <button
                onClick={copyLink}
                className="text-blue-500 hover:text-blue-700 shrink-0"
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={data?.users || 0}
            icon={<FiUsers />}
            color="blue"
          />
          <StatCard
            title="Total Orders"
            value={data?.orders || 0}
            icon={<FiShoppingCart />}
            color="orange"
          />
          <StatCard
            title="Total Resellers"
            value={data?.resellers || 0}
            icon={<FiUserCheck />}
            color="purple"
          />
          <StatCard
            title="Panel Revenue"
            value={`$${fmt(data?.revenue)}`}
            icon={<FiCreditCard />}
            color="green"
            sub="Total orders charged"
          />
          <StatCard
            title="Your Earnings"
            value={`$${fmt(data?.earnings)}`}
            icon={<FiDollarSign />}
            color="green"
            sub="Commissions earned"
          />
          <StatCard
            title="Wallet Balance"
            value={`$${fmt(data?.wallet)}`}
            icon={<FiCreditCard />}
            color="pink"
            sub="Available to withdraw"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Manage Users", path: "/child-panel/users", color: "bg-blue-600" },
            { label: "View Orders", path: "/child-panel/orders", color: "bg-orange-500" },
            { label: "Resellers", path: "/child-panel/resellers", color: "bg-purple-600" },
            { label: "Settings", path: "/child-panel/settings", color: "bg-gray-700" },
          ].map(({ label, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`${color} text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Recent users table */}
        <MiniTable
          title="Recent Users"
          emptyMsg="No users yet"
          columns={["Email", "Balance", "Joined"]}
          rows={[...users]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20)
            .map((u) => [
              <span className="truncate max-w-[160px] block">{u.email}</span>,
              <span className="text-green-600 font-medium">
                ${fmt(u.balance)}
              </span>,
              new Date(u.createdAt).toLocaleDateString(),
            ])}
        />

        {/* Recent orders table */}
        <MiniTable
          title="Recent Orders"
          emptyMsg="No orders yet"
          columns={["ID", "Service", "Charge", "Status", "Date"]}
          rows={[...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20)
            .map((o) => [
              `#${o.customOrderId || o._id?.slice(-6)}`,
              <span className="truncate max-w-[120px] block">{o.service}</span>,
              `$${fmt(o.charge)}`,
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(o.status)}`}
              >
                {o.status}
              </span>,
              new Date(o.createdAt).toLocaleDateString(),
            ])}
        />

      </div>
    </ChildPanelLayout>
  );
}
