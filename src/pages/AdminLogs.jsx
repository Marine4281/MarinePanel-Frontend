// pages/AdminLogs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/admin-logs", {
        withCredentials: true, // ✅ send cookie automatically
      });

      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        setError("Session expired. Redirecting to login...");

        // ✅ clear any old storage just in case
        localStorage.removeItem("token");

        // ✅ redirect to login
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Staff Actions</h2>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-6 text-gray-500">
            Loading logs...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-4 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Logs Table */}
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
                  logs.map((log) => (
                    <tr key={log._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        {log.admin?.name || log.admin?.email || "N/A"}
                      </td>
                      <td className="p-3 font-medium">
                        {log.action || "-"}
                      </td>
                      <td className="p-3">
                        {log.targetType || "-"}
                      </td>
                      <td className="p-3">
                        {log.description || "-"}
                      </td>
                      <td className="p-3 text-gray-500">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
