// src/components/api/ApiLogsTab.jsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import API from "../../api/axios";

const ApiLogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/api/logs", { params: { page } });
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch API logs", err);
      toast.error("Failed to load request log");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Request Log</h3>
        <p className="text-xs text-gray-400 mt-0.5">Most recent API calls, newest first</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Error</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No API calls logged yet</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{l.user?.username || "Unknown"}</td>
                  <td className="px-4 py-3 font-mono text-xs bg-gray-50 rounded w-fit px-2 py-1">
                    {l.apiKeyMasked}
                  </td>
                  <td className="px-4 py-3 capitalize">{l.action}</td>
                  <td className="px-4 py-3">
                    {l.success ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <FiCheckCircle /> OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <FiXCircle /> Error
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500">{l.errorMessage || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-100">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 bg-white border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="px-4 py-2 bg-white border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiLogsTab;
