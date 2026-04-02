// src/components/AdminUserDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [newBalance, setNewBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Fetch user + transactions
  const fetchUser = async () => {
    try {
      const res = await API.get(`/users/${id}`);
      setUser(res.data.user);
      setTransactions(
        (res.data.transactions || []).sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        )
      );
      setNewBalance(res.data.user.balance);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch user");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  // Update balance
  const handleUpdateBalance = async () => {
    if (!user) return;
    setUpdatingBalance(true);
    try {
      const res = await API.put(`/admin/users/${id}/balance`, { balance: Number(newBalance) });
      setUser((prev) => ({ ...prev, balance: res.data.wallet.balance }));
      toast.success("Balance updated");
    } catch {
      toast.error("Failed to update balance");
    }
    setUpdatingBalance(false);
  };

  // Promote / Demote admin
  const handleToggleAdmin = async () => {
    if (!user) return;
    setPromoting(true);
    try {
      if (user.isAdmin) {
        await API.patch(`/api/users/${id}/demote`);
        setUser((prev) => ({ ...prev, isAdmin: false }));
        toast.success("User demoted to normal user");
      } else {
        await API.patch(`/api/users/${id}/promote`);
        setUser((prev) => ({ ...prev, isAdmin: true }));
        toast.success("User promoted to admin");
      }
    } catch {
      toast.error("Failed to update admin status");
    }
    setPromoting(false);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>

        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {user.name || "-"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "-"}</p>
              <p className="flex items-center gap-2">
                <strong>Country:</strong>{" "}
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
              <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <p><strong>Balance:</strong> ${Number(user.balance || 0).toFixed(4)}</p>
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
                  user.isAdmin ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
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

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Transaction History</h3>
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
                    <td className="px-3 py-2">{new Date(t.createdAt || t.date).toLocaleString()}</td>
                    <td className="px-3 py-2">{t.type}</td>
                    <td
                      className={`px-3 py-2 font-semibold ${
                        t.amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${t.amount.toFixed(4)}
                    </td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">{t.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
