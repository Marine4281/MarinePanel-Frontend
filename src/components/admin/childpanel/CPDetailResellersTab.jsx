// src/components/admin/childpanel/CPDetailResellersTab.jsx

export default function CPDetailResellersTab({ resellers, stats, pagination, page, onPageChange }) {
  if (resellers.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">No resellers yet</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Brand</th>
              <th className="px-4 py-2 text-left">Domain</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {resellers.map((r) => (
              <tr key={r._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 truncate max-w-[160px]">{r.email}</td>
                <td className="px-4 py-2 text-gray-600">{r.brandName || "—"}</td>
                <td className="px-4 py-2 text-gray-400">{r.resellerDomain || "—"}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.isSuspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                  }`}>
                    {r.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.resellerPages > 1 && (
        <Pagination
          page={page}
          pages={pagination.resellerPages}
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
