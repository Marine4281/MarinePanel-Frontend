// src/components/childpanel/financial/CPFinancialOverview.jsx
import { StatCard, Section, fmt } from "./CPFinancialShared";

export default function CPFinancialOverview({ summary, loading }) {
  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;
  if (!summary) return <p className="text-red-500 text-sm">Failed to load summary.</p>;

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Balance Used Today"   value={`$${fmt(summary.balanceUsedToday)}`}         accent="blue" />
        <StatCard label="Total Users Wallet"   value={`$${fmt(summary.totalUsersWalletBalance)}`}   accent="green" />
        <StatCard label="Your Panel Balance"   value={`$${fmt(summary.ownerBalance)}`}              accent="purple" />
        <StatCard label="Commission Rate"      value={`${summary.commission}%`}                     accent="cyan" />
      </div>

      {/* Provider balances */}
      <Section title="Provider Wallet Balances">
        {!summary.providerBalances?.length ? (
          <p className="text-gray-400 text-sm">No providers configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.providerBalances.map((p) => (
              <div
                key={p.provider}
                className={`flex items-center justify-between rounded-lg px-4 py-3 border ${
                  p.status === "ok" ? "border-gray-200 bg-gray-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.provider}</p>
                  <p className="text-xs text-gray-400">{p.currency}</p>
                </div>
                <p className={`text-lg font-bold ${p.status === "ok" ? "text-blue-600" : "text-red-500"}`}>
                  {p.status === "ok" ? `$${fmt(p.balance)}` : "Error"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Reseller summary */}
      <Section title="Reseller Summary">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Resellers"        value={summary.reseller?.total ?? 0}               accent="blue" />
          <StatCard label="Total Reseller Wallets" value={`$${fmt(summary.reseller?.totalBalance)}`}  accent="green" />
        </div>
      </Section>
    </div>
  );
}
