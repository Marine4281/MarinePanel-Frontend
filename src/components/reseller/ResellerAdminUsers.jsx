//src/components/reseller/ResellerAdminUsers.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

const ResellerAdminUsers = ({ resellerId }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get(`/admin/resellers/${resellerId}/users`);
      setUsers(res.data.data);
    };
    fetch();
  }, [resellerId]);

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
