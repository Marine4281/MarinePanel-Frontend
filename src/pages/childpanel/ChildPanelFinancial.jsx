// src/pages/childpanel/ChildPanelFinancial.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import CPFinancialOverview         from "../../components/childpanel/financial/CPFinancialOverview";
import CPFinancialProfit           from "../../components/childpanel/financial/CPFinancialProfit";
import CPFinancialUserBalances     from "../../components/childpanel/financial/CPFinancialUserBalances";
import CPFinancialWithdrawals      from "../../components/childpanel/financial/CPFinancialWithdrawals";
import CPFinancialResellerEarnings from "../../components/childpanel/financial/CPFinancialResellerEarnings";
import ChildPanelSidebar           from "../../components/childpanel/ChildPanelSidebar";
import CPHeader                    from "../../components/childpanel/CPHeader";

const TABS = [
  { key: "overview",    label: "Overview" },
  { key: "profit",      label: "Profit" },
  { key: "users",       label: "User Balances" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "resellers",   label: "Reseller Earnings" },
];

export default function ChildPanelFinancial() {
  const [tab, setTab]             = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Summary ──────────────────────────────────────────────────
  const [summary, setSummary]               = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // ── Profit ───────────────────────────────────────────────────
  const [profitData, setProfitData]         = useState(null);
  const [range, setRange]                   = useState("thisMonth");
  const [country, setCountry]               = useState("All");
  const [customStart, setCustomStart]       = useState("");
  const [customEnd, setCustomEnd]           = useState("");
  const [loadingProfit, setLoadingProfit]   = useState(false);

  // ── Users ────────────────────────────────────────────────────
  const [users, setUsers]                   = useState([]);
  const [userPage, setUserPage]             = useState(1);
  const [userTotal, setUserTotal]           = useState(0);
  const [loadingUsers, setLoadingUsers]     = useState(false);

  // ── Withdrawals ──────────────────────────────────────────────
  const [withdrawals, setWithdrawals]       = useState([]);
  const [wPage, setWPage]                   = useState(1);
  const [wTotal, setWTotal]                 = useState(0);
  const [wStatusFilter, setWStatusFilter]   = useState("");
  const [loadingW, setLoadingW]             = useState(false);
  const [actionLoading, setActionLoading]   = useState(null);

  // ── Reseller Earnings ────────────────────────────────────────
  const [resellerEarnings, setResellerEarnings] = useState([]);
  const [rePage, setRePage]                 = useState(1);
  const [reTotal, setReTotal]               = useState(0);
  const [loadingRe, setLoadingRe]           = useState(false);

  // ── Fetches ──────────────────────────────────────────────────
  useEffect(() => {
    setLoadingSummary(true);
    api.get("/cp/financial/summary")
      .then((r) => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoadingSummary(false));
  }, []);

  const fetchProfit = useCallback(() => {
    setLoadingProfit(true);
    const params = { range, country };
    if (range === "custom") { params.customStart = customStart; params.customEnd = customEnd; }
    api.get("/cp/financial/profit", { params })
      .then((r) => setProfitData(r.data))
      .catch(console.error)
      .finally(() => setLoadingProfit(false));
  }, [range, country, customStart, customEnd]);

  useEffect(() => { fetchProfit(); }, [fetchProfit]);

  useEffect(() => {
    if (tab !== "users") return;
    setLoadingUsers(true);
    api.get("/cp/financial/users", { params: { page: userPage, limit: 20 } })
      .then((r) => { setUsers(r.data.data); setUserTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [tab, userPage]);

  const fetchWithdrawals = useCallback(() => {
    if (tab !== "withdrawals") return;
    setLoadingW(true);
    const params = { page: wPage, limit: 20 };
    if (wStatusFilter) params.status = wStatusFilter;
    api.get("/cp/financial/withdrawals", { params })
      .then((r) => { setWithdrawals(r.data.data); setWTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingW(false));
  }, [tab, wPage, wStatusFilter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  useEffect(() => {
    if (tab !== "resellers") return;
    setLoadingRe(true);
    api.get("/cp/financial/reseller-earnings", { params: { page: rePage, limit: 20 } })
      .then((r) => { setResellerEarnings(r.data.data); setReTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoadingRe(false));
  }, [tab, rePage]);

  // ── Withdrawal Actions ────────────────────────────────────────
  const handleApprove = async (userId, txId) => {
    if (!window.confirm("Approve this withdrawal?")) return;
    setActionLoading(txId);
    try {
      await api.post(`/cp/financial/withdrawals/${userId}/${txId}/approve`);
      fetchWithdrawals();
    } catch (e) { alert(e?.response?.data?.message ?? "Error"); }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (userId, txId) => {
    const reason = window.prompt("Reason for declining (optional):");
    if (reason === null) return;
    setActionLoading(txId);
    try {
      await api.post(`/cp/financial/withdrawals/${userId}/${txId}/reject`, { reason });
      fetchWithdrawals();
    } catch (e) { alert(e?.response?.data?.message ?? "Error"); }
    finally { setActionLoading(null); }
  };

  const handleSetStatus = async (userId, txId, status) => {
    setActionLoading(txId + status);
    try {
      await api.patch(`/cp/financial/withdrawals/${userId}/${txId}/status`, { status });
      fetchWithdrawals();
    } catch (e) { alert(e?.response?.data?.message ?? "Error"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ChildPanelSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <CPHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Financial Overview</h1>
              <p className="text-sm text-gray-500 mt-1">
                Wallet balances, profit, withdrawals &amp; earnings
              </p>
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "overview" && (
              <CPFinancialOverview summary={summary} loading={loadingSummary} />
            )}

            {tab === "profit" && (
              <CPFinancialProfit
                profitData={profitData}   loading={loadingProfit}
                range={range}             setRange={setRange}
                country={country}         setCountry={setCountry}
                customStart={customStart} setCustomStart={setCustomStart}
                customEnd={customEnd}     setCustomEnd={setCustomEnd}
                onApply={fetchProfit}
              />
            )}

            {tab === "users" && (
              <CPFinancialUserBalances
                users={users}         loading={loadingUsers}
                userPage={userPage}   setUserPage={setUserPage}
                userTotal={userTotal}
              />
            )}

            {tab === "withdrawals" && (
              <CPFinancialWithdrawals
                withdrawals={withdrawals}     loading={loadingW}
                wPage={wPage}                 setWPage={setWPage}
                wTotal={wTotal}
                wStatusFilter={wStatusFilter} setWStatusFilter={setWStatusFilter}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onDecline={handleDecline}
                onSetStatus={handleSetStatus}
              />
            )}

            {tab === "resellers" && (
              <CPFinancialResellerEarnings
                resellerEarnings={resellerEarnings} loading={loadingRe}
                rePage={rePage}                     setRePage={setRePage}
                reTotal={reTotal}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
        }
