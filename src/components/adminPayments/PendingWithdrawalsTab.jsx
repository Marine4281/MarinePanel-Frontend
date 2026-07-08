const payoutDetail = (d) => {
  const det = d.details || {};
  if (det.phone) return <span>Phone: <b>{det.phone}</b>{det.network && <> · {det.network}</>}</span>;
  if (det.walletAddress) return <span>Wallet: <b>{det.walletAddress}</b>{det.network && <> ({det.network})</>}</span>;
  if (det.accountNumber) return <span>{det.bankCode && <>{det.bankCode} · </>}Acct: <b>{det.accountNumber}</b>{det.accountName && <> · {det.accountName}</>}</span>;
  if (det.notes) return <span>{det.notes}</span>;
  return <span className="text-gray-300">—</span>;
};

export default function PendingWithdrawalsTab({ withdrawals, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["User", "Gateway", "Amount", "Payout To", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {withdrawals.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No pending withdrawals</td></tr>
            )}
            {withdrawals.map((w) => (
              <tr key={w._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{w.user?.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                    {w.gateway?.name || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-red-500">${Math.abs(w.amount)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{payoutDetail(w)}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(w.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => onApprove(w._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600">
                      Approve
                    </button>
                    <button onClick={() => onReject(w._id)}
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
