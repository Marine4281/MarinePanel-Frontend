// src/pages/AdminMaintenance.jsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api/axios";

const AFFECTS_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "cp_and_users", label: "Child Panels & Their Users Only" },
  { value: "resellers_and_users", label: "Resellers & Their Users Only" },
  { value: "platform_users", label: "Platform Users Only" },
];

const EXEMPT_ROLE_OPTIONS = [
  { value: "cpOwner", label: "Child Panel Owners" },
  { value: "reseller", label: "Resellers" },
  { value: "user", label: "Regular Users" },
];

const defaultMode = {
  enabled: false,
  title: "We're Under Maintenance",
  message: "Our platform is currently undergoing scheduled maintenance. We'll be back shortly!",
  affects: "everyone",
  exempt: [],
  exemptRoles: [],
};

const defaultNoOrders = {
  enabled: false,
  message: "Order placement is temporarily disabled. Please check back later.",
  affects: "everyone",
  exempt: [],
  exemptRoles: [],
};

export default function AdminMaintenance() {
  const [totalShutdown, setTotalShutdown] = useState(defaultMode);
  const [noOrders, setNoOrders] = useState(defaultNoOrders);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [tsExemptInput, setTsExemptInput] = useState("");
  const [noExemptInput, setNoExemptInput] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/admin/settings/maintenance");
        if (data.totalShutdown) setTotalShutdown({ ...defaultMode, ...data.totalShutdown });
        if (data.noOrders) setNoOrders({ ...defaultNoOrders, ...data.noOrders });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.put("/admin/settings/maintenance", {
        totalShutdown,
        noOrders,
      });
      showToast("Maintenance settings saved successfully");
    } catch (err) {
      console.error(err);
      showToast("Failed to save maintenance settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const addExemptEmail = (mode, setMode, input, setInput) => {
    const email = input.trim().toLowerCase();
    if (!email || mode.exempt.includes(email)) return;
    setMode((prev) => ({ ...prev, exempt: [...prev.exempt, email] }));
    setInput("");
  };

  const removeExemptEmail = (mode, setMode, email) => {
    setMode((prev) => ({
      ...prev,
      exempt: prev.exempt.filter((e) => e !== email),
    }));
  };

  const toggleExemptRole = (mode, setMode, role) => {
    setMode((prev) => ({
      ...prev,
      exemptRoles: prev.exemptRoles.includes(role)
        ? prev.exemptRoles.filter((r) => r !== role)
        : [...prev.exemptRoles, role],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all
              ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}
          >
            {toast.msg}
          </div>
        )}

        <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maintenance Mode</h1>
              <p className="text-gray-500 text-sm mt-1">
                Control platform availability and order restrictions.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                         text-white font-semibold rounded-xl transition text-sm"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" />
                  Save All
                </>
              )}
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex gap-3 flex-wrap">
            <StatusPill
              label="Total Shutdown"
              active={totalShutdown.enabled}
              icon="fa-solid fa-power-off"
            />
            <StatusPill
              label="No Orders"
              active={noOrders.enabled}
              icon="fa-solid fa-ban"
            />
          </div>

          {/* ── TOTAL SHUTDOWN CARD ─────────────────── */}
          <ModeCard
            title="Total Shutdown"
            subtitle="Replaces login/landing page with a maintenance screen for affected users."
            icon="fa-solid fa-power-off"
            iconColor="text-red-500"
            enabled={totalShutdown.enabled}
            onToggle={() =>
              setTotalShutdown((p) => ({ ...p, enabled: !p.enabled }))
            }
          >
            <div className="space-y-4 mt-4">
              <Field label="Maintenance Page Title">
                <input
                  type="text"
                  value={totalShutdown.title}
                  onChange={(e) =>
                    setTotalShutdown((p) => ({ ...p, title: e.target.value }))
                  }
                  className="input-field"
                  placeholder="We're Under Maintenance"
                />
              </Field>

              <Field label="Message shown to users">
                <textarea
                  rows={3}
                  value={totalShutdown.message}
                  onChange={(e) =>
                    setTotalShutdown((p) => ({ ...p, message: e.target.value }))
                  }
                  className="input-field resize-none"
                  placeholder="We'll be back shortly…"
                />
              </Field>

              <Field label="Who is affected">
                <select
                  value={totalShutdown.affects}
                  onChange={(e) =>
                    setTotalShutdown((p) => ({ ...p, affects: e.target.value }))
                  }
                  className="input-field"
                >
                  {AFFECTS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Exempt Roles (not affected)">
                <div className="flex flex-wrap gap-2">
                  {EXEMPT_ROLE_OPTIONS.map((r) => (
                    <RoleChip
                      key={r.value}
                      label={r.label}
                      active={totalShutdown.exemptRoles.includes(r.value)}
                      onClick={() => toggleExemptRole(totalShutdown, setTotalShutdown, r.value)}
                    />
                  ))}
                </div>
              </Field>

              <Field label="Exempt Emails (specific accounts not affected)">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={tsExemptInput}
                    onChange={(e) => setTsExemptInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addExemptEmail(totalShutdown, setTotalShutdown, tsExemptInput, setTsExemptInput)
                    }
                    className="input-field flex-1"
                    placeholder="email@example.com"
                  />
                  <button
                    onClick={() =>
                      addExemptEmail(totalShutdown, setTotalShutdown, tsExemptInput, setTsExemptInput)
                    }
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {totalShutdown.exempt.map((email) => (
                    <EmailTag
                      key={email}
                      email={email}
                      onRemove={() => removeExemptEmail(totalShutdown, setTotalShutdown, email)}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </ModeCard>

          {/* ── NO ORDERS CARD ───────────────────────── */}
          <ModeCard
            title="No Orders Mode"
            subtitle="Users can still log in and browse, but cannot place new orders."
            icon="fa-solid fa-ban"
            iconColor="text-amber-500"
            enabled={noOrders.enabled}
            onToggle={() =>
              setNoOrders((p) => ({ ...p, enabled: !p.enabled }))
            }
          >
            <div className="space-y-4 mt-4">
              <Field label="Message shown when user tries to order">
                <textarea
                  rows={3}
                  value={noOrders.message}
                  onChange={(e) =>
                    setNoOrders((p) => ({ ...p, message: e.target.value }))
                  }
                  className="input-field resize-none"
                  placeholder="Order placement is temporarily disabled…"
                />
              </Field>

              <Field label="Who is affected">
                <select
                  value={noOrders.affects}
                  onChange={(e) =>
                    setNoOrders((p) => ({ ...p, affects: e.target.value }))
                  }
                  className="input-field"
                >
                  {AFFECTS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Exempt Roles (can still order)">
                <div className="flex flex-wrap gap-2">
                  {EXEMPT_ROLE_OPTIONS.map((r) => (
                    <RoleChip
                      key={r.value}
                      label={r.label}
                      active={noOrders.exemptRoles.includes(r.value)}
                      onClick={() => toggleExemptRole(noOrders, setNoOrders, r.value)}
                    />
                  ))}
                </div>
              </Field>

              <Field label="Exempt Emails (can still order)">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={noExemptInput}
                    onChange={(e) => setNoExemptInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addExemptEmail(noOrders, setNoOrders, noExemptInput, setNoExemptInput)
                    }
                    className="input-field flex-1"
                    placeholder="email@example.com"
                  />
                  <button
                    onClick={() =>
                      addExemptEmail(noOrders, setNoOrders, noExemptInput, setNoExemptInput)
                    }
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {noOrders.exempt.map((email) => (
                    <EmailTag
                      key={email}
                      email={email}
                      onRemove={() => removeExemptEmail(noOrders, setNoOrders, email)}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </ModeCard>
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #111827;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: #f97316;
        }
        .input-field option {
          background: #ffffff;
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatusPill({ label, active, icon }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold
        ${active ? "bg-red-100 text-red-700 border border-red-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
    >
      <i className={icon} />
      {label}: {active ? "ACTIVE" : "OFF"}
    </div>
  );
}

function ModeCard({ title, subtitle, icon, iconColor, enabled, onToggle, children }) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-all duration-200
        ${enabled ? "border-orange-300" : "border-gray-200"}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 text-xl ${iconColor}`}>
              <i className={icon} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
            </div>
          </div>
          {/* Toggle */}
          <button
            onClick={onToggle}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200
              ${enabled ? "bg-orange-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${enabled ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* Expanded config */}
        {enabled && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function RoleChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
        ${active
          ? "bg-orange-50 border-orange-400 text-orange-700"
          : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
        }`}
    >
      {active && <i className="fa-solid fa-check mr-1.5 text-orange-500" />}
      {label}
    </button>
  );
}

function EmailTag({ email, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700">
      {email}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition">
        <i className="fa-solid fa-xmark" />
      </button>
    </span>
  );
                  }
