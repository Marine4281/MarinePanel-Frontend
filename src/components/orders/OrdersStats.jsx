const OrdersStats = ({ orders }) => {
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
    failed: orders.filter((o) => o.status === "failed").length,
  };

  const Card = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <Card title="Total" value={stats.total} />
      <Card title="Pending" value={stats.pending} />
      <Card title="Processing" value={stats.processing} />
      <Card title="Completed" value={stats.completed} />
      <Card title="Failed" value={stats.failed} />
    </div>
  );
};

export default OrdersStats;
