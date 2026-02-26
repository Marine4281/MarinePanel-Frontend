import { useState } from "react";

const Table = ({ data = [], type }) => {
  const [showAll, setShowAll] = useState(false);

  // Sort newest first
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    return dateB - dateA;
  });

  const displayedData = showAll ? sortedData : sortedData.slice(0, 3);

  const renderRow = (item) => {
    if (type === "users") {
      return (
        <tr key={item._id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">{item.email || "-"}</td>
          <td className="px-4 py-3">{item.phone || "-"}</td>
          <td className="px-4 py-3">{item.country || "-"}</td>
          <td className="px-4 py-3 font-medium">
            ${Number(item.balance || 0).toFixed(2)}
          </td>
          <td className="px-4 py-3">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                item.isAdmin
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.isAdmin ? "Admin" : "User"}
            </span>
          </td>
        </tr>
      );
    }

    if (type === "orders") {
      return (
        <tr key={item._id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3 font-medium">
            #{item._id?.slice(-6)}
          </td>

          <td className="px-4 py-3">
            {item.userId?.email || "-"}
          </td>

          <td className="px-4 py-3">{item.service || "-"}</td>

          <td className="px-4 py-3">
            {item.quantity || 0}
          </td>

          <td className="px-4 py-3">
            <span
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                item.status === "completed"
                  ? "bg-green-100 text-green-600"
                  : item.status === "processing"
                  ? "bg-yellow-100 text-yellow-600"
                  : item.status === "pending"
                  ? "bg-blue-100 text-blue-600"
                  : item.status === "refunded"
                  ? "bg-gray-200 text-gray-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {item.status}
            </span>
          </td>
        </tr>
      );
    }

    return null;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="w-full table-auto">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
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
                <th className="px-4 py-3 text-left">User Email</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Status</th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700">
          {displayedData.length > 0 ? (
            displayedData.map(renderRow)
          ) : (
            <tr>
              <td
                colSpan={type === "users" ? 5 : 5}
                className="text-center py-6 text-gray-400"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {data.length > 3 && (
        <div className="text-center py-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
