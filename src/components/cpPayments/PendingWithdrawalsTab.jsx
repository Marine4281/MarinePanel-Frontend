const payoutDetail = (w) => {
  const det = w.details || {};
  if (det.phone) return <span>Phone: <b>{det.phone}</b>{det.network && <> · {det.network}</>}</span>;
  if (det.walletAddress) return <span>Wallet: <b>{det.walletAddress}</b>{det.network && <> ({det.network})</>}</span>;
  if (det.accountNumber) return <span>{det.bankCode && <>{det.bankCode} · </>}Acct: <b>{det.accountNumber}</b>{det.accountName && <> · {det.accountName}</>}</span>;
  if (det.notes) return <span>{det.notes}</span>;
  return <span className="text-gray-300">—</span>;
};

export default function PendingWithdrawalsTab({ withdrawals, onApprove, onReject }) {
  return (
    <div className="space-y-3">
      {withdrawals.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No pending withdrawals</p>
          <p className="text-xs mt-1 text-gray-400">
            Requests from your users show up here once they request a payout.
          </p>
        </div>
      )}

      {withdrawals.map((w) => (
        <div key={w._id} className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900">{w.user?.email || "—"}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                  {w.gateway?.name || "—"}
                </span>
              </div>
              <p className="text-sm font-semibold text-red-500 mt-1">
                ${Math.abs(w.amount)}
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {payoutDetail(w)}
              </p>
              <p className="text-xs mt-1 text-gray-400">
                {new Date(w.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onApprove(w._id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition">
                Approve
              </button>
              <button onClick={() => onReject(w._id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition">
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
