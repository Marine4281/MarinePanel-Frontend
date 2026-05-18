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

/**
 * Props
 *  settings        object
 *  tiers           array
 *  saving          bool
 *  onSettingsChange fn(patch)
 *  onTiersChange    fn(tiers)
 *  onSave           fn
 */
export default function CPFeesTab({
  settings,
  tiers,
  saving,
  onSettingsChange,
  onTiersChange,
  onSave,
}) {
  return (
    <div className="space-y-6">
      {/* Basic fee fields */}
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

      {/* Global billing interval */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <CPIntervalPicker
          label="Global Billing Interval (default for all panels)"
          helpText="Sets how many days between each billing cycle. Individual panels can override this."
          value={settings.billingIntervalDays ?? 30}
          onChange={(v) => onSettingsChange({ billingIntervalDays: v })}
        />
      </div>

      {/* Tiered billing */}
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
