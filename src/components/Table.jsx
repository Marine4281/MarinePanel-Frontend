import { useState } from "react";

const Table = ({ data, type }) => {
  const [showAll, setShowAll] = useState(false);

  // Sort newest first
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    return dateB - dateA;
  });

  // Decide which items to display
  const displayedData = showAll ? sortedData : sortedData.slice(0, 3);

  const renderRow = (item) => {
    if (type === "users") {
      return (
        <tr key={item._id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">{item.email}</td>
          <td className="px-4 py-3">{item.phone || "-"}</td>
          <td className="px-4 py-3">{item.country || "-"}</td>
          <td className="px-4 py-3">${Number(item.balance || 0).toFixed(2)}</td>
          <td className="px-4 py-3">{item.isAdmin ? "Admin" : "User"}</td>
        </tr>
      );
    } else if (type === "orders") {
      return (
        <tr key={item._id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">#{item._id.slice(-6)}</td>
          <td className="px-4 py-3">{item.userEmail || item.user || "-"}</td>
          <td className="px-4 py-3">{item.service}</td>
          <td className="px-4 py-3">{item.quantity}</td>
          <td className="px-4 py-3">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                item.status === "completed"
                  ? "bg-green-100 text-green-600"
                  : item.status === "processing"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {item.status}
            </span>
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
          <tr>
            {type === "users" ? (
              <>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">Balance</th>
                <th className="px-4 py-3 text-left">Role</th>
              </>
            ) : (
              <>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>{displayedData.map(renderRow)}</tbody>
      </table>

      {/* Show All / Show Less Button */}
      {data.length > 3 && (
        <div className="text-center my-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;