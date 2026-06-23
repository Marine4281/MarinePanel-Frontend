// src/components/admin/childpanel/settings/CPFeesTab.jsx

import CPTiersBuilder   from "./CPTiersBuilder";
import CPIntervalPicker from "./CPIntervalPicker";

const FEE_FIELDS = [
  { key: "activationFee", label: "Activation Fee ($)" },
  { key: "monthlyFee",    label: "Flat Monthly Fee ($)" },
  { key: "perOrderFee",   label: "Per-Order Fee ($)" },
  { key: "withdrawMin",   label: "Min Withdrawal ($)" },
  { key: "minDeposit",    label: "Min Deposit ($)" },
];

const GRACE_OPTIONS = [
  { value: 0,   label: "No grace — suspend immediately" },
  { value: 12,  label: "12 hours" },
  { value: 24,  label: "1 day" },
  { value: 48,  label: "2 days" },
  { value: 72,  label: "3 days" },
  { value: 168, label: "7 days" },
];

const REMINDER_OPTIONS = [
  { value: 0,   label: "No reminder" },
  { value: 24,  label: "1 day before due" },
  { value: 48,  label: "2 days before due" },
  { value: 72,  label: "3 days before due" },
  { value: 168, label: "7 days before due" },
];

export default function CPFeesTab({
  settings,
  tiers,
  saving,
  onSettingsChange,
  onTiersChange,
  onSave,
}) {
  const autoDeduct = settings.autoDeduct ?? true;

  return (
    <div className="space-y-5">

      {/* ── Basic fee fields ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEE_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            <input
              type="number" min="0" step="0.01"
              value={settings[key] ?? 0}
              onChange={(e) => onSettingsChange({ [key]: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        {/* Billing mode */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Default Billing Mode</label>
          <select
            value={settings.billingMode}
            onChange={(e) => onSettingsChange({ billingMode: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="per_order">Per Order</option>
            <option value="both">Both</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* ── Global billing interval ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <CPIntervalPicker
          label="Global Billing Interval (default for all panels)"
          helpText="Sets how many days between each billing cycle. Individual panels can override this."
          value={settings.billingIntervalDays ?? 30}
          onChange={(v) => onSettingsChange({ billingIntervalDays: v })}
        />
      </div>

      {/* ── Suspension & Reminder ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b">
          <h4 className="text-xs font-semibold text-gray-700">Suspension &amp; Reminder Defaults</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Apply to all panels unless overridden individually.
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grace period */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Grace period after due date
              </label>
              <select
                value={settings.gracePeriodHours ?? 0}
                onChange={(e) => onSettingsChange({ gracePeriodHours: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {GRACE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                How long after due date before the CP is suspended.
              </p>
            </div>

            {/* Reminder window */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Reminder window before due date
              </label>
              <select
                value={settings.reminderHours ?? 48}
                onChange={(e) => onSettingsChange({ reminderHours: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {REMINDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                When to start showing the billing warning to the CP owner.
              </p>
            </div>
          </div>

          {/* Auto-deduct toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Auto-deduct fee from CP wallet</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Cron deducts the fee automatically on the due date if wallet balance is sufficient.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSettingsChange({ autoDeduct: !autoDeduct })}
              className={`relative inline-flex h-6 w-11 shrink-0 ml-4 items-center rounded-full transition-colors ${
                autoDeduct ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                autoDeduct ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Reseller Activation — Platform Anti-Abuse Fee ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b">
          <h4 className="text-xs font-semibold text-gray-700">
            Reseller Activation — Platform Fee
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Silently charged to the CP owner's wallet whenever one of their
            end-users activates a reseller panel. Separate from the CP's own
            activation fee above — the reseller never sees this charge.
            Acts as a throttle against misuse. Individual panels can override
            this from their own details page.
          </p>
        </div>

        <div className="p-4">
          <label className="text-xs text-gray-500 mb-1 block">Platform Fee ($)</label>
          <input
            type="number" min="0" step="0.01"
            value={settings.platformResellerActivationFee ?? 5}
            onChange={(e) => onSettingsChange({ platformResellerActivationFee: e.target.value })}
            className="w-full sm:w-1/2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* ── Tiered billing ── */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
          Tiered Monthly Billing
          <span className="font-normal text-gray-400 ml-1">(overrides flat fee when set)</span>
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          Define order-count ranges with a monthly fee per range.
          e.g. 0–100 orders = $0, 101–500 = $2, 501+ = $5
        </p>
        <CPTiersBuilder tiers={tiers} onChange={onTiersChange} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave} disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

    </div>
  );
          }
