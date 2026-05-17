// src/components/childpanel/financial/CPFinancialWithdrawals.jsx
// CP owner views their OWN withdrawal history (submitted to admin).
// No approve/reject actions here — that's admin-only.
import { Section, STATUS_COLORS, fmt } from "./CPFinancialShared";

export default function CPFinancialWithdrawals({
  withdrawals, loading, wPage, setWPage, wTotal,
  wStatusFilter, setWStatusFilter,
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

      <Section title={`My Withdrawal History (${wTotal} total)`}>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-2">Note / Method</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-gray-400">No withdrawals found</td></tr>
                  )}
                  {withdrawals.map((w) => (
                    <tr key={String(w.txId)} className="border-b border-gray-50 hover:bg-gray-50 align-top">
                      <td className="py-3 text-gray-500 text-xs max-w-[200px] truncate">{w.note || "—"}</td>
                      <td className="py-3 text-right font-bold text-blue-600">${fmt(w.amount)}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[w.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-400">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
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
