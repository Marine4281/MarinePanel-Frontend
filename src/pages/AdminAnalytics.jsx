// src/pages/AdminAnalytics.jsx

import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

function formatDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${m}/${d}`;
}

function formatDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

const StatCard = ({ label, value, tone = "gray" }) => {
  const tones = {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    green: "border-green-200 bg-green-50 text-green-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
  };
  return (
    <div className={`flex-1 min-w-[150px] rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div className="text-xs font-medium opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [realtimeUsers, setRealtimeUsers] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, ts, tp, src] = await Promise.all([
        API.get("/admin/analytics/overview", { params: { range } }),
        API.get("/admin/analytics/timeseries", { params: { range } }),
        API.get("/admin/analytics/top-pages", { params: { range, limit: 10 } }),
        API.get("/admin/analytics/traffic-sources", { params: { range } }),
      ]);
      setOverview(ov.data);
      setTimeseries(ts.data.map((row) => ({ ...row, label: formatDate(row.date) })));
      setTopPages(tp.data);
      setTrafficSources(src.data);
    } catch (err) {
      console.error("Analytics load error:", err);
      const msg = err?.response?.data?.message || "Failed to load analytics data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime active users — refresh every 30s
  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const res = await API.get("/admin/analytics/realtime");
        setRealtimeUsers(res.data.activeUsers);
      } catch {
        // silent — realtime is a nice-to-have, don't spam toasts
      }
    };
    fetchRealtime();
    const id = setInterval(fetchRealtime, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Google Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Site traffic and engagement (GA4)</p>
          </div>

          <div className="flex items-center gap-3">
            {realtimeUsers !== null && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-sm text-green-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-semibold">{realtimeUsers}</span> online now
              </div>
            )}

            <div className="flex gap-1 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    range === r.value
                      ? "bg-orange-500 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error} — check that <code>GSC_CREDENTIALS</code> / <code>GSC_PROPERTY_URL</code> are
            set and the service account has Viewer access on the GA4 property.
          </div>
        )}

        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="flex gap-3 flex-wrap mb-6">
              <StatCard label="Active Users" value={overview?.activeUsers ?? 0} tone="orange" />
              <StatCard label="New Users" value={overview?.newUsers ?? 0} tone="blue" />
              <StatCard label="Sessions" value={overview?.sessions ?? 0} tone="green" />
              <StatCard label="Page Views" value={overview?.pageViews ?? 0} tone="gray" />
              <StatCard
                label="Bounce Rate"
                value={`${(Number(overview?.bounceRate) || 0).toFixed(1)}%`}
                tone="gray"
              />
              <StatCard
                label="Avg. Session"
                value={formatDuration(overview?.avgSessionDuration)}
                tone="gray"
              />
            </div>

            {/* Trend chart */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Users &amp; Sessions</h2>
              {timeseries.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No data for this range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={timeseries}>
                    <defs>
                      <linearGradient id="usersColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sessionsColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stroke="#f97316"
                      fill="url(#usersColor)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      name="Sessions"
                      stroke="#3b82f6"
                      fill="url(#sessionsColor)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top pages + traffic sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Top Pages</h2>
                {topPages.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-gray-400">
                    No data for this range
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                        <th className="pb-2 font-medium">Page</th>
                        <th className="pb-2 font-medium text-right">Views</th>
                        <th className="pb-2 font-medium text-right">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPages.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 pr-2 text-gray-700 truncate max-w-[220px]" title={p.path}>
                            {p.path}
                          </td>
                          <td className="py-2 text-right text-gray-600">{p.pageViews}</td>
                          <td className="py-2 text-right text-gray-600">{p.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Traffic Sources</h2>
                {trafficSources.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-gray-400">
                    No data for this range
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={trafficSources.map((s) => ({
                        ...s,
                        label: s.source === "(direct)" ? "Direct" : s.source,
                      }))}
                      layout="vertical"
                      margin={{ left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={90}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="sessions" name="Sessions" fill="#f97316" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
