// src/components/RevenueTrendChart.jsx
import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../api/axios";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
];

const RangeSubtitles = {
  today: "Showing today, by hour",
  week: "Showing this week, by day",
  month: "Showing this month, day by day",
  year: "Showing this year, by month",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="text-gray-300 mb-1">{label}</p>
      <p className="font-semibold">${Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

const RevenueTrendChart = ({ country = "All" }) => {
  const [range, setRange] = useState("week");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrend = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/revenue-trend", {
        params: { range, country },
      });
      const labels = data.labels || [];
      const values = data.data || [];
      setChartData(labels.map((label, i) => ({ label, revenue: values[i] || 0 })));
    } catch (err) {
      console.error("Failed to fetch revenue trend", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [range, country]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">{RangeSubtitles[range]}</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                range === r.key
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            No revenue data for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#F3F4F6" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueTrendChart;
