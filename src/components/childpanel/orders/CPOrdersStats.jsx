// src/components/childpanel/orders/CPOrdersStats.jsx
import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { FiDollarSign, FiTrendingUp } from "react-icons/fi";

export default function CPOrdersStats() {
  const [stats, setStats] = useState({ totalBalance: 0, totalUsed: 0 });

  useEffect(() => {
    API.get("/cp/orders/wallets/stats")
      .then((res) => setStats(res.data || {}))
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <FiDollarSign size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Total in User Wallets
          </p>
          <p className="text-xl font-bold text-gray-800">
            ${Number(stats.totalBalance || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          <FiTrendingUp size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Total Money Used
          </p>
          <p className="text-xl font-bold text-gray-800">
            ${Number(stats.totalUsed || 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
