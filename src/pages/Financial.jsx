// src/admin/Financial.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

// ─── tiny helpers ────────────────────────────────────────────────
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const RANGES = [
  { label: "Today",      value: "today" },
  { label: "This Week",  value: "thisWeek" },
  { label: "Last 7 Days",value: "last7" },
  { label: "This Month", value: "thisMonth" },
  { label: "This Year",  value: "thisYear" },
  { label: "All Time",   value: "all" },
  { label: "Custom",     value: "custom" },
];

const STATUS_COLORS = {
  Completed:  "bg-green-900/50 text-green-400 border border-green-700",
  Failed:     "bg-red-900/50 text-red-400 border border-red-700",
  Pending:    "bg-yellow-900/50 text-yellow-400 border border-yellow-700",
  Processing: "bg-blue-900/50 text-blue-400 border border-blue-700",
};

// ─── StatCard ────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = "orange" }) {
  const accents = {
    orange: "border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent",
    blue:   "border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-transparent",
    green:  "border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent",
    purple: "border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent",
    cyan:   "border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent",
  };
  return (
    <div className={`rounded-xl border p-5 ${accents[accent]}`}>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Mini bar chart ──────────────────────────────────────────────
function MiniChart({ data }) {
  if (!data?.length) return <p className="text-gray-500 text-sm">No chart data</p>;
  const max = Math.max(...data.map((d) => d.profit), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-2">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-orange-500/70 hover:bg-orange-500 rounded-t transition-all"
            style={{ height: `${Math.max(4, (d.profit / max) * 80)}px` }}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
            ${fmt(d.profit)} · {d.date}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function Financial() {
  const [tab, setTab] = useState("overview");

  // Summary
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Profit
  const [profitData, setProfitData] = useState(null);
  const [range, setRange] = useState("thisMonth");
  const [country, setCountry] = useState("All");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loadingProfit, setLoadingProfit] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState([]);
  const [wPage, setWPage] = useState(1);
  const [wTotal, setWTotal] = useState(0);
  const [wStatusFilter, setWStatusFilter] = useState("");
  const [loadingW, setLoadingW] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Reseller Earnings
  const [resellerEarnings, setResellerEarnings] = useState([]);
  const [rePage, setRePage] = useState(1);
  const [reTotal, setReTotal] = useState(0);
  const [loadingRe, setLoadingRe] = useState(false);

  // ── Fetch summary ─────────────────────────────────────────────
  useEffect(() => {
    setLoadingSummary(true);
    api.get("/admin/financial/summary")
      .then((r) => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoadingSummary(false));
  }, []);

  // ── Fetch profit ──────────────────────────────────────────────
  const fetchProfit = useCallback(() => {
    setLoadingProfit(true);
    const params = { range, country };
    if (range === "custom") { params.customStart = customStart; params.customEnd = customEnd; }
    api.get("/admin/financial/profit", { params })
      .then((r) => setProfitData(r.data))
      .catch(console.error)
      .finally(() => setLoadingProfit(false));
  }, [range, country, customStart, customEnd]);

  useEffect(() => { fetchProfit(); }, [fetchProfit]);

  // ── Fetch users ───────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "users") return;
    setLoadingUsers(true);
    api.get("/admin/financial/users", { params: { page: userPage, limit: 20 } })
      .then((r) => { setUsers(r.data.data); setUserTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [tab, userPage]);

  // ── Fetch withdrawals ─────────────────────────────────────────
  const fetchWithdrawals = useCallback(() => {
    if (tab !== "withdrawals") return;
    setLoadingW(true);
    const params = { page: wPage, limit: 20 };
    if (wStatusFilter) params.status = wStatusFilter;
    api.get("/admin/financial/withdrawals", { params })
      .then((r) => { setWithdrawals(r.data.data); setWTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingW(false));
  }, [tab, wPage, wStatusFilter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  // ── Fetch reseller earnings ───────────────────────────────────
  useEffect(() => {
    if (tab !== "resellers") return;
    setLoadingRe(true);
    api.get("/admin/financial/reseller-earnings", { params: { page: rePage, limit: 20 } })
      .then((r) => { setResellerEarnings(r.data.data); setReTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingRe(false));
  }, [tab, rePage]);

  // ── Withdrawal actions ────────────────────────────────────────
  const handleApprove = async (userId, txId) => {
    if (!window.confirm("Approve this withdrawal?")) return;
    setActionLoading(txId);
    try {
      await api.post(`/admin/withdrawals/${userId}/${txId}/approve`);
      fetchWithdrawals();
    } catch (e) { alert(e?.response?.data?.message ?? "Error"); }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (userId, txId) => {
    const reason = window.prompt("Reason for declining (optional):");
    if (reason === null) return;
    setActionLoading(txId);
    try {
      await api.post(`/admin/withdrawals/${userId}/${txId}/reject`, { reason });
      fetchWithdrawals();
    } catch (e) { alert(e?.response?.data?.message ?? "Error"); }
    finally { setActionLoading(null); }
  };

  const handleSetStatus = async (userId, txId, status) => {
    setActionLoading(txId + status);
    try {
      await api.patch(`/admin/financial/withdrawals/${userId}/${txId}/status`, { status });
      fetchWithdrawals();
    } catch (e) { alert(e?.response?.data?.message ?? "Error"); }
    finally { setActionLoading(null); }
  };

  // ── Tabs ──────────────────────────────────────────────────────
  const tabs = [
    { key: "overview",     label: "Overview" },
    { key: "profit",       label: "Profit" },
    { key: "users",        label: "User Balances" },
    { key: "withdrawals",  label: "Withdrawals" },
    { key: "resellers",    label: "Reseller Earnings" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Wallet balances, profit, withdrawals & earnings</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {tab === "overview" && (
          <div className="space-y-6">
            {loadingSummary ? (
              <p className="text-gray-400 text-sm">Loading…</p>
            ) : summary ? (
              <>
                {/* Top KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Balance Used Today"   value={`$${fmt(summary.balanceUsedToday)}`}               accent="orange" />
                  <StatCard label="Total Users Wallet"   value={`$${fmt(summary.totalUsersWalletBalance)}`}          accent="blue" />
                  <StatCard label="Commission Rate"      value={`${summary.commission}%`}                            accent="purple" />
                  <StatCard label="Total Resellers"      value={summary.reseller?.total ?? 0}                        accent="cyan" />
                </div>

                {/* Provider Balances */}
                <Section title="Provider Wallet Balances">
                  {summary.providerBalances?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No providers configured.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {summary.providerBalances.map((p) => (
                        <div key={p.provider} className={`flex items-center justify-between rounded-lg px-4 py-3 border ${
                          p.status === "ok" ? "border-gray-700 bg-gray-800/50" : "border-red-800 bg-red-900/20"
                        }`}>
                          <div>
                            <p className="text-sm font-semibold text-white">{p.provider}</p>
                            <p className="text-xs text-gray-400">{p.currency}</p>
                          </div>
                          <p className={`text-lg font-bold ${p.status === "ok" ? "text-orange-400" : "text-red-400"}`}>
                            {p.status === "ok" ? `$${fmt(p.balance)}` : "Error"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Child Panel Summary */}
                <Section title="Child Panel Summary">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Child Panels"     value={summary.childPanel?.totalPanels ?? 0}                          accent="blue" />
                    <StatCard label="Total Activations"      value={summary.childPanel?.totalActivations ?? 0}                     accent="green" />
                    <StatCard label="Activation Fees Earned" value={`$${fmt(summary.childPanel?.totalActivationFees)}`}             accent="orange" />
                    <StatCard label="Child Panel Balances"   value={`$${fmt(summary.childPanel?.totalBalance)}`}                   accent="purple" />
                  </div>
                </Section>

                {/* Reseller Summary */}
                <Section title="Reseller Summary">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Total Resellers"        value={summary.reseller?.total ?? 0}                accent="cyan" />
                    <StatCard label="Total Reseller Wallets" value={`$${fmt(summary.reseller?.totalBalance)}`}   accent="green" />
                  </div>
                </Section>
              </>
            ) : (
              <p className="text-red-400 text-sm">Failed to load summary.</p>
            )}
          </div>
        )}

        {/* ══════════════ PROFIT TAB ══════════════ */}
        {tab === "profit" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Date Range</label>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
                >
                  {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {range === "custom" && (
                <>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Start</label>
                    <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">End</label>
                    <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-gray-400 block mb-1">Country</label>
                <input
                  type="text"
                  placeholder="All / KE / US …"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 w-32"
                />
              </div>

              <button
                onClick={fetchProfit}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Apply
              </button>
            </div>

            {/* Profit KPIs */}
            {loadingProfit ? (
              <p className="text-gray-400 text-sm">Loading…</p>
            ) : profitData ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Profit (Completed)"  value={`$${fmt(profitData.profit)}`}       accent="green"  sub={`${profitData.commission}% commission`} />
                  <StatCard label="Gross Revenue"        value={`$${fmt(profitData.grossRevenue)}`} accent="orange" />
                  <StatCard label="Orders (Completed)"   value={profitData.totalOrders}              accent="blue" />
                  <StatCard label="Commission"           value={`${profitData.commission}%`}         accent="purple" />
                </div>

                {/* Mini chart */}
                <Section title="Daily Profit Breakdown">
                  <MiniChart data={profitData.chart} />
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-800">
                          <th className="pb-2">Date</th>
                          <th className="pb-2 text-right">Orders</th>
                          <th className="pb-2 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitData.chart.map((d) => (
                          <tr key={d.date} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-2 text-gray-300">{d.date}</td>
                            <td className="py-2 text-right text-gray-400">{d.orders}</td>
                            <td className="py-2 text-right text-green-400 font-medium">${fmt(d.profit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </>
            ) : null}
          </div>
        )}

        {/* ══════════════ USER BALANCES TAB ══════════════ */}
        {tab === "users" && (
          <Section title={`User Balances — sorted by highest balance (${userTotal} total)`}>
            {loadingUsers ? (
              <p className="text-gray-400 text-sm">Loading…</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-800">
                        <th className="pb-2">#</th>
                        <th className="pb-2">User</th>
                        <th className="pb-2">Country</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 text-gray-500">{(userPage - 1) * 20 + i + 1}</td>
                          <td className="py-2">
                            <p className="text-white font-medium">{u.email}</p>
                            <p className="text-xs text-gray-500">{u.phone}</p>
                          </td>
                          <td className="py-2 text-gray-400">{u.country}</td>
                          <td className="py-2">
                            {u.isChildPanel && <span className="text-xs bg-purple-900/50 text-purple-400 border border-purple-700 px-2 py-0.5 rounded-full">Child Panel</span>}
                            {u.isReseller  && <span className="text-xs bg-blue-900/50 text-blue-400 border border-blue-700 px-2 py-0.5 rounded-full">Reseller</span>}
                            {!u.isChildPanel && !u.isReseller && <span className="text-xs text-gray-500">User</span>}
                          </td>
                          <td className="py-2 text-right">
                            <span className={`font-bold ${u.balance > 0 ? "text-green-400" : "text-gray-500"}`}>
                              ${fmt(u.balance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                  <span>{userTotal} users</span>
                  <div className="flex gap-2">
                    <button disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)}
                      className="px-3 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Prev</button>
                    <span className="px-3 py-1">Page {userPage}</span>
                    <button disabled={userPage * 20 >= userTotal} onClick={() => setUserPage((p) => p + 1)}
                      className="px-3 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Next</button>
                  </div>
                </div>
              </>
            )}
          </Section>
        )}

        {/* ══════════════ WITHDRAWALS TAB ══════════════ */}
        {tab === "withdrawals" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex gap-2 flex-wrap">
              {["", "Pending", "Completed", "Failed", "Processing"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setWStatusFilter(s); setWPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    wStatusFilter === s
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>

            <Section title={`Withdrawal Requests (${wTotal} total)`}>
              {loadingW ? (
                <p className="text-gray-400 text-sm">Loading…</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-800">
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
                          <tr><td colSpan={7} className="py-6 text-center text-gray-500">No withdrawals found</td></tr>
                        )}
                        {withdrawals.map((w) => {
                          const busy = actionLoading === w.txId || actionLoading?.startsWith?.(w.txId);
                          return (
                            <tr key={`${w.walletId}-${w.txId}`} className="border-b border-gray-800/50 hover:bg-gray-800/30 align-top">
                              <td className="py-3 pr-3">
                                <p className="text-white font-medium">{w.brandName}</p>
                                <p className="text-xs text-gray-500">{w.email}</p>
                              </td>
                              <td className="py-3 text-gray-400 text-xs max-w-[140px] truncate">{w.note || "—"}</td>
                              <td className="py-3 text-right font-bold text-orange-400">${fmt(w.amount)}</td>
                              <td className="py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[w.status] ?? "bg-gray-700 text-gray-400"}`}>
                                  {w.status}
                                </span>
                              </td>
                              <td className="py-3 text-xs text-gray-500">
                                {new Date(w.createdAt).toLocaleDateString()}
                              </td>
                              {/* Approve / Decline (only for Pending) */}
                              <td className="py-3">
                                {w.status === "Pending" ? (
                                  <div className="flex gap-1">
                                    <button
                                      disabled={busy}
                                      onClick={() => handleApprove(w.userId, w.txId)}
                                      className="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded disabled:opacity-40"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      disabled={busy}
                                      onClick={() => handleDecline(w.userId, w.txId)}
                                      className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded disabled:opacity-40"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : <span className="text-gray-600 text-xs">—</span>}
                              </td>
                              {/* Manual status control */}
                              <td className="py-3">
                                <div className="flex gap-1 flex-wrap">
                                  {["Completed", "Failed", "Processing"].map((s) => (
                                    <button
                                      key={s}
                                      disabled={busy || w.status === s}
                                      onClick={() => handleSetStatus(w.userId, w.txId, s)}
                                      className={`text-[10px] px-2 py-0.5 rounded border transition disabled:opacity-30 ${
                                        w.status === s
                                          ? "border-gray-600 text-gray-600 cursor-not-allowed"
                                          : "border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400"
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
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                    <span>{wTotal} total</span>
                    <div className="flex gap-2">
                      <button disabled={wPage === 1} onClick={() => setWPage((p) => p - 1)}
                        className="px-3 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Prev</button>
                      <span className="px-3 py-1">Page {wPage}</span>
                      <button disabled={wPage * 20 >= wTotal} onClick={() => setWPage((p) => p + 1)}
                        className="px-3 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Next</button>
                    </div>
                  </div>
                </>
              )}
            </Section>
          </div>
        )}

        {/* ══════════════ RESELLER EARNINGS TAB ══════════════ */}
        {tab === "resellers" && (
          <Section title={`Reseller Total Earnings — ${reTotal} resellers`}>
            {loadingRe ? (
              <p className="text-gray-400 text-sm">Loading…</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-800">
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
                        <tr><td colSpan={7} className="py-6 text-center text-gray-500">No resellers found</td></tr>
                      )}
                      {resellerEarnings.map((r, i) => (
                        <tr key={r._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 text-gray-500">{(rePage - 1) * 20 + i + 1}</td>
                          <td className="py-2">
                            <p className="text-white font-medium">{r.email}</p>
                            <p className="text-xs text-gray-500">{r.phone}</p>
                          </td>
                          <td className="py-2 text-gray-400">{r.country ?? "—"}</td>
                          <td className="py-2 text-right text-gray-300">{r.totalOrders}</td>
                          <td className="py-2 text-right text-gray-300">${fmt(r.totalCharge)}</td>
                          <td className="py-2 text-right font-bold text-green-400">${fmt(r.totalEarnings)}</td>
                          <td className="py-2 text-right font-bold text-orange-400">${fmt(r.walletBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                  <span>{reTotal} resellers</span>
                  <div className="flex gap-2">
                    <button disabled={rePage === 1} onClick={() => setRePage((p) => p - 1)}
                      className="px-3 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Prev</button>
                    <span className="px-3 py-1">Page {rePage}</span>
                    <button disabled={rePage * 20 >= reTotal} onClick={() => setRePage((p) => p + 1)}
                      className="px-3 py-1 rounded bg-gray-800 disabled:opacity-40 hover:bg-gray-700">Next</button>
                  </div>
                </div>
              </>
            )}
          </Section>
        )}

      </div>
    </div>
  );
      }
