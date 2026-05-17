// src/components/childpanel/orders/CPOrdersStats.jsx
import { useEffect, useState } from "react";
import API from "../../../api/axios";

const CARDS = [
  { key: "total",      label: "Total",      color: "bg-gray-100 text-gray-700" },
  { key: "pending",    label: "Pending",    color: "bg-yellow-100 text-yellow-700" },
  { key: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { key: "completed",  label: "Completed",  color: "bg-green-100 text-green-700" },
  { key: "partial",    label: "Partial",    color: "bg-orange-100 text-orange-700" },
  { key: "failed",     label: "Failed",     color: "bg-red-100 text-red-700" },
];

export default function CPOrdersStats({ search, status, fromDate, toDate }) {
  const [stats, setStats] = useState({ total:0, pending:0, processing:0, completed:0, partial:0, failed:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/cp/orders/stats", { params: { search, status, fromDate, toDate } })
      .then((r) => setStats(r.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, status, fromDate, toDate]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
      {CARDS.map(({ key, label, color }) => (
        <div key={key} className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className={`text-lg font-bold rounded px-1 inline-block ${color}`}>
            {loading ? "…" : stats[key] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
