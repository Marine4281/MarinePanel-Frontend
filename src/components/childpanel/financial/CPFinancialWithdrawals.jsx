// src/components/childpanel/financial/CPFinancialWithdrawals.jsx
import { Section, STATUS_COLORS, fmt } from "./CPFinancialShared";

export default function CPFinancialWithdrawals({
  withdrawals, loading, wPage, setWPage, wTotal,
  wStatusFilter, setWStatusFilter,
  actionLoading, onApprove, onDecline, onSetStatus,
}) {
  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {["", "Pending", "Completed", "Failed", "Processing"].map((s) => (
          <button
            key={s}
            onClick={() => { setWStatusFilter(s); setWPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              wStatusFilter === s
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <Section title={`Reseller Withdrawal Requests (${wTotal} total)`}>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-2">Reseller</th>
                    <th className="pb-2">Note</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Actions</th>
                    <th className="pb-2">Manual</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 && (
                    <tr><td colSpan={7} className="py-6 text-center text-gray-400">No withdrawals found</td></tr>
                  )}
                  {withdrawals.map((w) => {
                    const busy = actionLoading === w.txId || actionLoading?.startsWith?.(w.txId);
                    return (
                      <tr key={`${w.userId}-${w.txId}`} className="border-b border-gray-50 hover:bg-gray-50 align-top">
                        <td className="py-3 pr-3">
                          <p className="text-gray-800 font-medium">{w.email}</p>
                        </td>
                        <td className="py-3 text-gray-400 text-xs max-w-[140px] truncate">{w.note || "—"}</td>
                        <td className="py-3 text-right font-bold text-blue-600">${fmt(w.amount)}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[w.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {w.status === "Pending" ? (
                            <div className="flex gap-1">
                              <button
                                disabled={busy}
                                onClick={() => onApprove(w.userId, w.txId)}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded disabled:opacity-40"
                              >
                                Approve
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => onDecline(w.userId, w.txId)}
                                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded disabled:opacity-40"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1 flex-wrap">
                            {["Completed", "Failed", "Processing"].map((s) => (
                              <button
                                key={s}
                                disabled={busy || w.status === s}
                                onClick={() => onSetStatus(w.userId, w.txId, s)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition disabled:opacity-30 ${
                                  w.status === s
                                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                    : "border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>{wTotal} total</span>
              <div className="flex gap-2">
                <button disabled={wPage === 1} onClick={() => setWPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <span className="px-3 py-1">Page {wPage}</span>
                <button disabled={wPage * 20 >= wTotal} onClick={() => setWPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
                        }
