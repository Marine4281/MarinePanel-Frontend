export default function ProvidersTab({ providers, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Name","Type","Status","CP Visible","Credentials","Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {providers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No providers yet</td></tr>
            )}
            {providers.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold capitalize">
                    {p.providerType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.visibleToCp ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {p.visibleToCp ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.hasCredentials ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {p.hasCredentials ? "✓ Configured" : "⚠ Missing"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => onEdit(p)}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Edit</button>
                    <button onClick={() => onDelete(p._id)}
                      className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
