// src/components/admin/childpanel/CPDetailUsersTab.jsx

import { fmt } from "./CPDetailHelpers";

export default function CPDetailUsersTab({ users, pagination, page, onPageChange }) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">No users yet</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-xs">
          <thead className="bg-gray-50 text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Balance</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Last Seen</th>
              <th className="px-4 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 truncate max-w-[160px]">{u.email}</td>
                <td className="px-4 py-2 text-gray-600">{u.phone || "—"}</td>
                <td className="px-4 py-2 font-semibold text-gray-800">
                  ${fmt(u.balance)}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.isBlocked
                      ? "bg-red-100 text-red-600"
                      : u.isFrozen
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {u.isBlocked ? "Blocked" : u.isFrozen ? "Frozen" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-400">
                  {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.userPages > 1 && (
        <Pagination
          page={page}
          pages={pagination.userPages}
          onPrev={() => onPageChange(page - 1)}
          onNext={() => onPageChange(page + 1)}
        />
      )}
    </>
  );
}

function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between mt-4 text-xs">
      <span className="text-gray-400">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={onPrev}
          className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
        <button disabled={page === pages} onClick={onNext}
          className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
