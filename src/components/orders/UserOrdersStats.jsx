import { useEffect, useState } from "react";
import API from "../../api/axios";

const UserOrdersStats = ({ status, fromDate, toDate }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    partial: 0,
    failed: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await API.get("/orders/my-orders/stats", {
        params: { status, fromDate, toDate },
      });

      setStats(res.data);
    } catch {
      console.error("Stats failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [status, fromDate, toDate]);

  const Card = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">
        {loading ? "..." : value}
      </h3>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <Card title="Total" value={stats.total || 0} />
      <Card title="Pending" value={stats.pending || 0} />
      <Card title="Processing" value={stats.processing || 0} />
      <Card title="Completed" value={stats.completed || 0} />
      <Card title="Partial" value={stats.partial || 0} />
      <Card title="Failed" value={stats.failed || 0} />
    </div>
  );
};

export default UserOrdersStats;
