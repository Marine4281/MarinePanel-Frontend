// src/pages/childpanel/ChildPanelUsers.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

const TYPE_CONFIG = {
  Admin:    { label: "Admin", bg: "bg-red-100",    text: "text-red-700"    },
  Reseller: { label: "RS",    bg: "bg-purple-100", text: "text-purple-700" },
  API:      { label: "API",   bg: "bg-yellow-100", text: "text-yellow-700" },
  User:     { label: "User",  bg: "bg-gray-100",   text: "text-gray-500"   },
};

// Always returns an array — never throws
const getUserTypes = (u) => {
  if (!u || typeof u !== "object") return ["User"];
  // Prefer pre-computed field from backend
  if (Array.isArray(u.userTypes) && u.userTypes.length > 0) return u.userTypes;
  const t = [];
  if (u.isAdmin)          t.push("Admin");
  if (u.isReseller)       t.push("Reseller");
  if (u.apiAccessEnabled) t.push("API");
  return t.length > 0 ? t : ["User"];
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.User;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

const StatusBadge = ({ user }) => {
  if (!user) return null;
  if (user.isBlocked)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Blocked</span>;
  if (user.isFrozen)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Frozen</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>;
};

// Safe page buttons — always returns an array
const pageButtons = (current, total) => {
  const t = Number(total) || 0;
  const c = Number(current) || 1;
  if (t <= 0) return [];
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
  if (c <= 4) return [1, 2, 3, 4, 5, "...", t];
  if (c >= t - 3) return [1, "...", t - 4, t - 3, t - 2, t - 1, t];
  return [1, "...", c - 1, c, c + 1, "...", t];
};

export default function ChildPanelUsers() {
  const navigate = useNavigate();

  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchUsers = useCallback(async (p, q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p || 1, limit: 20 });
      if (q && q.trim()) params.set("search", q.trim());

      const res = await API.get(`/cp/users?${params.toString()}`);

      // Handle both array response (old) and paginated object (new)
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setTotal(res.data.length);
        setPages(1);
        setPage(1);
      } else {
        setUsers(Array.isArray(res.data.data) ? res.data.data : []);
        setTotal(res.data.pagination?.total || 0);
        setPages(res.data.pagination?.pages || 1);
        setPage(res.data.pagination?.page  || 1);
      }
    } catch (err) {
      console.error("ChildPanelUsers fetch error:", err);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, debouncedSearch);
  }, [page, debouncedSearch, fetchUsers]);

  const first = total === 0 ? 0 : (page - 1) * 20 + 1;
  const last  = Math.min(page * 20, total);

  return (
    <ChildPanelLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total} user{total !== 1 ? "s" : ""} on your panel
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="search"
                placeholder="Search email or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
            </div>
            <button
              onClick={() => fetchUsers(page, debouncedSearch)}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-500"
              title="Refresh"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">
                {debouncedSearch
                  ? `No users matching "${debouncedSearch}"`
                  : "No users on your panel yet"}
              </p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400 tracking-wider">
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Country</th>
                    <th className="px-5 py-3">Balance</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {getUserTypes(u).map((t) => (
                            <TypeBadge key={t} type={t} />
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-700 max-w-[180px] truncate">
                        {u.email}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {u.phone || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        {u.countryCode ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/24x18/${u.countryCode.toLowerCase()}.png`}
                              alt={u.country || ""}
                              className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span className="text-gray-600 text-xs">{u.country}</span>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 font-semibold text-green-600">
                        ${Number(u.balance || 0).toFixed(4)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge user={u} />
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => navigate(`/cp/users/${u._id}`)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>
                  {total === 0 ? "No results" : `Showing ${first}–${last} of ${total}`}
                </span>
                {pages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-600"
                    >‹</button>

                    {pageButtons(page, pages).map((p, i) =>
                      p === "..." ? (
                        <span key={`e${i}`} className="px-1 text-gray-300">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded font-medium transition-colors ${
                            page === p
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >{p}</button>
                      )
                    )}

                    <button
                      disabled={page === pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-600"
                    >›</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ChildPanelLayout>
  );
    }
