import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import toast from "react-hot-toast";

/* ── constants ──────────────────────────────────────────── */
const TABS = ["orders", "refills", "cancels"];

const ORDER_FILTER_TABS  = ["", "active", "paused", "timed_out", "completed", "failed", "partial"];
const REFILL_FILTER_TABS = ["", "active", "timed_out", "stopped", "completed", "rejected"];
const CANCEL_FILTER_TABS = ["", "success", "failed"];

const TAB_LABELS = {
  "": "All", active: "Active", paused: "Paused", timed_out: "Timed Out",
  completed: "Completed", failed: "Failed", partial: "Partial",
  stopped: "Stopped", rejected: "Rejected", success: "Success",
};

const STATUS_PILL = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed:  "bg-green-100 text-green-700 border-green-200",
  partial:    "bg-cyan-100 text-cyan-700 border-cyan-200",
  failed:     "bg-red-100 text-red-700 border-red-200",
  cancelled:  "bg-gray-100 text-gray-600 border-gray-200",
  timed_out:  "bg-orange-100 text-orange-700 border-orange-200",
  stopped:    "bg-gray-100 text-gray-600 border-gray-300",
  rejected:   "bg-red-100 text-red-700 border-red-300",
  success:    "bg-green-100 text-green-700 border-green-200",
  none:       "bg-gray-100 text-gray-500 border-gray-200",
};

const Pill = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_PILL[status] || STATUS_PILL.none}`}>
    {status || "—"}
  </span>
);

const AgeCell = ({ date, warnHours = 24, criticalHours = 48 }) => {
  if (!date) return <span className="text-gray-400 text-xs">—</span>;
  const h = differenceInHours(new Date(), new Date(date));
  const color = h >= criticalHours ? "text-orange-600" : h >= warnHours ? "text-yellow-600" : "text-gray-600";
  return (
    <div>
      <div className={`text-xs font-semibold ${color}`}>{h}h</div>
      <div className="text-gray-400 text-xs">{formatDistanceToNow(new Date(date), { addSuffix: true })}</div>
    </div>
  );
};

const ActionBtn = ({ label, onClick, color, loading, disabled }) => {
  const colors = {
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100",
    green:  "bg-green-50 text-green-700 border-green-300 hover:bg-green-100",
    red:    "bg-red-50 text-red-700 border-red-300 hover:bg-red-100",
    indigo: "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`px-2.5 py-1 rounded text-xs border transition-colors disabled:opacity-40 ${colors[color]}`}
    >
      {loading ? "···" : label}
    </button>
  );
};

/* ── main component ─────────────────────────────────────── */
export default function AdminSyncMonitor() {
  const [mainTab, setMainTab]       = useState("orders");
  const [filterTab, setFilterTab]   = useState("");
  const [search, setSearch]         = useState("");
  const [data, setData]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [loading, setLoading]       = useState(false);
  const [busyId, setBusyId]         = useState(null); // "orderId:action"

  const filterTabs =
    mainTab === "orders"  ? ORDER_FILTER_TABS  :
    mainTab === "refills" ? REFILL_FILTER_TABS :
    CANCEL_FILTER_TABS;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await API.get(`/admin/sync/${mainTab}`, {
        params: { page, limit: 20, status: filterTab, search },
      });
      setData(res.orders);
      setTotal(res.total);
      setPages(res.pages);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [mainTab, filterTab, search, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); setFilterTab(""); }, [mainTab]);
  useEffect(() => { setPage(1); }, [filterTab, search]);

  const act = async (id, action, confirm_msg) => {
    if (confirm_msg && !window.confirm(confirm_msg)) return;
    setBusyId(id + action);
    try {
      await API.post(`/admin/sync/${mainTab}/${id}/${action}`);
      toast.success(`${action} done`);
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.message || `${action} failed`);
    } finally {
      setBusyId(null);
    }
  };

  const busy = (id, action) => busyId === id + action;

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sync Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor provider polling for orders, refills & cancels · auto-timeout at 72h / 48h
          </p>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-200 shadow-sm rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                mainTab === t ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filter tabs + search */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {filterTabs.map((f) => (
            <button
              key={f}
              onClick={() => setFilterTab(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterTab === f ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {TAB_LABELS[f]}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID..."
            className="ml-auto bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 w-52"
          />
        </div>

        {/* Count */}
        <div className="text-gray-500 text-xs mb-3">{total} result{total !== 1 ? "s" : ""}</div>

        {/* Table */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-500">Loading...</div>
          ) : data.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Nothing found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Service</th>
                  {mainTab === "orders"  && <th className="text-left px-4 py-3">Provider ID</th>}
                  {mainTab === "refills" && <th className="text-left px-4 py-3">Refill ID</th>}
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Age</th>
                  <th className="text-left px-4 py-3">Note</th>
                  {mainTab !== "cancels" && <th className="text-right px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const isOrderActive   = ["pending", "processing"].includes(row.status) && !row.syncPaused;
                  const isOrderPaused   = row.syncPaused && !["completed","cancelled","refunded"].includes(row.status);
                  const isRefillActive  = ["pending","processing"].includes(row.refillStatus) && !row.refillProcessed;
                  const isRefillPaused  = row.refillProcessed && !["completed","rejected"].includes(row.refillStatus);

                  return (
                    <tr key={row._id} className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors">
                      {/* Order info */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-gray-900 text-xs">{row.orderId}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{row.userId?.email || "—"}</div>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3">
                        <div className="text-gray-700 text-xs max-w-[150px] truncate">{row.service}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{row.providerProfileId?.name || "—"}</div>
                      </td>

                      {/* Provider ID or Refill ID */}
                      {mainTab === "orders"  && (
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{row.providerOrderId || "—"}</td>
                      )}
                      {mainTab === "refills" && (
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{row.refillId || "—"}</td>
                      )}

                      {/* Status */}
                      <td className="px-4 py-3">
                        {mainTab === "orders"  && (
                          <div className="flex flex-col gap-1">
                            <Pill status={row.status} />
                            {row.syncTimedOut && <Pill status="timed_out" />}
                            {row.syncPaused && !row.syncTimedOut && <span className="text-xs text-yellow-600">⏸ paused</span>}
                          </div>
                        )}
                        {mainTab === "refills" && <Pill status={row.refillStatus} />}
                        {mainTab === "cancels" && <Pill status={row.cancelStatus} />}
                      </td>

                      {/* Age */}
                      <td className="px-4 py-3">
                        {mainTab === "orders"  && <AgeCell date={row.createdAt}          warnHours={24} criticalHours={72} />}
                        {mainTab === "refills" && <AgeCell date={row.refillRequestedAt}  warnHours={24} criticalHours={48} />}
                        {mainTab === "cancels" && <AgeCell date={row.cancelRequestedAt}  warnHours={0}  criticalHours={0}  />}
                      </td>

                      {/* Admin note */}
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-xs italic truncate max-w-[120px] block">
                          {(mainTab === "orders"  ? row.syncAdminNote   :
                            mainTab === "refills" ? row.refillAdminNote : "—") || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      {mainTab !== "cancels" && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 justify-end flex-wrap">
                            {/* Force Check */}
                            <ActionBtn
                              label="Check"
                              color="indigo"
                              loading={busy(row._id, "force-check")}
                              disabled={!!busyId}
                              onClick={() => act(row._id, "force-check")}
                            />

                            {/* Pause — only when actively polling */}
                            {mainTab === "orders" && isOrderActive && (
                              <ActionBtn label="Pause" color="yellow"
                                loading={busy(row._id, "pause")} disabled={!!busyId}
                                onClick={() => act(row._id, "pause")} />
                            )}
                            {mainTab === "refills" && isRefillActive && (
                              <ActionBtn label="Pause" color="yellow"
                                loading={busy(row._id, "pause")} disabled={!!busyId}
                                onClick={() => act(row._id, "pause")} />
                            )}

                            {/* Resume — only when paused/timed-out */}
                            {mainTab === "orders" && isOrderPaused && (
                              <ActionBtn label="Resume" color="green"
                                loading={busy(row._id, "resume")} disabled={!!busyId}
                                onClick={() => act(row._id, "resume")} />
                            )}
                            {mainTab === "refills" && isRefillPaused && (
                              <ActionBtn label="Resume" color="green"
                                loading={busy(row._id, "resume")} disabled={!!busyId}
                                onClick={() => act(row._id, "resume")} />
                            )}

                            {/* Stop */}
                            {mainTab === "orders" && !["completed","cancelled","refunded"].includes(row.status) && (
                              <ActionBtn label="Stop" color="red"
                                loading={busy(row._id, "stop")} disabled={!!busyId}
                                onClick={() => act(row._id, "stop", "Stop this order permanently?")} />
                            )}
                            {mainTab === "refills" && !["completed","stopped"].includes(row.refillStatus) && (
                              <ActionBtn label="Stop" color="red"
                                loading={busy(row._id, "stop")} disabled={!!busyId}
                                onClick={() => act(row._id, "stop", "Stop this refill permanently?")} />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-xs ${
                  p === page ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
