// src/components/childpanel/financial/CPFinancialResellerEarnings.jsx
import { Section, fmt } from "./CPFinancialShared";

export default function CPFinancialResellerEarnings({ resellerEarnings, loading, rePage, setRePage, reTotal }) {
  return (
    <Section title={`Reseller Total Earnings — ${reTotal} resellers`}>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Reseller</th>
                  <th className="pb-2">Country</th>
                  <th className="pb-2 text-right">Orders</th>
                  <th className="pb-2 text-right">Gross Revenue</th>
                  <th className="pb-2 text-right">Earnings (Commission)</th>
                  <th className="pb-2 text-right">Wallet Balance</th>
                </tr>
              </thead>
              <tbody>
                {resellerEarnings.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-gray-400">No resellers found</td></tr>
                )}
                {resellerEarnings.map((r, i) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{(rePage - 1) * 20 + i + 1}</td>
                    <td className="py-2">
                      <p className="text-gray-800 font-medium">{r.email}</p>
                      <p className="text-xs text-gray-400">{r.phone}</p>
                    </td>
                    <td className="py-2 text-gray-500">{r.country ?? "—"}</td>
                    <td className="py-2 text-right text-gray-600">{r.totalOrders}</td>
                    <td className="py-2 text-right text-gray-600">${fmt(r.totalCharge)}</td>
                    <td className="py-2 text-right font-bold text-green-600">${fmt(r.totalEarnings)}</td>
                    <td className="py-2 text-right font-bold text-blue-600">${fmt(r.walletBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>{reTotal} resellers</span>
            <div className="flex gap-2">
              <button disabled={rePage === 1} onClick={() => setRePage((p) => p - 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <span className="px-3 py-1">Page {rePage}</span>
              <button disabled={rePage * 20 >= reTotal} onClick={() => setRePage((p) => p + 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}
