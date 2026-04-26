// src/pages/reseller/ResellerUsers.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="flex min-h-screen bg-gray-100">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
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

      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">
          <button onClick={() => setMenuOpen(true)} className="text-orange-500 text-2xl">
            <FiMenu />
          </button>
          <h1 className="text-lg font-bold text-orange-500">Reseller Users</h1>
          <FiLogOut />
        </header>

        <main className="p-6 flex-1 overflow-auto pb-24">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Loading reseller users...
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">

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
                      {paginatedUsers.map((u) => (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{u.email}</td>
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
                            ) : "-"}
                          </td>
                          <td className="px-4 py-2">${u.balance?.toFixed(2) || 0}</td>
                          <td className="px-4 py-2">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
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
                          <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-gray-400">
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
