// src/components/api/ApiUsersTab.jsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiRefreshCw, FiXCircle, FiCopy } from "react-icons/fi";
import API from "../../api/axios";
import ApiToggleSwitch from "./ApiToggleSwitch";

const ApiUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/api/users", { params: { page, search } });
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch API users", err);
      toast.error("Failed to load API users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const copyKey = (masked) => {
    navigator.clipboard.writeText(masked);
    toast.success("Copied to clipboard");
  };

  const regenerateKey = async (id) => {
    if (!window.confirm("Regenerate this user's API key? Their old key will stop working immediately.")) return;
    setBusyId(id);
    try {
      await API.post(`/admin/api/users/${id}/regenerate`);
      toast.success("API key regenerated");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to regenerate key");
    } finally {
      setBusyId(null);
    }
  };

  const revokeKey = async (id) => {
    if (!window.confirm("Revoke API access for this user?")) return;
    setBusyId(id);
    try {
      await API.post(`/admin/api/users/${id}/revoke`);
      toast.success("API access revoked");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to revoke access");
    } finally {
      setBusyId(null);
    }
  };

  const toggleUser = async (id, enabled) => {
    setBusyId(id);
    try {
      await API.put(`/admin/api/users/${id}/toggle`, { enabled });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, apiAccessEnabled: enabled } : u)));
      toast.success(enabled ? "Access enabled" : "Access disabled");
    } catch (err) {
      toast.error("Failed to update access");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">API Users</h3>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">API Key</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Orders via API</th>
              <th className="px-4 py-3 text-left">Last Used</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No API users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.username}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyKey(u.apiKeyMasked)}
                      className="flex items-center gap-1.5 font-mono text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition"
                    >
                      {u.apiKeyMasked} <FiCopy className="text-gray-400" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <ApiToggleSwitch
                      checked={u.apiAccessEnabled}
                      onChange={(val) => toggleUser(u._id, val)}
                      disabled={busyId === u._id}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{u.orderCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastUsed ? new Date(u.lastUsed).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => regenerateKey(u._id)}
                        disabled={busyId === u._id}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50"
                      >
                        <FiRefreshCw /> Regenerate
                      </button>
                      <button
                        onClick={() => revokeKey(u._id)}
                        disabled={busyId === u._id}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                      >
                        <FiXCircle /> Revoke
                      </button>
                    </div>
                  </td>
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

export default ApiUsersTab;
