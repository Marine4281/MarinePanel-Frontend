// src/components/admin/NotificationManager/NotificationHistoryTable.jsx
const NotificationHistoryTable = ({ notifications, onEdit, onDelete }) => {
  if (!notifications.length) {
    return <p className="text-sm text-gray-500">No notifications created yet.</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Title</th>
            <th className="text-left px-4 py-2">Audience</th>
            <th className="text-left px-4 py-2">Limit</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Created</th>
            <th className="text-right px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n._id} className="border-t">
              <td className="px-4 py-2 font-medium">{n.title}</td>
              <td className="px-4 py-2 capitalize">{n.audience}</td>
              <td className="px-4 py-2">
                {n.limitType === "days" ? `${n.limitValue} day(s)` : `${n.limitValue} cancel(s)`}
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${n.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {n.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(n.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-right space-x-2">
                <button onClick={() => onEdit(n)} className="text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(n._id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationHistoryTable;
