//src/components/reseller/ResellerAdminTable.jsx
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

const ResellerAdminTable = ({ resellers, refresh }) => {
  const navigate = useNavigate();

  const toggleStatus = async (id) => {
    try {
      await API.put(`/admin/resellers/${id}/toggle-status`);
      toast.success("Updated");
      refresh();
    } catch {
      toast.error("Failed");
    }
  };

  if (!resellers.length) return <p>No resellers</p>;

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>Email</th>
            <th>Phone</th>
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
              <td>{r.email}</td>
              <td>{r.phone || "-"}</td>
              <td>{r.usersCount}</td>
              <td>{r.ordersCount}</td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                <span className={r.isSuspended ? "text-red-500" : "text-green-600"}>
                  {r.isSuspended ? "Suspended" : "Active"}
                </span>
              </td>

              <td className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/resellers/${r._id}`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  View
                </button>

                <button
                  onClick={() => toggleStatus(r._id)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
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
