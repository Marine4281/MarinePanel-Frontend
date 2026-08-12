//src/components/reseller/ResellerAdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import API from "../../api/axios";

const ResellerAdminUsers = ({ resellerId }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    const res = await API.get(`/admin/resellers/${resellerId}/users`);
    setUsers(res.data.data);
  }, [resellerId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ------------------------------
  // Real-time wallet updates
  // ------------------------------
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("wallet:update", ({ userId, balance }) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, balance } : u
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Users</h2>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Email</th>
            <th>Phone</th>
            <th>Wallet</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t">
              <td>{u.email}</td>
              <td>{u.phone || "-"}</td>
              <td>${Number(u.balance || 0).toFixed(4)}</td>
              <td>{u.isSuspended ? "Suspended" : "Active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResellerAdminUsers;
