export default function PendingDepositsTab({ deposits, onApprove, onReject }) {
  return (
    <div className="space-y-3">
      {deposits.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No pending deposits</p>
          <p className="text-xs mt-1 text-gray-400">
            Manual and Binance deposits from your users show up here for verification.
          </p>
        </div>
      )}

      {deposits.map((d) => (
        <div key={d._id} className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900">{d.user?.email || "—"}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                  {d.gateway?.name || "—"}
                </span>
              </div>
              <p className="text-sm font-semibold text-green-600 mt-1">
                ${d.amount}
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {d.details?.binanceOrderId
                  ? <span>Order ID: <b>{d.details.binanceOrderId}</b>{d.details.amountSent && <> · Sent: {d.details.amountSent}</>}</span>
                  : d.details?.transactionCode || d.details?.senderName
                  ? <span>
                      {d.details.transactionCode && <>Code: <b>{d.details.transactionCode}</b></>}
                      {d.details.transactionCode && d.details.senderName && " · "}
                      {d.details.senderName && <>Name: <b>{d.details.senderName}</b></>}
                    </span>
                  : <span className="text-gray-300">—</span>
                }
              </p>
              <p className="text-xs mt-1 text-gray-400">
                {new Date(d.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onApprove(d._id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition">
                Approve
              </button>
              <button onClick={() => onReject(d._id)}
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
