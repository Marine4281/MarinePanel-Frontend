export default function GatewaysTab({ gateways, onEdit, onToggleHidden, onRotateToken, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Name","Mode","Provider","Currency","Deposit Fee","Withdraw Fee","Min","Visible","CP","Hidden","Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gateways.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">No gateways yet</td></tr>
            )}
            {gateways.map((gw) => (
              <tr key={gw._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{gw.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                    {gw.paymentMode}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {gw.providerProfile?.name || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{gw.processingCurrency}</td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {gw.depositFeeType === "none" ? "—" : gw.depositFeeType}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {gw.withdrawalFeeType === "none" ? "—" : gw.withdrawalFeeType}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">${gw.minDeposit}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.isVisible ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {gw.isVisible ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.visibleToCp ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {gw.visibleToCp ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gw.adminHidden ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"}`}>
                    {gw.adminHidden ? "Hidden" : "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <button onClick={() => onEdit(gw)}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Edit</button>
                    <button onClick={() => onToggleHidden(gw._id)}
                      className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-semibold hover:bg-yellow-100">
                      {gw.adminHidden ? "Show" : "Hide"}
                    </button>
                    <button onClick={() => onRotateToken(gw._id, gw.providerProfile?.providerType || "")}
                      className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100">🔄</button>
                    <button onClick={() => onDelete(gw._id)}
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
