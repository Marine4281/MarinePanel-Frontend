import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import ChildPanelSidebar from "../../components/childpanel/ChildPanelSidebar";

const ACTION_META = {
  UPDATE_BALANCE:           { label: "Update Balance",          icon: "fa-wallet",           color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-500",    group: "Balance" },
  BLOCK_USER:               { label: "Block User",              icon: "fa-ban",              color: "bg-red-100 text-red-700 border-red-200",           dot: "bg-red-500",     group: "User Status" },
  UNBLOCK_USER:             { label: "Unblock User",            icon: "fa-circle-check",     color: "bg-green-100 text-green-700 border-green-200",     dot: "bg-green-500",   group: "User Status" },
  FREEZE_USER:              { label: "Freeze User",             icon: "fa-snowflake",        color: "bg-indigo-100 text-indigo-700 border-indigo-200",  dot: "bg-indigo-500",  group: "User Status" },
  UNFREEZE_USER:            { label: "Unfreeze User",           icon: "fa-fire",             color: "bg-teal-100 text-teal-700 border-teal-200",        dot: "bg-teal-500",    group: "User Status" },
  DELETE_USER:              { label: "Delete User",             icon: "fa-trash",            color: "bg-red-200 text-red-800 border-red-300",           dot: "bg-red-700",     group: "User Status" },
  PROMOTE_ADMIN:            { label: "Promote to Admin",        icon: "fa-arrow-up",         color: "bg-emerald-100 text-emerald-700 border-emerald-200",dot: "bg-emerald-500", group: "Role Change" },
  DEMOTE_ADMIN:             { label: "Demote from Admin",       icon: "fa-arrow-down",       color: "bg-yellow-100 text-yellow-700 border-yellow-200",  dot: "bg-yellow-500",  group: "Role Change" },
  COMPLETE_ORDER:           { label: "Complete Order",          icon: "fa-circle-check",     color: "bg-emerald-100 text-emerald-700 border-emerald-200",dot: "bg-emerald-500", group: "Orders" },
  REFUND_ORDER:             { label: "Refund Order",            icon: "fa-rotate-left",      color: "bg-orange-100 text-orange-700 border-orange-200",  dot: "bg-orange-500",  group: "Orders" },
  UPDATE_COMMISSION:        { label: "Update Commission",       icon: "fa-percent",          color: "bg-purple-100 text-purple-700 border-purple-200",  dot: "bg-purple-500",  group: "Commission" },
  UPDATE_USER_COMMISSION:   { label: "User Commission",         icon: "fa-percent",          color: "bg-purple-100 text-purple-700 border-purple-200",  dot: "bg-purple-500",  group: "Commission" },
  RESET_REVENUE:            { label: "Reset Revenue",           icon: "fa-arrow-rotate-left",color: "bg-rose-100 text-rose-700 border-rose-200",        dot: "bg-rose-500",    group: "Commission" },
  UPDATE_RESELLER_SETTINGS: { label: "Reseller Settings",       icon: "fa-sliders",          color: "bg-cyan-100 text-cyan-700 border-cyan-200",        dot: "bg-cyan-500",    group: "Reseller" },
  TOGGLE_RESELLER_STATUS:   { label: "Toggle Reseller",         icon: "fa-toggle-on",        color: "bg-orange-100 text-orange-700 border-orange-200",  dot: "bg-orange-500",  group: "Reseller" },
  UPDATE_COMMISSION_RESELLER:{ label: "Reseller Commission",    icon: "fa-percent",          color: "bg-cyan-100 text-cyan-700 border-cyan-200",        dot: "bg-cyan-500",    group: "Reseller" },
  UPDATE_BALANCE_RESELLER:  { label: "Reseller Balance",        icon: "fa-wallet",           color: "bg-cyan-100 text-cyan-700 border-cyan-200",        dot: "bg-cyan-500",    group: "Reseller" },
  REGISTER_USER:            { label: "Register User",           icon: "fa-user-plus",        color: "bg-sky-100 text-sky-700 border-sky-200",           dot: "bg-sky-500",     group: "Auth" },
  RESET_PASSWORD:           { label: "Reset Password",          icon: "fa-key",              color: "bg-amber-100 text-amber-700 border-amber-200",     dot: "bg-amber-500",   group: "Auth" },
  FORGOT_PASSWORD:          { label: "Forgot Password",         icon: "fa-lock-open",        color: "bg-amber-100 text-amber-700 border-amber-200",     dot: "bg-amber-500",   group: "Auth" },
  UPDATE_PROFILE:           { label: "Update Profile",          icon: "fa-user-pen",         color: "bg-slate-100 text-slate-700 border-slate-200",     dot: "bg-slate-500",   group: "Profile" },
  UPDATE_BRANDING:          { label: "Update Branding",         icon: "fa-palette",          color: "bg-pink-100 text-pink-700 border-pink-200",        dot: "bg-pink-500",    group: "Settings" },
  UPDATE_DOMAIN:            { label: "Update Domain",           icon: "fa-globe",            color: "bg-pink-100 text-pink-700 border-pink-200",        dot: "bg-pink-500",    group: "Settings" },
  UPDATE_PAYMENT_MODE:      { label: "Payment Mode",            icon: "fa-credit-card",      color: "bg-pink-100 text-pink-700 border-pink-200",        dot: "bg-pink-500",    group: "Settings" },
};

const GROUP_CONFIG = {
  "All":         { icon: "fa-layer-group",   gradient: "from-gray-500 to-gray-600" },
  "Balance":     { icon: "fa-wallet",        gradient: "from-blue-500 to-blue-600" },
  "User Status": { icon: "fa-users",         gradient: "from-red-500 to-rose-600" },
  "Role Change": { icon: "fa-user-shield",   gradient: "from-yellow-500 to-amber-600" },
  "Orders":      { icon: "fa-box",           gradient: "from-emerald-500 to-green-600" },
  "Commission":  { icon: "fa-percent",       gradient: "from-purple-500 to-violet-600" },
  "Reseller":    { icon: "fa-store",         gradient: "from-cyan-500 to-sky-600" },
  "Auth":        { icon: "fa-shield-halved", gradient: "from-amber-500 to-orange-600" },
  "Profile":     { icon: "fa-user-pen",      gradient: "from-slate-500 to-gray-600" },
  "Settings":    { icon: "fa-gear",          gradient: "from-pink-500 to-rose-600" },
};

const FILTER_GROUPS = [
  { label: "Balance",     actions: ["UPDATE_BALANCE"] },
  { label: "User Status", actions: ["BLOCK_USER","UNBLOCK_USER","FREEZE_USER","UNFREEZE_USER","DELETE_USER"] },
  { label: "Role Change", actions: ["PROMOTE_ADMIN","DEMOTE_ADMIN"] },
  { label: "Orders",      actions: ["COMPLETE_ORDER","REFUND_ORDER"] },
  { label: "Commission",  actions: ["UPDATE_COMMISSION","UPDATE_USER_COMMISSION","RESET_REVENUE"] },
  { label: "Reseller",    actions: ["UPDATE_RESELLER_SETTINGS","TOGGLE_RESELLER_STATUS","UPDATE_COMMISSION_RESELLER","UPDATE_BALANCE_RESELLER"] },
  { label: "Auth",        actions: ["REGISTER_USER","RESET_PASSWORD","FORGOT_PASSWORD"] },
  { label: "Profile",     actions: ["UPDATE_PROFILE"] },
  { label: "Settings",    actions: ["UPDATE_BRANDING","UPDATE_DOMAIN","UPDATE_PAYMENT_MODE"] },
];

const DEFAULT_META = { label: "Unknown", icon: "fa-circle-question", color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };

export default function CpAdminLogs() {
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedGroup,  setSelectedGroup]  = useState("All");
  const [selectedAction, setSelectedAction] = useState("");
  const [search,   setSearch]   = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const fetchLogs = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: pageNumber, limit: 50 });
      if (selectedAction) params.set("action", selectedAction);
      if (search.trim())  params.set("admin",  search.trim());
      if (dateFrom)       params.set("dateFrom", dateFrom);
      if (dateTo)         params.set("dateTo",   dateTo);
      const res = await API.get(`/cp/logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setPage(res.data.page  || 1);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Redirecting...");
        localStorage.removeItem("token");
        setTimeout(() => { window.location.href = "/child-panel/login"; }, 1500);
      } else {
        setError("Failed to fetch logs.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedAction, search, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedAction("");
  };

  const handleActionClick = (action) => {
    setSelectedAction(prev => prev === action ? "" : action);
  };

  const handleReset = () => {
    setSelectedGroup("All");
    setSelectedAction("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const visibleGroupActions = selectedGroup === "All"
    ? [] : FILTER_GROUPS.find(g => g.label === selectedGroup)?.actions || [];

  const displayedLogs = selectedGroup !== "All" && !selectedAction
    ? logs.filter(l => visibleGroupActions.includes(l.action?.toUpperCase()))
    : logs;

  const getMeta = (action) =>
    ACTION_META[action?.toUpperCase()] || { ...DEFAULT_META, label: action || "—" };

  const hasFilters = selectedAction || selectedGroup !== "All" || search || dateFrom || dateTo;
  const activeCount = [selectedAction, selectedGroup !== "All", search, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <ChildPanelSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 overflow-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setMobileOpen(true)}>
              <i className="fa-solid fa-bars" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">Staff Actions</h2>
                {activeCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? "Loading…" : `${total.toLocaleString()} records · page ${page} of ${totalPages}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <i className="fa-solid fa-xmark" /> Clear filters
              </button>
            )}
            <button
              onClick={() => fetchLogs(page)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <i className="fa-solid fa-arrows-rotate text-xs" /> Refresh
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* ── Search & Date Row ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex flex-col gap-1 min-w-[220px] flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Admin</label>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input
                    type="text"
                    placeholder="Name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      <i className="fa-solid fa-xmark text-xs" />
                    </button>
                  )}
                </div>
              </div>

              {/* Date From */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</label>
                <div className="relative">
                  <i className="fa-solid fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                  <input
                    type="date" value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To</label>
                <div className="relative">
                  <i className="fa-solid fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                  <input
                    type="date" value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Category Cards ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Filter by Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {["All", ...FILTER_GROUPS.map(g => g.label)].map(group => {
                const cfg = GROUP_CONFIG[group] || GROUP_CONFIG["All"];
                const isActive = selectedGroup === group;
                return (
                  <button
                    key={group}
                    onClick={() => handleGroupClick(group)}
                    className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "border-transparent shadow-md scale-105"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white hover:scale-102"
                    }`}
                    style={isActive ? { background: "linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))" } : {}}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      isActive
                        ? `bg-gradient-to-br ${cfg.gradient} text-white shadow-sm`
                        : "bg-white text-gray-400 border border-gray-200"
                    }`}>
                      <i className={`fa-solid ${cfg.icon}`} />
                    </div>
                    <span className={isActive ? "text-gray-800 font-bold" : ""}>{group}</span>
                    {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />}
                  </button>
                );
              })}
            </div>

            {/* ── Sub-action pills ── */}
            {selectedGroup !== "All" && visibleGroupActions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2.5 font-medium">Drill down by action:</p>
                <div className="flex flex-wrap gap-2">
                  {visibleGroupActions.map(action => {
                    const meta = getMeta(action);
                    const isActive = selectedAction === action;
                    return (
                      <button
                        key={action}
                        onClick={() => handleActionClick(action)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isActive
                            ? `${meta.color} border-current ring-2 ring-offset-1 ring-blue-400 shadow-sm`
                            : `${meta.color} opacity-70 hover:opacity-100`
                        }`}
                      >
                        <i className={`fa-solid ${meta.icon} text-xs`} />
                        {meta.label}
                        {isActive && <i className="fa-solid fa-xmark text-xs ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Active filter summary bar ── */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 items-center bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
              <i className="fa-solid fa-filter text-blue-400 text-xs" />
              <span className="text-xs font-semibold text-blue-600">Active:</span>
              {selectedGroup !== "All" && (
                <span className="flex items-center gap-1 bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  <i className={`fa-solid ${GROUP_CONFIG[selectedGroup]?.icon || "fa-tag"} text-xs`} />
                  {selectedGroup}
                  <button onClick={() => { setSelectedGroup("All"); setSelectedAction(""); }} className="ml-0.5 hover:text-red-500">
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </span>
              )}
              {selectedAction && (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getMeta(selectedAction).color}`}>
                  <i className={`fa-solid ${getMeta(selectedAction).icon} text-xs`} />
                  {getMeta(selectedAction).label}
                  <button onClick={() => setSelectedAction("")} className="ml-0.5 hover:opacity-70">
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1 bg-white text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  <i className="fa-solid fa-magnifying-glass text-xs" /> {search}
                  <button onClick={() => setSearch("")} className="ml-0.5 hover:text-red-500">
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </span>
              )}
              {dateFrom && (
                <span className="flex items-center gap-1 bg-white text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  <i className="fa-solid fa-calendar text-xs" /> From {dateFrom}
                  <button onClick={() => setDateFrom("")} className="ml-0.5 hover:text-red-500">
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </span>
              )}
              {dateTo && (
                <span className="flex items-center gap-1 bg-white text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  <i className="fa-solid fa-calendar text-xs" /> To {dateTo}
                  <button onClick={() => setDateTo("")} className="ml-0.5 hover:text-red-500">
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </span>
              )}
              <button onClick={handleReset} className="ml-auto text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1">
                <i className="fa-solid fa-trash-can text-xs" /> Clear all
              </button>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <i className="fa-solid fa-spinner fa-spin text-blue-400 text-xl" />
              </div>
              <p className="text-sm text-gray-400">Loading logs…</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">
              <i className="fa-solid fa-circle-exclamation text-red-400" />
              {error}
            </div>
          )}

          {/* ── Table ── */}
          {!loading && !error && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Admin</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Target</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">IP</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayedLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-16 text-gray-300">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <i className="fa-solid fa-filter-circle-xmark text-2xl" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No logs match your filters</p>
                          {hasFilters && (
                            <button onClick={handleReset} className="mt-2 text-xs text-blue-500 hover:underline">
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      displayedLogs.map(log => {
                        const meta = getMeta(log.action);
                        return (
                          <tr key={log._id} className="hover:bg-blue-50/30 transition-colors group">
                            {/* Admin */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {(log.admin?.name || log.adminEmail || "S").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-xs">
                                    {log.admin?.name || log.adminEmail?.split("@")[0] || "System"}
                                  </div>
                                  {log.admin?.email && (
                                    <div className="text-xs text-gray-400">{log.admin.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Action badge */}
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                                <i className={`fa-solid ${meta.icon}`} />
                                {meta.label}
                              </span>
                            </td>

                            {/* Target */}
                            <td className="px-4 py-3.5">
                              {log.targetType ? (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium">
                                  <i className="fa-solid fa-tag text-xs text-gray-400" />
                                  {log.targetType}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>

                            {/* Description */}
                            <td className="px-4 py-3.5 max-w-[220px]">
                              <p className="text-gray-600 text-xs truncate" title={log.description}>
                                {log.description || <span className="text-gray-300">—</span>}
                              </p>
                            </td>

                            {/* IP */}
                            <td className="px-4 py-3.5">
                              {log.ipAddress ? (
                                <span className="font-mono text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                  {log.ipAddress}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>

                            {/* Time */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {log.createdAt ? (
                                <div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {new Date(log.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              <div className="flex justify-between items-center px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => fetchLogs(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    page === 1
                      ? "text-gray-300 border-gray-100 cursor-not-allowed bg-white"
                      : "border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <i className="fa-solid fa-chevron-left text-xs" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                    return (
                      <button
                        key={p}
                        onClick={() => fetchLogs(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                          p === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => fetchLogs(page + 1)}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    page === totalPages
                      ? "text-gray-300 border-gray-100 cursor-not-allowed bg-white"
                      : "border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  Next <i className="fa-solid fa-chevron-right text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  }
