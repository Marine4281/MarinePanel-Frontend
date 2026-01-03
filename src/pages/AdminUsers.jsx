import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { io } from "socket.io-client"; // 🔔 Add socket.io client

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [newBalance, setNewBalance] = useState("");
  const [showAllTransactions, setShowAllTransactions] = useState(false); // ✅ new state

  const usersPerPage = 10;

  // Initialize Socket.IO
  useEffect(() => {
    const socket = io("https://marinepanel-backend.onrender.com");

    // Listen for wallet updates
    socket.on("wallet:update", ({ balance, transactions, userId }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, balance }
            : u
        )
      );

      // Update modal if it's currently open for this user
      if (selectedUser && selectedUser._id === userId) {
        // Sort newest first
        const sortedTxs = (transactions || []).sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        setTransactions(sortedTxs);
        setNewBalance(balance);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by search
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search)) ||
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  // Edit balance
  const handleEditBalance = async () => {
    if (!selectedUser) return;
    try {
      const res = await API.put(
        `/admin/users/${selectedUser._id}/balance`,
        { balance: Number(newBalance) }
      );

      toast.success("Balance updated");

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, balance: res.data.wallet.balance }
            : u
        )
      );

      setSelectedUser(null);
      setNewBalance("");
    } catch {
      toast.error("Failed to update balance");
    }
  };

  // View transaction history
  const handleViewTransactions = async (user) => {
    try {
      const res = await API.get(`/admin/users/${user._id}/transactions`);
      // Sort newest first
      const sortedTransactions = (res.data || []).sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setTransactions(sortedTransactions);
      setSelectedUser(user);
      setShowAllTransactions(false); // reset to show only 3
    } catch {
      toast.error("Failed to fetch transactions");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Users Management</h2>

        <input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded-xl shadow w-full md:w-1/3 mb-4"
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user._id.slice(-6)}</td>
                  <td className="px-4 py-3">{user.name || "-"}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || "-"}</td>
                  <td className="px-4 py-3">${Number(user.balance || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleViewTransactions(user)}
                      className="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      View Transactions
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setNewBalance(user.balance);
                        setTransactions([]);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Edit Balance
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-gray-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1 ? "bg-orange-500 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Edit Balance / Transactions Modal */}
        {selectedUser && (
          <div className="fixed inset-0 flex items-start justify-center pt-10 bg-black bg-opacity-50 z-50 overflow-auto">
            <div className="bg-white p-6 rounded-xl w-11/12 md:w-3/4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  {transactions.length ? "Transaction History" : "Edit Balance"} - {selectedUser.name}
                </h3>
                {transactions.length && (
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setTransactions([]);
                    }}
                    className="px-3 py-1 rounded bg-gray-300 text-sm"
                  >
                    Back
                  </button>
                )}
              </div>

              {transactions.length ? (
                <>
                  <table className="w-full text-sm text-left mb-4 rounded-lg overflow-hidden shadow">
                    <thead className="bg-gray-100 text-gray-600 uppercase">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllTransactions ? transactions : transactions.slice(0, 3)).map((t, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{new Date(t.createdAt || t.date).toLocaleString()}</td>
                          <td className="px-3 py-2">{t.type}</td>
                          <td
                            className={`px-3 py-2 font-semibold ${
                              t.amount >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ${t.amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">{t.status}</td>
                          <td className="px-3 py-2">{t.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {transactions.length > 3 && (
                    <div className="text-center mb-4">
                      <button
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                      >
                        {showAllTransactions ? "Show Less" : "View All"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="px-3 py-1 rounded bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditBalance}
                      className="px-3 py-1 rounded bg-orange-500 text-white"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;