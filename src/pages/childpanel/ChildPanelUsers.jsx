// src/pages/childpanel/ChildPanelUsers.jsx

import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiSearch,
  FiSlash,
  FiCheckCircle,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiEdit2,
  FiX,
  FiDollarSign,
} from "react-icons/fi";

const USERS_PER_PAGE = 20;

// ======================= HELPERS =======================

const fmt = (val) => Number(val || 0).toFixed(2);

const Badge = ({ label, color }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
      {label}
    </span>
  );
};

// ======================= BALANCE MODAL =======================

function BalanceModal({ user, onClose, onSave }) {
  const [value, setValue] = useState(fmt(user.balance));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return toast.error("Invalid balance");
    setLoading(true);
    await onSave(user._id, num);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Update Balance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Adjusting balance for{" "}
          <span className="font-semibold text-gray-700">{user.email}</span>
        </p>

        <div className="relative mb-4">
          <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================= CONFIRM MODAL =======================

function ConfirmModal({ message, onConfirm, onClose, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <p className="text-sm text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [balanceModal, setBalanceModal] = useState(null); // user object
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm, danger }

  // ======================= FETCH =======================

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cp/users");
      const sorted = [...(res.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUsers(sorted);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ======================= FILTER + PAGINATE =======================

  const filtered = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(lower) ||
        (u.phone || "").includes(lower) ||
        (u.country || "").toLowerCase().includes(lower)
    );
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filtered.slice(start, start + USERS_PER_PAGE);
  }, [filtered, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
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

  // ======================= ACTIONS =======================

  const updateUser = (id, patch) =>
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...patch } : u))
    );

  const handleBlock = (user) => {
    setConfirmModal({
      message: `Block ${user.email}? They won't be able to log in or place orders.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.patch(`/cp/users/${user._id}/block`);
          updateUser(user._id, { isBlocked: true });
          toast.success("User blocked");
        } catch {
          toast.error("Failed to block user");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleUnblock = async (user) => {
    try {
      await API.patch(`/cp/users/${user._id}/unblock`);
      updateUser(user._id, { isBlocked: false });
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  const handleFreeze = (user) => {
    setConfirmModal({
      message: `Freeze ${user.email}? They can log in but cannot place orders.`,
      danger: false,
      onConfirm: async () => {
        try {
          await API.patch(`/cp/users/${user._id}/freeze`);
          updateUser(user._id, { isFrozen: true });
          toast.success("User frozen");
        } catch {
          toast.error("Failed to freeze user");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleUnfreeze = async (user) => {
    try {
      await API.patch(`/cp/users/${user._id}/unfreeze`);
      updateUser(user._id, { isFrozen: false });
      toast.success("User unfrozen");
    } catch {
      toast.error("Failed to unfreeze user");
    }
  };

  const handleDelete = (user) => {
    setConfirmModal({
      message: `Permanently delete ${user.email}? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.delete(`/cp/users/${user._id}`);
          setUsers((prev) => prev.filter((u) => u._id !== user._id));
          toast.success("User deleted");
        } catch {
          toast.error("Failed to delete user");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleBalanceSave = async (id, newBalance) => {
    try {
      await API.put(`/cp/users/${id}/balance`, { balance: newBalance });
      updateUser(id, { balance: newBalance });
      toast.success("Balance updated");
      setBalanceModal(null);
    } catch {
      toast.error("Failed to update balance");
    }
  };

  // ======================= RENDER =======================

  return (
    <ChildPanelLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Users</h1>
            <p className="text-sm text-gray-500">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""} on your panel
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search email, phone, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-16">
              No users found
            </p>
          ) : (
            <>
              <table className="min-w-[750px] w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Country</th>
                    <th className="px-4 py-3 text-left">Balance</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u) => (
                    <tr key={u._id} className="border-t hover:bg-gray-50">
                      {/* Email */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="truncate font-medium text-gray-800">
                          {u.email}
                        </p>
                        {u.isReseller && (
                          <span className="text-xs text-purple-500">Reseller</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {u.phone || "—"}
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {u.countryCode ? (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={`https://flagcdn.com/24x18/${u.countryCode.toLowerCase()}.png`}
                              alt={u.country}
                              className="w-5 h-3.5 object-cover rounded-sm"
                            />
                            <span className="text-gray-600 text-xs">
                              {u.country}
                            </span>
                          </div>
                        ) : "—"}
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => setBalanceModal(u)}
                          className="flex items-center gap-1 text-green-600 font-semibold hover:text-green-700"
                        >
                          ${fmt(u.balance)}
                          <FiEdit2 size={11} />
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {u.isBlocked ? (
                          <Badge label="Blocked" color="red" />
                        ) : u.isFrozen ? (
                          <Badge label="Frozen" color="yellow" />
                        ) : (
                          <Badge label="Active" color="green" />
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {u.isBlocked ? (
                            <button
                              onClick={() => handleUnblock(u)}
                              title="Unblock"
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                            >
                              <FiCheckCircle size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(u)}
                              title="Block"
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                            >
                              <FiSlash size={14} />
                            </button>
                          )}

                          {u.isFrozen ? (
                            <button
                              onClick={() => handleUnfreeze(u)}
                              title="Unfreeze"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100"
                            >
                              <FiUnlock size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFreeze(u)}
                              title="Freeze"
                              className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                            >
                              <FiLock size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(u)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 py-4 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2 text-gray-400 text-sm">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1.5 rounded-lg border text-sm ${
                          currentPage === p
                            ? "bg-blue-600 text-white border-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Balance Modal */}
      {balanceModal && (
        <BalanceModal
          user={balanceModal}
          onClose={() => setBalanceModal(null)}
          onSave={handleBalanceSave}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </ChildPanelLayout>
  );
    }
