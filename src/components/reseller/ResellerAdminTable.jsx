//src/components/reseller/ResellerAdminTable.jsx
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const ResellerTable = ({ resellers, refresh }) => {
  const navigate = useNavigate();

  const toggleStatus = async (id) => {
    try {
      await API.put(`/admin/resellers/${id}/toggle-status`);
      refresh();
    } catch {
      alert("Failed to update status");
    }
  };

  if (!resellers.length) {
    return <p>No resellers found</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Wallet</th>
            <th className="p-2 text-left">Users</th>
            <th className="p-2 text-left">Orders</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {resellers.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.phone || "-"}</td>
              <td className="p-2">${r.resellerWallet || 0}</td>
              <td className="p-2">{r.usersCount}</td>
              <td className="p-2">{r.ordersCount}</td>
              <td className="p-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2">
                {r.isSuspended ? "Suspended" : "Active"}
              </td>

              <td className="p-2 flex gap-2">
                <button
                  onClick={() => navigate(`/admin/resellers/${r._id}`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  View
                </button>

                <button
                  onClick={() => toggleStatus(r._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResellerTable;
