// src/components/admin/childpanel/CPDetailStatCards.jsx

import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiUsers } from "react-icons/fi";
import { fmt } from "./CPDetailHelpers";

function StatCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-500",
    green:  "bg-green-50 text-green-500",
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

export default function CPDetailStatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Panel Wallet"
        value={`$${fmt(stats.childPanelWallet)}`}
        icon={<FiDollarSign size={18} />}
        color="green"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders ?? 0}
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
        title="Resellers / Users"
        value={`${stats.totalResellers ?? 0} / ${stats.totalUsers ?? 0}`}
        icon={<FiUsers size={18} />}
        color="purple"
      />
    </div>
  );
}
