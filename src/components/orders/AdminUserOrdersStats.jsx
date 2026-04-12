//src/components/orders/AdminUserOrdersStats.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

const OrdersStats = ({ search, status, fromDate, toDate }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    partial: 0, // ✅ added
    failed: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/user-orders/stats", {
        params: {
          search,
          status,
          fromDate,
          toDate,
        },
      });

      setStats({
        total: res.data.total || 0,
        pending: res.data.pending || 0,
        processing: res.data.processing || 0,
        completed: res.data.completed || 0,
        partial: res.data.partial || 0, // ✅ added
        failed: res.data.failed || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 REFETCH WHEN FILTERS CHANGE */
  useEffect(() => {
    fetchStats();
  }, [search, status, fromDate, toDate]);

  const Card = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">
        {loading ? "..." : value}
      </h3>
    </div>
  );

  return (
    <div className="grid grid-cols-6 gap-4 mb-6"> {/* ✅ updated cols */}
      <Card title="Total Orders" value={stats.total} />
      <Card title="Pending" value={stats.pending} />
      <Card title="Processing" value={stats.processing} />
      <Card title="Completed" value={stats.completed} />
      <Card title="Partial" value={stats.partial} /> {/* ✅ added */}
      <Card title="Failed" value={stats.failed} />
    </div>
  );
};

export default AdminUserOrdersStats;
