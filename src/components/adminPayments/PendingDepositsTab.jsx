export default function PendingDepositsTab({ deposits, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["User","Gateway","Amount","Details","Date","Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deposits.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No pending deposits</td></tr>
            )}
            {deposits.map((d) => (
              <tr key={d._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{d.user?.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                    {d.gateway?.name || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-green-600">${d.amount}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {d.details?.binanceOrderId
                    ? <span>Order ID: <b>{d.details.binanceOrderId}</b>{d.details.senderName && <> · Name: <b>{d.details.senderName}</b></>}</span>
                    : d.details?.transactionCode || d.details?.senderName
                    ? <span>
                        {d.details.transactionCode && <>Code: <b>{d.details.transactionCode}</b></>}
                        {d.details.transactionCode && d.details.senderName && " · "}
                        {d.details.senderName && <>Name: <b>{d.details.senderName}</b></>}
                      </span>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(d.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => onApprove(d._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600">
                      Approve
                    </button>
                    <button onClick={() => onReject(d._id)}
                      className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100">
                      Reject
                    </button>
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
