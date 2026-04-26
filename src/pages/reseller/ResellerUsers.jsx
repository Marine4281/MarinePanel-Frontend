// src/pages/reseller/ResellerUsers.jsx

import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";

import Sidebar from "../../components/reseller/Sidebar";

const USERS_PER_PAGE = 20;

export default function ResellerUsers() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const dashRes = await API.get("/reseller/dashboard");
        setBrandName(dashRes.data.brandName);

        const usersRes = await API.get("/reseller/users");

        const sorted = [...usersRes.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
    <div className="flex min-h-screen w-full max-w-full bg-gray-100 overflow-x-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 flex-shrink-0">
        <Sidebar brandName={brandName} />
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <Sidebar
          brandName={brandName}
          mobile
          close={() => setMenuOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md w-full">
          <button onClick={() => setMenuOpen(true)}>
            <FiMenu size={20} />
          </button>
          <h1 className="text-lg font-bold text-orange-500">Reseller Users</h1>
          <FiLogOut size={20} />
        </header>

        <main className="p-4 md:p-6 flex-1 w-full max-w-full overflow-x-hidden pb-24">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Loading reseller users...
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-4 w-full max-w-full">

              <h2 className="text-lg font-bold mb-4 text-orange-500">
                All Reseller Users ({filteredUsers.length})
              </h2>

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
                  {/* TABLE WRAPPER FIX */}
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[700px] w-full table-auto">
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
                        {paginatedUsers.map((u) => (
                          <tr key={u._id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 max-w-[200px] truncate">
                              {u.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {u.phone || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {u.countryCode ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={`https://flagcdn.com/24x18/${u.countryCode.toLowerCase()}.png`}
                                    alt={u.country}
                                    className="w-6 h-4 object-cover flex-shrink-0"
                                  />
                                  <span className="truncate">{u.country}</span>
                                </div>
                              ) : "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              ${u.balance?.toFixed(2) || 0}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
                      <button
                        onClick={() => setCurrentPage((p) => p - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-white border text-sm hover:bg-gray-50 disabled:opacity-40"
                      >
                        Prev
                      </button>

                      {getPageNumbers().map((p, idx) =>
                        p === "..." ? (
                          <span key={idx} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1.5 rounded-lg text-sm border ${
                              currentPage === p
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-white border text-sm hover:bg-gray-50 disabled:opacity-40"
                      >
                        Next
                      </button>
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
