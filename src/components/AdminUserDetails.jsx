import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [newBalance, setNewBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // ✅ Keep user in ref for socket stability
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ✅ Fetch user + transactions
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users/${id}`);

      const fetchedUser = res.data.user;
      const fetchedTransactions = (res.data.transactions || []).sort(
        (a, b) =>
          new Date(b.createdAt || b.date) -
          new Date(a.createdAt || a.date)
      );

      setUser(fetchedUser);
      setTransactions(fetchedTransactions);
      setNewBalance(fetchedUser.balance || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ Socket (RUN ONCE)
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("wallet:update", ({ balance, transactions, userId }) => {
      // Only update if this is the current user
      if (userRef.current && userRef.current._id === userId) {
        setUser((prev) => ({
          ...prev,
          balance,
        }));

        const sortedTxs = (transactions || []).sort(
          (a, b) =>
            new Date(b.createdAt || b.date) -
            new Date(a.createdAt || a.date)
        );

        setTransactions(sortedTxs);
        setNewBalance(balance);
      }
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Update balance
  const handleUpdateBalance = async () => {
    if (!user) return;

    setUpdatingBalance(true);
    try {
      const res = await API.put(`/admin/users/${id}/balance`, {
        balance: Number(newBalance),
      });

      const updatedBalance = res.data.wallet.balance;

      setUser((prev) => ({ ...prev, balance: updatedBalance }));
      setNewBalance(updatedBalance);

      toast.success("Balance updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update balance");
    } finally {
      setUpdatingBalance(false);
    }
  };

  // ✅ Promote / Demote admin (FIXED ROUTES)
  const handleToggleAdmin = async () => {
    if (!user) return;

    setPromoting(true);
    try {
      if (user.isAdmin) {
        await API.patch(`/admin/users/${id}/demote`);
        setUser((prev) => ({ ...prev, isAdmin: false }));
        toast.success("User demoted to normal user");
      } else {
        await API.patch(`/admin/users/${id}/promote`);
        setUser((prev) => ({ ...prev, isAdmin: true }));
        toast.success("User promoted to admin");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update admin status");
    } finally {
      setPromoting(false);
    }
  };

  // ✅ UI STATES
  if (loading) {
    return <div className="p-6 text-center">Loading user...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">User not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>

        {/* USER DETAILS */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {user.name || "-"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "-"}</p>

              <p className="flex items-center gap-2">
                <strong>Country:</strong>
                {user.country ? (
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${user.country
                        .toLowerCase()
                        .slice(0, 2)}.png`}
                      alt={user.country}
                      className="w-6 h-4 object-cover"
                    />
                    <span>{user.country}</span>
                  </>
                ) : (
                  "-"
                )}
              </p>

              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p>
                <strong>Balance:</strong> $
                {Number(user.balance || 0).toFixed(4)}
              </p>

              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="p-2 border rounded w-full"
                />
                <button
                  onClick={handleUpdateBalance}
                  disabled={updatingBalance}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  {updatingBalance ? "Updating..." : "Save"}
                </button>
              </div>

              <button
                onClick={handleToggleAdmin}
                disabled={promoting}
                className={`mt-4 px-4 py-2 rounded text-white ${
                  user.isAdmin
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {promoting
                  ? "Processing..."
                  : user.isAdmin
                  ? "Demote to User"
                  : "Promote to Admin"}
              </button>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">
            Transaction History
          </h3>

          {transactions.length ? (
            <table className="w-full text-sm text-left rounded-lg overflow-hidden shadow">
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
                {transactions.map((t, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {new Date(
                        t.createdAt || t.date
                      ).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{t.type}</td>
                    <td
                      className={`px-3 py-2 font-semibold ${
                        t.amount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${t.amount.toFixed(4)}
                    </td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">
                      {t.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">
              No transactions found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
