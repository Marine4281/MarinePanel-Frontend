// pages/AdminLogs.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Map log actions to colors
  const actionColors = {
    DEMOTE_ADMIN: "bg-yellow-100 text-yellow-800",
    PROMOTE_ADMIN: "bg-green-100 text-green-800",
    UPDATE_BALANCE: "bg-blue-100 text-blue-800",
    FREEZE_USER: "bg-indigo-100 text-indigo-800",
    BLOCK_USER: "bg-red-100 text-red-800",
  };

  const fetchLogs = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/admin-logs?page=${pageNumber}&limit=50`);
      setLogs(res.data.logs || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Session expired. Redirecting to login...");
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setError("Failed to fetch admin logs");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => fetchLogs(page);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Staff Actions</h2>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-6 text-gray-500">Loading logs...</div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500 font-medium">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const colorClass =
                      actionColors[log.action?.toUpperCase()] ||
                      "bg-gray-100 text-gray-800";

                    return (
                      <tr key={log._id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          {log.admin?.name || log.admin?.email || "N/A"}
                        </td>
                        <td
                          className={`p-2 font-medium rounded-full text-sm w-max ${colorClass}`}
                        >
                          {log.action || "-"}
                        </td>
                        <td className="p-3">{log.targetType || "-"}</td>
                        <td className="p-3">{log.description || "-"}</td>
                        <td className="p-3 text-gray-500">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="p-3 text-gray-500">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
