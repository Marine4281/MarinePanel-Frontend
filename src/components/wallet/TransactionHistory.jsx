// src/components/wallet/TransactionHistory.jsx
import { useState } from "react";

const statusColor = (s) =>
  s === "Completed" ? "#4ade80" : s === "Pending" ? "#fbbf24" : "#f87171";

const statusBg = (s) =>
  s === "Completed" ? "rgba(74,222,128,0.1)" : s === "Pending" ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)";

export default function TransactionHistory({ transactions }) {
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? transactions : transactions.slice(0, 5);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white">Transaction History</h3>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          {transactions.length} total
        </span>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {displayed.length === 0 && (
          <p className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            No transactions yet
          </p>
        )}
        {displayed.map((tx) => (
          <div key={tx._id} className="px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{tx.type}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {new Date(tx.createdAt).toLocaleDateString()} · {tx.method || ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold" style={{ color: tx.amount > 0 ? "#4ade80" : "#f87171" }}>
                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                style={{ background: statusBg(tx.status), color: statusColor(tx.status) }}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Date", "Type", "Method", "Amount", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm"
                style={{ color: "rgba(255,255,255,0.3)" }}>No transactions yet</td></tr>
            )}
            {displayed.map((tx) => (
              <tr key={tx._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-5 py-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-white font-medium">{tx.type}</td>
                <td className="px-5 py-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {tx.method || "—"}
                </td>
                <td className="px-5 py-3 font-bold"
                  style={{ color: tx.amount > 0 ? "#4ade80" : "#f87171" }}>
                  {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: statusBg(tx.status), color: statusColor(tx.status) }}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > 5 && (
        <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setShowAll((s) => !s)}
            className="w-full py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
            {showAll ? "Show Less" : `View All ${transactions.length} Transactions`}
          </button>
        </div>
      )}
    </div>
  );
}
