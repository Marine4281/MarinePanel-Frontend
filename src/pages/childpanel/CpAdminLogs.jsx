import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import ChildPanelSidebar from "../../components/childpanel/ChildPanelSidebar";

const ACTION_META = {
  UPDATE_BALANCE:          { label: "Update Balance",          color: "bg-blue-100 text-blue-800",     group: "Balance" },
  BLOCK_USER:              { label: "Block User",              color: "bg-red-100 text-red-800",        group: "User Status" },
  UNBLOCK_USER:            { label: "Unblock User",            color: "bg-green-100 text-green-800",    group: "User Status" },
  FREEZE_USER:             { label: "Freeze User",             color: "bg-indigo-100 text-indigo-800",  group: "User Status" },
  UNFREEZE_USER:           { label: "Unfreeze User",           color: "bg-teal-100 text-teal-800",      group: "User Status" },
  DELETE_USER:             { label: "Delete User",             color: "bg-red-200 text-red-900",        group: "User Status" },
  PROMOTE_ADMIN:           { label: "Promote to Admin",        color: "bg-green-100 text-green-800",    group: "Role Change" },
  DEMOTE_ADMIN:            { label: "Demote from Admin",       color: "bg-yellow-100 text-yellow-800",  group: "Role Change" },
  COMPLETE_ORDER:          { label: "Complete Order",          color: "bg-emerald-100 text-emerald-800",group: "Orders" },
  REFUND_ORDER:            { label: "Refund Order",            color: "bg-orange-100 text-orange-800",  group: "Orders" },
  UPDATE_COMMISSION:       { label: "Update Commission",       color: "bg-purple-100 text-purple-800",  group: "Commission" },
  UPDATE_USER_COMMISSION:  { label: "Update User Commission",  color: "bg-purple-100 text-purple-800",  group: "Commission" },
  RESET_REVENUE:           { label: "Reset Revenue",           color: "bg-rose-100 text-rose-800",      group: "Commission" },
  UPDATE_RESELLER_SETTINGS:{ label: "Update Reseller Settings",color: "bg-cyan-100 text-cyan-800",      group: "Reseller" },
  REGISTER_USER:           { label: "Register User",           color: "bg-sky-100 text-sky-800",        group: "Auth" },
  RESET_PASSWORD:          { label: "Reset Password",          color: "bg-amber-100 text-amber-800",    group: "Auth" },
  FORGOT_PASSWORD:         { label: "Forgot Password",         color: "bg-amber-100 text-amber-800",    group: "Auth" },
  UPDATE_PROFILE:          { label: "Update Profile",          color: "bg-slate-100 text-slate-800",    group: "Profile" },
};

const FILTER_GROUPS = [
  { label: "Balance",     actions: ["UPDATE_BALANCE"] },
  { label: "User Status", actions: ["BLOCK_USER","UNBLOCK_USER","FREEZE_USER","UNFREEZE_USER","DELETE_USER"] },
  { label: "Role Change", actions: ["PROMOTE_ADMIN","DEMOTE_ADMIN"] },
  { label: "Orders",      actions: ["COMPLETE_ORDER","REFUND_ORDER"] },
  { label: "Commission",  actions: ["UPDATE_COMMISSION","UPDATE_USER_COMMISSION","RESET_REVENUE"] },
  { label: "Reseller",    actions: ["UPDATE_RESELLER_SETTINGS"] },
  { label: "Auth",        actions: ["REGISTER_USER","RESET_PASSWORD","FORGOT_PASSWORD"] },
  { label: "Profile",     actions: ["UPDATE_PROFILE"] },
];

const DEFAULT_COLOR = "bg-gray-100 text-gray-700";

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
      if (selectedAction)  params.set("action", selectedAction);
      if (search.trim())   params.set("admin",  search.trim());
      if (dateFrom)        params.set("dateFrom", dateFrom);
      if (dateTo)          params.set("dateTo",   dateTo);

      const res = await API.get(`/child-panel/logs?${params.toString()}`);

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

  const handleActionBadgeClick = (action) => {
    setSelectedAction(prev => prev === action ? "" : action);
  };

  const handleReset = () => {
    setSelectedGroup("All");
    setSelectedAction("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const visibleGroupActions =
    selectedGroup === "All"
      ? []
      : FILTER_GROUPS.find(g => g.label === selectedGroup)?.actions || [];

  const displayedLogs =
    selectedGroup !== "All" && !selectedAction
      ? logs.filter(l => visibleGroupActions.includes(l.action?.toUpperCase()))
      : logs;

  const getMeta = (action) =>
    ACTION_META[action?.toUpperCase()] || { label: action || "—", color: DEFAULT_COLOR };

  return (
    <div className="flex h-screen bg-gray-50">
      <ChildPanelSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setMobileOpen(true)}
            >
              <i className="fa-solid fa-bars" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Staff Actions</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {total.toLocaleString()} total records · page {page} of {totalPages}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <i className="fa-solid fa-arrows-rotate text-xs" />
            Refresh
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Search & Date Range */}
          <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1 min-w-[200px] flex-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Search Admin
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
              <input
                type="date" value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
              <input
                type="date" value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
            >
              <i className="fa-solid fa-xmark mr-1" /> Reset
            </button>
          </div>

          {/* Group Filter Chips */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Filter by Category
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGroupClick("All")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  selectedGroup === "All"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                All Actions
              </button>
              {FILTER_GROUPS.map(g => (
                <button
                  key={g.label}
                  onClick={() => handleGroupClick(g.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selectedGroup === g.label
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {selectedGroup !== "All" && visibleGroupActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                <span className="text-xs text-gray-400 self-center">Exact action:</span>
                {visibleGroupActions.map(action => {
                  const meta = getMeta(action);
                  return (
                    <button
                      key={action}
                      onClick={() => handleActionBadgeClick(action)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        selectedAction === action
                          ? "ring-2 ring-blue-400 " + meta.color
                          : meta.color + " opacity-80 hover:opacity-100"
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active filter pills */}
          {(selectedAction || selectedGroup !== "All" || search || dateFrom || dateTo) && (
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
              <span className="font-medium">Active filters:</span>
              {selectedGroup !== "All" && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  Group: {selectedGroup}
                </span>
              )}
              {selectedAction && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  Action: {getMeta(selectedAction).label}
                </span>
              )}
              {search && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  Admin: {search}
                </span>
              )}
              {dateFrom && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  From: {dateFrom}
                </span>
              )}
              {dateTo && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  To: {dateTo}
                </span>
              )}
              <button onClick={handleReset} className="text-xs text-red-500 hover:underline ml-1">
                Clear all
              </button>
            </div>
          )}

          {/* Table */}
          {loading && (
            <div className="text-center py-16 text-gray-400">
              <i className="fa-solid fa-spinner fa-spin text-2xl mb-2" />
              <p className="text-sm">Loading logs...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Admin</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Action</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Target</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Description</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">IP</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-gray-400">
                          <i className="fa-solid fa-filter-circle-xmark text-2xl mb-2 block" />
                          No logs match your filters
                        </td>
                      </tr>
                    ) : (
                      displayedLogs.map(log => {
                        const meta = getMeta(log.action);
                        return (
                          <tr key={log._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">
                                {log.admin?.name || log.adminEmail || "System"}
                              </div>
                              {log.admin?.email && log.admin.email !== log.admin?.name && (
                                <div className="text-xs text-gray-400">{log.admin.email}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{log.targetType || "—"}</td>
                            <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={log.description}>
                              {log.description || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs font-mono">{log.ipAddress || "—"}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50 text-sm text-gray-500">
                <button
                  onClick={() => fetchLogs(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
                    page === 1
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "border-gray-300 hover:bg-white hover:text-gray-700"
                  }`}
                >
                  <i className="fa-solid fa-chevron-left text-xs" /> Prev
                </button>
                <span className="text-xs">
                  Page <span className="font-semibold text-gray-700">{page}</span> of{" "}
                  <span className="font-semibold text-gray-700">{totalPages}</span>
                </span>
                <button
                  onClick={() => fetchLogs(page + 1)}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
                    page === totalPages
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "border-gray-300 hover:bg-white hover:text-gray-700"
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
