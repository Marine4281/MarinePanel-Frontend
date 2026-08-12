// src/components/TopPerformers.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";

const METRICS = [
  { key: "revenue", label: "Revenue" },
  { key: "orders", label: "Order Count" },
];

const PerfList = ({ title, rows, metric }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const key = metric === "orders" ? "orders" : "revenue";
  const sorted = [...safeRows].sort((a, b) => (b[key] || 0) - (a[key] || 0));
  const max = sorted[0]?.[key] || 1;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        {title}
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <div key={r.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="truncate pr-2 text-gray-700">{r.name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {metric === "orders"
                    ? (r.orders || 0).toLocaleString()
                    : `$${(r.revenue || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
              </div>
              <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${((r[key] || 0) / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TopPerformers = ({ dateRange = "30days", country = "All" }) => {
  const [metric, setMetric] = useState("revenue");
  const [data, setData] = useState({ platforms: [], categories: [], services: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/top-performers", {
        params: { dateRange, country },
      });
      setData({
        platforms: Array.isArray(res.data?.platforms) ? res.data.platforms : [],
        categories: Array.isArray(res.data?.categories) ? res.data.categories : [],
        services: Array.isArray(res.data?.services) ? res.data.services : [],
      });
    } catch (err) {
      console.error("Failed to fetch top performers", err);
      setData({ platforms: [], categories: [], services: [] });
    } finally {
      setLoading(false);
    }
  }, [dateRange, country]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Best performing platforms, categories &amp; services
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                metric === m.key
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PerfList title="By Platform" rows={data.platforms} metric={metric} />
          <PerfList title="By Category" rows={data.categories} metric={metric} />
          <PerfList title="By Service" rows={data.services} metric={metric} />
        </div>
      )}
    </div>
  );
};

export default TopPerformers;
