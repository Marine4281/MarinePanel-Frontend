// src/pages/AdminApi.jsx
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";

const AdminApi = () => {
  const [overview, setOverview] = useState(null);
  const [rateLimit, setRateLimit] = useState(180);
  const [savingSettings, setSavingSettings] = useState(false);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);

  const [usage, setUsage] = useState({ byAction: [], timeSeries: [] });
  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logPages, setLogPages] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showDocs, setShowDocs] = useState(false);

  const fetchOverview = useCallback(async () => {
    const { data } = await API.get("/admin/api/overview");
    setOverview(data);
    setRateLimit(data.apiRateLimitPerMinute);
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await API.get("/admin/api/users", {
      params: { page: userPage, search: userSearch },
    });
    setUsers(data.users);
    setUserPages(data.pages);
  }, [userPage, userSearch]);

  const fetchUsage = useCallback(async () => {
    const { data } = await API.get("/admin/api/usage");
    setUsage(data);
  }, []);

  const fetchLogs = useCallback(async () => {
    const { data } = await API.get("/admin/api/logs", { params: { page: logPage } });
    setLogs(data.logs);
    setLogPages(data.pages);
  }, [logPage]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await API.get("/admin/api/leaderboard");
    setLeaderboard(data.leaderboard);
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchUsage(); }, [fetchUsage]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const toggleApiEnabled = async () => {
    if (!overview) return;
    setSavingSettings(true);
    try {
      const { data } = await API.put("/admin/api/settings", {
        apiEnabled: !overview.apiEnabled,
      });
      setOverview((prev) => ({ ...prev, apiEnabled: data.apiEnabled }));
    } finally {
      setSavingSettings(false);
    }
  };

  const saveRateLimit = async () => {
    setSavingSettings(true);
    try {
      await API.put("/admin/api/settings", { apiRateLimitPerMinute: Number(rateLimit) });
      fetchOverview();
    } finally {
      setSavingSettings(false);
    }
  };

  const regenerateKey = async (id) => {
    if (!window.confirm("Regenerate this user's API key? Their old key will stop working immediately.")) return;
    await API.post(`/admin/api/users/${id}/regenerate`);
    fetchUsers();
  };

  const revokeKey = async (id) => {
    if (!window.confirm("Revoke API access for this user?")) return;
    await API.post(`/admin/api/users/${id}/revoke`);
    fetchUsers();
  };

  const toggleUser = async (id, enabled) => {
    await API.put(`/admin/api/users/${id}/toggle`, { enabled });
    fetchUsers();
  };

  return (
    <div className="admin-layout" style={{ display: "flex" }}>
      <Sidebar />
      <div className="admin-content" style={{ flex: 1, padding: 24 }}>
        <h1>API Management</h1>

        {/* ===== Global Controls ===== */}
        <section className="card" style={{ marginBottom: 24 }}>
          <h2>Global API Controls</h2>
          {overview && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <strong>API Status: </strong>
                <span style={{ color: overview.apiEnabled ? "green" : "red" }}>
                  {overview.apiEnabled ? "Enabled" : "Disabled"}
                </span>
                <button onClick={toggleApiEnabled} disabled={savingSettings} style={{ marginLeft: 12 }}>
                  {overview.apiEnabled ? "Disable API" : "Enable API"}
                </button>
              </div>

              <div>
                <label>Rate limit (requests/min per key): </label>
                <input
                  type="number"
                  min="1"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  style={{ width: 80, marginLeft: 8 }}
                />
                <button onClick={saveRateLimit} disabled={savingSettings} style={{ marginLeft: 8 }}>
                  Save
                </button>
              </div>

              <div><strong>Total API Orders:</strong> {overview.totalApiOrders}</div>
              <div><strong>Active API Users:</strong> {overview.totalApiUsers}</div>
              <div><strong>Calls (24h):</strong> {overview.last24hCalls}</div>
              <div><strong>Errors (24h):</strong> {overview.last24hErrors}</div>
            </div>
          )}
        </section>

        {/* ===== API Users Table ===== */}
        <section className="card" style={{ marginBottom: 24 }}>
          <h2>API Users</h2>
          <input
            placeholder="Search username or email..."
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
            style={{ marginBottom: 12, padding: 6, width: 260 }}
          />
          <table width="100%" cellPadding={8}>
            <thead>
              <tr>
                <th align="left">User</th>
                <th align="left">API Key</th>
                <th align="left">Status</th>
                <th align="left">Orders via API</th>
                <th align="left">Last Used</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.username} <br /><small>{u.email}</small></td>
                  <td><code>{u.apiKeyMasked}</code></td>
                  <td>{u.apiAccessEnabled ? "Enabled" : "Disabled"}</td>
                  <td>{u.orderCount}</td>
                  <td>{u.lastUsed ? new Date(u.lastUsed).toLocaleString() : "Never"}</td>
                  <td>
                    <button onClick={() => toggleUser(u._id, !u.apiAccessEnabled)}>
                      {u.apiAccessEnabled ? "Disable" : "Enable"}
                    </button>{" "}
                    <button onClick={() => regenerateKey(u._id)}>Regenerate</button>{" "}
                    <button onClick={() => revokeKey(u._id)}>Revoke</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} align="center">No API users found</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <button disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)}>Prev</button>
            <span style={{ margin: "0 8px" }}>Page {userPage} / {userPages}</span>
            <button disabled={userPage >= userPages} onClick={() => setUserPage((p) => p + 1)}>Next</button>
          </div>
        </section>

        {/* ===== Usage Analytics ===== */}
        <section className="card" style={{ marginBottom: 24 }}>
          <h2>Usage Analytics (last 14 days)</h2>

          <h4>By Action</h4>
          <table cellPadding={8}>
            <thead>
              <tr><th align="left">Action</th><th align="left">Success</th><th align="left">Errors</th></tr>
            </thead>
            <tbody>
              {usage.byAction.map((a) => (
                <tr key={a.action}>
                  <td>{a.action}</td>
                  <td style={{ color: "green" }}>{a.success}</td>
                  <td style={{ color: "red" }}>{a.error}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: 16 }}>Daily Calls</h4>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
            {usage.timeSeries.map((d) => {
              const max = Math.max(...usage.timeSeries.map((x) => x.total), 1);
              return (
                <div key={d.date} title={`${d.date}: ${d.total} calls, ${d.errors} errors`}
                  style={{
                    width: 20,
                    height: `${(d.total / max) * 100}px`,
                    background: "#4f46e5",
                    position: "relative",
                  }}
                >
                  {d.errors > 0 && (
                    <div style={{
                      width: "100%",
                      height: `${(d.errors / d.total) * 100}%`,
                      background: "#dc2626",
                      position: "absolute",
                      bottom: 0,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Leaderboard ===== */}
        <section className="card" style={{ marginBottom: 24 }}>
          <h2>Top API Users (by orders placed)</h2>
          <table width="100%" cellPadding={8}>
            <thead>
              <tr><th align="left">#</th><th align="left">User</th><th align="left">Orders</th></tr>
            </thead>
            <tbody>
              {leaderboard.map((l, i) => (
                <tr key={l.userId}>
                  <td>{i + 1}</td>
                  <td>{l.username} <small>({l.email})</small></td>
                  <td>{l.orderCount}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={3} align="center">No API orders yet</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* ===== Request / Error Log ===== */}
        <section className="card" style={{ marginBottom: 24 }}>
          <h2>Request Log</h2>
          <table width="100%" cellPadding={8}>
            <thead>
              <tr>
                <th align="left">Time</th>
                <th align="left">User</th>
                <th align="left">Key</th>
                <th align="left">Action</th>
                <th align="left">Status</th>
                <th align="left">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.user ? `${l.user.username}` : "Unknown"}</td>
                  <td><code>{l.apiKeyMasked}</code></td>
                  <td>{l.action}</td>
                  <td style={{ color: l.success ? "green" : "red" }}>
                    {l.success ? "OK" : "Error"}
                  </td>
                  <td>{l.errorMessage || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <button disabled={logPage <= 1} onClick={() => setLogPage((p) => p - 1)}>Prev</button>
            <span style={{ margin: "0 8px" }}>Page {logPage} / {logPages}</span>
            <button disabled={logPage >= logPages} onClick={() => setLogPage((p) => p + 1)}>Next</button>
          </div>
        </section>

        {/* ===== Docs Reference ===== */}
        <section className="card">
          <h2 onClick={() => setShowDocs((s) => !s)} style={{ cursor: "pointer" }}>
            API Documentation Reference {showDocs ? "▲" : "▼"}
          </h2>
          {showDocs && (
            <iframe
              title="API Docs"
              src="/api-docs"
              style={{ width: "100%", height: 600, border: "1px solid #ddd", marginTop: 12 }}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminApi;
