// src/pages/reseller/ResellerUsers.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const USERS_PER_PAGE = 20;

export default function ResellerUsers() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { logout, user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const dashRes = await API.get("/reseller/dashboard");
        setBrandName(dashRes.data.brandName);

        const usersRes = await API.get("/reseller/users");

        const sorted = [...usersRes.data].sort((a, b) => {
          if (a._id === currentUserId) return -1;
          if (b._id === currentUserId) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setUsers(sorted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load reseller users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ===============================
     FILTER
  =============================== */
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        (u.phone || "").toLowerCase().includes(lower) ||
        (u.country || "").toLowerCase().includes(lower)
    );
  }, [search, users]);

  /* ===============================
     PAGINATION
  =============================== */
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(1, currentPage - 2);
      const right = Math.min(totalPages, currentPage + 2);

      if (left > 1) pages.push(1, "...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages) pages.push("...", totalPages);
    }

    return pages;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md p-6">
        <h1 className="text-xl font-bold text-orange-500 mb-6">
          {brandName || "Reseller Panel"}
        </h1>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
          >
            <FiArrowLeft /> Back
          </button>
          <Link to="/reseller/dashboard" className="font-semibold text-gray-700 hover:text-orange-500">
            Dashboard
          </Link>
          <Link to="/reseller/users" className="font-semibold text-orange-500">
            Users
          </Link>
          <Link to="/reseller/orders" className="font-semibold text-gray-700 hover:text-orange-500">
            Orders
          </Link>
          <Link to="/reseller/branding" className="font-semibold text-gray-700 hover:text-orange-500">
            Branding
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-red-500 mt-6">
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Navbar */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-orange-500 text-2xl">
            <FiMenu />
          </button>
          <h1 className="text-lg font-bold text-orange-500">Reseller Users</h1>
          <button onClick={logout}><FiLogOut /></button>
        </header>

        {/* Mobile Sidebar */}
        {menuOpen && (
          <aside className="lg:hidden absolute z-50 bg-white shadow-md w-64 h-full p-6">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
              >
                <FiArrowLeft /> Back
              </button>
              <Link to="/reseller/dashboard">Dashboard</Link>
              <Link to="/reseller/users">Users</Link>
              <Link to="/reseller/orders">Orders</Link>
              <Link to="/reseller/branding">Branding</Link>
              <button onClick={logout} className="text-red-500">Logout</button>
            </nav>
          </aside>
        )}

        <main className="p-6 flex-1 overflow-auto pb-24">

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading reseller users...</div>
          ) : (
            <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">

              <h2 className="text-lg font-bold mb-4 text-orange-500">
                All Reseller Users ({filteredUsers.length})
              </h2>

              {/* Search */}
              <input
                type="text"
                placeholder="Search by email, phone or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 p-2 border rounded w-full"
              />

              {filteredUsers.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                <>
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                        <th className="px-4 py-2 text-left">Country</th>
                        <th className="px-4 py-2 text-left">Wallet</th>
                        <th className="px-4 py-2 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u) => {
                        const isCurrentUser = u._id === currentUserId;
                        return (
                          <tr
                            key={u._id}
                            className={`border-b hover:bg-gray-50 ${isCurrentUser ? "bg-orange-50" : ""}`}
                          >
                            <td className="px-4 py-2">
                              <span>{u.email}</span>
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">{u.phone || "-"}</td>
                            <td className="px-4 py-2">
                              {u.countryCode ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={`https://flagcdn.com/24x18/${u.countryCode.toLowerCase()}.png`}
                                    alt={u.country}
                                    className="w-6 h-4 object-cover"
                                  />
                                  <span>{u.country}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-2">${u.balance?.toFixed(2) || 0}</td>
                            <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
                      <button
                        onClick={() => setCurrentPage((p) => p - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>

                      {getPageNumbers().map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 py-1.5 text-sm text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                              currentPage === p
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>

                      <span className="text-xs text-gray-400 ml-2">
                        {filteredUsers.length} total · Page {currentPage} of {totalPages}
                      </span>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
                }
