//src/components/reseller/ResellerAdminTable.jsx
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const formatMoney = (v) => Number(v || 0).toFixed(4);

const ResellerAdminTable = ({ resellers, refresh }) => {
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
    return <p className="text-gray-500">No resellers found</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>Email</th>
            <th>Phone</th>
            <th>Wallet</th>
            <th>Users</th>
            <th>Orders</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {resellers.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.phone || "-"}</td>

              <td className="p-2 font-medium">
                ${formatMoney(r.resellerWallet ?? r.wallet?.balance)}
              </td>

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

export default ResellerAdminTable;
