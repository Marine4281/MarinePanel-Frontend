// src/pages/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const TYPE_CONFIG = {
  Admin:        { label: "Admin",    bg: "bg-red-100",    text: "text-red-700"    },
  Reseller:     { label: "RS",       bg: "bg-purple-100", text: "text-purple-700" },
  "Child Panel":{ label: "CP",       bg: "bg-blue-100",   text: "text-blue-700"   },
  API:          { label: "API",      bg: "bg-yellow-100", text: "text-yellow-700" },
  User:         { label: "User",     bg: "bg-gray-100",   text: "text-gray-500"   },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.User;
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

const getUserTypes = (user) => {
  const types = [];
  if (user.isAdmin)          types.push("Admin");
  if (user.isReseller)       types.push("Reseller");
  if (user.isChildPanel)     types.push("Child Panel");
  if (user.apiAccessEnabled) types.push("API");
  if (types.length === 0)    types.push("User");
  return types;
};

const AdminUsers = () => {
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Reset to page 1 whenever search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(search) ||
      u.name?.toLowerCase().includes(q)
    );
  });

  const totalPages     = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfFirst   = (currentPage - 1) * usersPerPage;
  const currentUsers   = filteredUsers.slice(indexOfFirst, indexOfFirst + usersPerPage);

  // Smart pagination: show at most 7 page buttons
  const pageButtons = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="search"
              placeholder="Search by email, phone or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400 tracking-wider">
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Country</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const types = getUserTypes(user);
                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-orange-50/40 transition-colors group"
                    >
                      {/* Type badges */}
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {types.map((t) => (
                            <TypeBadge key={t} type={t} />
                          ))}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 font-medium text-gray-700 max-w-[200px] truncate">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3 text-gray-500">
                        {user.phone || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Country */}
                      <td className="px-5 py-3">
                        {user.countryCode ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/24x18/${user.countryCode.toLowerCase()}.png`}
                              alt={user.country}
                              className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span className="text-gray-600">{user.country}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-3">
                        <span className="font-semibold text-green-600">
                          ${Number(user.balance || 0).toFixed(4)}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer row */}
          {filteredUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing {indexOfFirst + 1}–{Math.min(indexOfFirst + usersPerPage, filteredUsers.length)} of {filteredUsers.length}
              </span>
              {/* Pagination */}
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                >
                  ‹
                </button>

                {pageButtons().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-300">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded font-medium transition-colors ${
                        currentPage === p
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
