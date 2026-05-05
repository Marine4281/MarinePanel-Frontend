// src/components/childpanel/services/CPRateChangesPanel.jsx
// Mirrors admin RateChangesPanel but calls /cp/services/* endpoints.

import { useState, useCallback } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { FiRefreshCw, FiArrowUp, FiArrowDown, FiCheck } from "react-icons/fi";

const fmt = (n) => Number(n || 0).toFixed(4);

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function CPRateChangesPanel({ onSynced }) {
  const [changes, setChanges]     = useState(null); // null = not fetched yet
  const [loading, setLoading]     = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const fetchChanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/cp/services/rate-changes");
      setChanges(res.data || []);
    } catch {
      toast.error("Failed to fetch rate changes");
    } finally {
      setLoading(false);
    }
  }, []);

  const syncOne = async (item) => {
    setSyncingId(item._id);
    try {
      await API.patch(`/cp/services/${item._id}/sync-rate`, { newRate: item.newRate });
      toast.success(`${item.name} synced`);
      setChanges((prev) => prev.filter((c) => c._id !== item._id));
      onSynced?.();
    } catch {
      toast.error("Failed to sync rate");
    } finally {
      setSyncingId(null);
    }
  };

  const syncAll = async () => {
    if (!changes?.length) return;
    setSyncingAll(true);
    try {
      const res = await API.patch("/cp/services/sync-all-rates", {
        changes: changes.map((c) => ({ _id: c._id, newRate: c.newRate })),
      });
      toast.success(`${res.data.synced} rate(s) synced`);
      setChanges([]);
      onSynced?.();
    } catch {
      toast.error("Failed to sync all rates");
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Rate Changes</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Compare your stored rates against live provider rates and sync them.
          </p>
        </div>
        <button
          onClick={fetchChanges}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Checking..." : "Check Rate Changes"}
        </button>
      </div>

      {/* Not fetched yet */}
      {changes === null && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-sm text-blue-700">
          Click <strong>Check Rate Changes</strong> to fetch live rates from your providers and compare.
        </div>
      )}

      {loading && <Spinner />}

      {/* Results */}
      {changes !== null && !loading && (
        <>
          {changes.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-sm text-green-700">
              ✅ All rates are up to date. No changes detected.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <strong className="text-orange-600">{changes.length}</strong> service(s) have rate changes.
                </p>
                <button
                  onClick={syncAll}
                  disabled={syncingAll}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition"
                >
                  <FiCheck size={14} />
                  {syncingAll ? "Syncing..." : "Sync All"}
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-800 text-white text-xs uppercase">
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Provider</th>
                      <th className="px-4 py-3">Your Rate</th>
                      <th className="px-4 py-3">Provider Rate</th>
                      <th className="px-4 py-3">Diff</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((c, i) => {
                      const up = c.diff > 0;
                      return (
                        <tr key={c._id} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/30`}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800 text-xs">{c.name}</div>
                            <div className="text-[10px] text-gray-400">{c.category} · ID {c.serviceId}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{c.provider}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-700">${fmt(c.storedRate)}</td>
                          <td className="px-4 py-3 text-xs font-mono font-bold text-gray-900">${fmt(c.newRate)}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-red-600" : "text-green-600"}`}>
                              {up ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
                              {up ? "+" : ""}{fmt(c.diff)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => syncOne(c)}
                              disabled={syncingId === c._id}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                            >
                              {syncingId === c._id ? "Syncing..." : "Sync"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
