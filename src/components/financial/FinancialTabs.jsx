// src/components/financial/FinancialTabs.jsx
import { fmt, STATUS_COLORS, RANGES, StatCard, Section, MiniChart, CountryDropdown } from "./FinancialShared";

// ══════════════ OVERVIEW ══════════════
export function OverviewTab({ summary, loading }) {
  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (!summary) return <p className="text-red-500 text-sm">Failed to load summary.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Balance Used Today"  value={`$${fmt(summary.balanceUsedToday)}`}             accent="orange" />
        <StatCard label="Total Users Wallet"  value={`$${fmt(summary.totalUsersWalletBalance)}`}       accent="blue" />
        <StatCard label="Commission Rate"     value={`${summary.commission}%`}                          accent="purple" />
        <StatCard label="Total Resellers"     value={summary.reseller?.total ?? 0}                      accent="cyan" />
      </div>

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
                  <p className="text-sm font-semibold text-gray-900">{p.provider}</p>
                  <p className="text-xs text-gray-500">{p.currency}</p>
                </div>
                <p className={`text-lg font-bold ${p.status === "ok" ? "text-orange-600" : "text-red-600"}`}>
                  {p.status === "ok" ? `$${fmt(p.balance)}` : "Error"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Child Panel Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Child Panels"     value={summary.childPanel?.totalPanels ?? 0}                accent="blue" />
          <StatCard label="Total Activations"      value={summary.childPanel?.totalActivations ?? 0}           accent="green" />
          <StatCard label="Activation Fees Earned" value={`$${fmt(summary.childPanel?.totalActivationFees)}`}  accent="orange" />
          <StatCard label="Child Panel Balances"   value={`$${fmt(summary.childPanel?.totalBalance)}`}         accent="purple" />
        </div>
      </Section>

      <Section title="Reseller Summary">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Resellers"        value={summary.reseller?.total ?? 0}               accent="cyan" />
          <StatCard label="Total Reseller Wallets" value={`$${fmt(summary.reseller?.totalBalance)}`}  accent="green" />
        </div>
      </Section>
    </div>
  );
}

// ══════════════ PROFIT ══════════════
export function ProfitTab({
  profitData, loading, range, setRange,
  country, setCountry,
  customStart, setCustomStart,
  customEnd, setCustomEnd,
  onApply,
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Date Range</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2"
          >
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {range === "custom" && (
          <>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Start</label>
              <input
                type="date" value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">End</label>
              <input
                type="date" value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Country</label>
          <CountryDropdown value={country} onChange={setCountry} />
        </div>

        <button
          onClick={onApply}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Apply
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : profitData ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Profit (Completed)" value={`$${fmt(profitData.profit)}`}       accent="green"  sub={`${profitData.commission}% commission`} />
            <StatCard label="Gross Revenue"       value={`$${fmt(profitData.grossRevenue)}`} accent="orange" />
            <StatCard label="Orders (Completed)"  value={profitData.totalOrders}              accent="blue" />
            <StatCard label="Commission"          value={`${profitData.commission}%`}         accent="purple" />
          </div>

          <Section title="Daily Profit Breakdown">
            <MiniChart data={profitData.chart} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-200">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Orders</th>
                    <th className="pb-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.chart.map((d) => (
                    <tr key={d.date} className="border-b border-gray-100 hover:bg-orange-50">
                      <td className="py-2 text-gray-700">{d.date}</td>
                      <td className="py-2 text-right text-gray-500">{d.orders}</td>
                      <td className="py-2 text-right text-green-600 font-medium">${fmt(d.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
}

// ══════════════ USER BALANCES ══════════════
export function UserBalancesTab({ users, loading, userPage, setUserPage, userTotal }) {
  return (
    <Section title={`User Balances — sorted by highest balance (${userTotal} total)`}>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-2">#</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Country</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} className="border-b border-gray-100 hover:bg-orange-50">
                    <td className="py-2 text-gray-400">{(userPage - 1) * 20 + i + 1}</td>
                    <td className="py-2">
                      <p className="text-gray-900 font-medium">{u.email}</p>
                      <p className="text-xs text-gray-400">{u.phone}</p>
                    </td>
                    <td className="py-2 text-gray-500">{u.country}</td>
                    <td className="py-2">
                      {u.isChildPanel && (
                        <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">Child Panel</span>
                      )}
                      {u.isReseller && (
                        <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Reseller</span>
                      )}
                      {!u.isChildPanel && !u.isReseller && (
                        <span className="text-xs text-gray-400">User</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-bold ${u.balance > 0 ? "text-green-600" : "text-gray-400"}`}>
                        ${fmt(u.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>{userTotal} users</span>
            <div className="flex gap-2">
              <button disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-gray-700">Prev</button>
              <span className="px-3 py-1">Page {userPage}</span>
              <button disabled={userPage * 20 >= userTotal} onClick={() => setUserPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-gray-700">Next</button>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}

// ══════════════ WITHDRAWALS ══════════════
export function WithdrawalsTab({
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
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-300 text-gray-500 hover:text-gray-900 hover:border-orange-300"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <Section title={`Withdrawal Requests (${wTotal} total)`}>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-200">
                    <th className="pb-2">Panel / User</th>
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
                      <tr key={`${w.walletId}-${w.txId}`} className="border-b border-gray-100 hover:bg-orange-50 align-top">
                        <td className="py-3 pr-3">
                          <p className="text-gray-900 font-medium">{w.brandName}</p>
                          <p className="text-xs text-gray-400">{w.email}</p>
                        </td>
                        <td className="py-3 text-gray-500 text-xs max-w-[140px] truncate">{w.note || "—"}</td>
                        <td className="py-3 text-right font-bold text-orange-600">${fmt(w.amount)}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[w.status] ?? "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {w.status === "Pending" ? (
                            <div className="flex gap-1">
                              <button disabled={busy} onClick={() => onApprove(w.userId, w.txId)}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded disabled:opacity-40">
                                Approve
                              </button>
                              <button disabled={busy} onClick={() => onDecline(w.userId, w.txId)}
                                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded disabled:opacity-40">
                                Decline
                              </button>
                            </div>
                          ) : <span className="text-gray-300 text-xs">—</span>}
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
                                    : "border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-600"
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
                  className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-gray-700">Prev</button>
                <span className="px-3 py-1">Page {wPage}</span>
                <button disabled={wPage * 20 >= wTotal} onClick={() => setWPage((p) => p + 1)}
                  className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-gray-700">Next</button>
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

// ══════════════ RESELLER EARNINGS ══════════════
export function ResellerEarningsTab({ resellerEarnings, loading, rePage, setRePage, reTotal }) {
  return (
    <Section title={`Reseller Total Earnings — ${reTotal} resellers`}>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200">
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
                  <tr key={r._id} className="border-b border-gray-100 hover:bg-orange-50">
                    <td className="py-2 text-gray-400">{(rePage - 1) * 20 + i + 1}</td>
                    <td className="py-2">
                      <p className="text-gray-900 font-medium">{r.email}</p>
                      <p className="text-xs text-gray-400">{r.phone}</p>
                    </td>
                    <td className="py-2 text-gray-500">{r.country ?? "—"}</td>
                    <td className="py-2 text-right text-gray-700">{r.totalOrders}</td>
                    <td className="py-2 text-right text-gray-700">${fmt(r.totalCharge)}</td>
                    <td className="py-2 text-right font-bold text-green-600">${fmt(r.totalEarnings)}</td>
                    <td className="py-2 text-right font-bold text-orange-600">${fmt(r.walletBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>{reTotal} resellers</span>
            <div className="flex gap-2">
              <button disabled={rePage === 1} onClick={() => setRePage((p) => p - 1)}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-gray-700">Prev</button>
              <span className="px-3 py-1">Page {rePage}</span>
              <button disabled={rePage * 20 >= reTotal} onClick={() => setRePage((p) => p + 1)}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 hover:bg-gray-200 text-gray-700">Next</button>
            </div>
          </div>
        </>
      )}
    </Section>
  );
          }
