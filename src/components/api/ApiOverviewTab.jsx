// src/components/api/ApiOverviewTab.jsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiZap, FiShoppingBag, FiUsers, FiAlertTriangle, FiSave } from "react-icons/fi";
import API from "../../api/axios";
import ApiStatCard from "./ApiStatCard";
import ApiToggleSwitch from "./ApiToggleSwitch";
import ApiUsageChart from "./ApiUsageChart";

const ApiOverviewTab = ({ overview, loading, onOverviewChange }) => {
  const [rateLimit, setRateLimit] = useState(180);
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [usage, setUsage] = useState({ byAction: [], timeSeries: [] });
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    if (overview?.apiRateLimitPerMinute) setRateLimit(overview.apiRateLimitPerMinute);
  }, [overview?.apiRateLimitPerMinute]);

  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const { data } = await API.get("/admin/api/usage");
      setUsage(data);
    } catch (err) {
      console.error("Failed to fetch API usage", err);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const toggleApiEnabled = async () => {
    if (!overview) return;
    setSavingToggle(true);
    try {
      const { data } = await API.put("/admin/api/settings", { apiEnabled: !overview.apiEnabled });
      onOverviewChange((prev) => ({ ...prev, apiEnabled: data.apiEnabled }));
      toast.success(data.apiEnabled ? "API enabled" : "API disabled");
    } catch (err) {
      toast.error("Failed to update API status");
    } finally {
      setSavingToggle(false);
    }
  };

  const saveRateLimit = async () => {
    if (!rateLimit || rateLimit < 1) {
      toast.error("Rate limit must be a positive number");
      return;
    }
    setSavingRate(true);
    try {
      await API.put("/admin/api/settings", { apiRateLimitPerMinute: Number(rateLimit) });
      onOverviewChange((prev) => ({ ...prev, apiRateLimitPerMinute: Number(rateLimit) }));
      toast.success("Rate limit updated");
    } catch (err) {
      toast.error("Failed to update rate limit");
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Global API Controls</h3>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <ApiToggleSwitch checked={!!overview?.apiEnabled} onChange={toggleApiEnabled} disabled={savingToggle || !overview} />
            <div>
              <p className="text-sm font-medium text-gray-700">API Access</p>
              <p className="text-xs text-gray-400">Master switch for all API requests</p>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Rate limit (req/min per key)</label>
              <input
                type="number"
                min="1"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button
              onClick={saveRateLimit}
              disabled={savingRate}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              <FiSave /> {savingRate ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ApiStatCard icon={FiShoppingBag} label="Total API Orders" value={overview?.totalApiOrders ?? 0} color="orange" loading={loading} />
        <ApiStatCard icon={FiUsers} label="Active API Users" value={overview?.totalApiUsers ?? 0} color="blue" loading={loading} />
        <ApiStatCard icon={FiZap} label="Calls (24h)" value={overview?.last24hCalls ?? 0} color="green" loading={loading} />
        <ApiStatCard icon={FiAlertTriangle} label="Errors (24h)" value={overview?.last24hErrors ?? 0} color="red" loading={loading} />
      </div>

      <ApiUsageChart timeSeries={usage.timeSeries} loading={usageLoading} />

      {/* By-action breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Calls by Action</h3>
        {usage.byAction.length === 0 ? (
          <p className="text-sm text-gray-400">No API activity in this period</p>
        ) : (
          <div className="space-y-3">
            {usage.byAction.map((a) => {
              const total = a.success + a.error;
              const successPct = total > 0 ? (a.success / total) * 100 : 0;
              return (
                <div key={a.action}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{a.action}</span>
                    <span className="text-gray-400">{total} calls</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-green-500" style={{ width: `${successPct}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${100 - successPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiOverviewTab;
