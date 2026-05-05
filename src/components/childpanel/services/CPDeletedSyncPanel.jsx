// src/components/childpanel/services/CPDeletedSyncPanel.jsx
// Shows services that exist in CP catalog but were deleted from provider side.

import { useState, useCallback } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { FiRefreshCw, FiTrash2, FiAlertTriangle } from "react-icons/fi";

const fmt = (n) => Number(n || 0).toFixed(4);

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function CPDeletedSyncPanel({ onDeleted }) {
  const [deleted, setDeleted]     = useState(null); // null = not checked yet
  const [loading, setLoading]     = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [removingAll, setRemovingAll] = useState(false);
  const [selected, setSelected]   = useState([]);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    setSelected([]);
    try {
      const res = await API.get("/cp/services/deleted-sync");
      setDeleted(res.data || []);
    } catch {
      toast.error("Failed to check deleted services");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeOne = async (id) => {
    setRemovingId(id);
    try {
      await API.delete(`/cp/services/${id}`);
      setDeleted((prev) => prev.filter((s) => s._id !== id));
      setSelected((prev) => prev.filter((i) => i !== id));
      toast.success("Service removed");
      onDeleted?.();
    } catch {
      toast.error("Failed to remove service");
    } finally {
      setRemovingId(null);
    }
  };

  const removeSelected = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Remove ${selected.length} service(s)? This cannot be undone.`)) return;
    setRemovingAll(true);
    try {
      await API.delete("/cp/services/bulk", { data: { ids: selected } });
      setDeleted((prev) => prev.filter((s) => !selected.includes(s._id)));
      setSelected([]);
      toast.success(`${selected.length} service(s) removed`);
      onDeleted?.();
    } catch {
      toast.error("Failed to remove services");
    } finally {
      setRemovingAll(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!deleted?.length) return;
    setSelected((prev) =>
      prev.length === deleted.length ? [] : deleted.map((s) => s._id)
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Deleted Services Sync</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Find services removed from your provider that still exist in your catalog.
          </p>
        </div>
        <button
          onClick={fetchDeleted}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Scanning..." : "Scan Providers"}
        </button>
      </div>

      {/* Not scanned yet */}
      {deleted === null && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-sm text-amber-700">
          <FiAlertTriangle size={20} className="mx-auto mb-2" />
          Click <strong>Scan Providers</strong> to check which of your services no longer exist on the provider side.
        </div>
      )}

      {loading && <Spinner />}

      {deleted !== null && !loading && (
        <>
          {deleted.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-sm text-green-700">
              ✅ No deleted services found. Your catalog is in sync with all providers.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiAlertTriangle size={15} className="text-orange-500" />
                  <strong className="text-orange-600">{deleted.length}</strong> service(s) removed from provider side.
                </div>
                {selected.length > 0 && (
                  <button
                    onClick={removeSelected}
                    disabled={removingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 transition"
                  >
                    <FiTrash2 size={14} />
                    {removingAll ? "Removing..." : `Remove Selected (${selected.length})`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-red-600 text-white text-xs uppercase">
                      <th className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.length === deleted.length && deleted.length > 0}
                          onChange={toggleAll}
                          className="accent-white"
                        />
                      </th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Provider</th>
                      <th className="px-4 py-3">Rate</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deleted.map((s, i) => (
                      <tr key={s._id} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-red-50/20`}>
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(s._id)}
                            onChange={() => toggleSelect(s._id)}
                            className="accent-red-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800 text-xs">{s.name}</div>
                          <div className="text-[10px] text-gray-400">ID {s.serviceId} · Provider ID {s.providerServiceId}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.provider}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-700">${fmt(s.rate)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {s.status ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeOne(s._id)}
                            disabled={removingId === s._id}
                            className="flex items-center gap-1 mx-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                          >
                            <FiTrash2 size={11} />
                            {removingId === s._id ? "Removing..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    ))}
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
