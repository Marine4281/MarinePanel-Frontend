// src/components/reseller/ResellerAdminStats.jsx
import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiGlobe,
} from "react-icons/fi";

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h3 className="text-lg font-semibold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        {icon}
      </div>
    </div>
  );
};

const ResellerStats = ({ reseller, stats, refresh }) => {
  const [commission, setCommission] = useState(
    reseller.resellerCommissionRate || 0
  );
  const [loading, setLoading] = useState(false);

  const formatMoney = (num) => `$${Number(num || 0).toFixed(4)}`;

  const updateCommission = async () => {
    try {
      setLoading(true);
      await API.put(`/admin/resellers/${reseller._id}/commission`, {
        commission,
      });
      toast.success("Commission updated");
      refresh();
    } catch {
      toast.error("Failed to update commission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Wallet Balance"
          value={formatMoney(stats.wallet)}
          icon={<FiDollarSign size={18} />}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FiShoppingCart size={18} />}
        />
        <StatCard
          title="Revenue"
          value={formatMoney(stats.totalRevenue)}
          icon={<FiTrendingUp size={18} />}
        />
        <StatCard
          title="Earnings"
          value={formatMoney(stats.resellerEarnings)}
          icon={<FiDollarSign size={18} />}
        />
        <StatCard
          title="Free Orders"
          value={stats.freeOrders}
          icon={<FiUsers size={18} />}
        />

        {/* NEW COUNTRY CARD */}
        <StatCard
          title="Top Country"
          value={stats.topCountry || "N/A"}
          icon={<FiGlobe size={18} />}
        />
      </div>

      {/* COMMISSION CONTROL */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Commission Settings
          </h3>
          <p className="text-xs text-gray-500">
            Set reseller profit percentage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="border rounded-xl px-3 py-2 w-24 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              %
            </span>
          </div>

          <button
            onClick={updateCommission}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResellerStats;
