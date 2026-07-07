import { Modal, Input, Select, Toggle } from "./FormControls";
import { PROVIDER_TYPES, FIELD_LABELS } from "./constants";

export default function ProviderFormModal({ providerForm, setProviderForm, editingProvider, loading, onSave, onClose }) {
  const selectedProviderType = PROVIDER_TYPES.find((p) => p.value === providerForm.providerType);

  return (
    <Modal title={editingProvider ? "Edit Provider" : "Add Provider"} onClose={onClose}>
      <Input label="Provider Name" value={providerForm.name}
        onChange={(v) => setProviderForm({ ...providerForm, name: v })}
        placeholder="e.g. Main Flutterwave Account" />

      <Select label="Provider Type" value={providerForm.providerType}
        onChange={(v) => setProviderForm({ ...providerForm, providerType: v, credentials: {} })}
        options={PROVIDER_TYPES} />

      <Toggle label="Active"
        sublabel="Inactive providers cannot process payments"
        checked={providerForm.isActive}
        onChange={(v) => setProviderForm({ ...providerForm, isActive: v })} />

      <Toggle
        label="Visible to child panel owners"
        sublabel="CP owners can select this provider when creating their own gateways"
        checked={providerForm.visibleToCp}
        onChange={(v) => setProviderForm({ ...providerForm, visibleToCp: v })}
      />

      {selectedProviderType && selectedProviderType.fields.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1">
            {editingProvider ? "API Credentials (leave blank to keep existing)" : "API Credentials"}
          </p>
          {selectedProviderType.fields.map((key) => (
            <Input key={key} label={FIELD_LABELS[key] || key} type="password"
              value={providerForm.credentials[key] || ""}
              onChange={(v) => setProviderForm({
                ...providerForm,
                credentials: { ...providerForm.credentials, [key]: v }
              })}
              placeholder={editingProvider ? "••••••••" : `Enter ${FIELD_LABELS[key]}`} />
          ))}
        </div>
      )}

      <button onClick={onSave} disabled={loading}
        className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
        {loading ? "Saving..." : editingProvider ? "Update Provider" : "Create Provider"}
      </button>
    </Modal>
  );
}
