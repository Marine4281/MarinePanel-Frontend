import { useState } from "react";
import { Modal, Input, Toggle } from "./FormControls";

export default function ProviderTypeFormModal({ providerType, loading, onSave, onClose }) {
  const editing = !!providerType.adminProvider;
  const [name, setName] = useState(providerType.adminProvider?.name || providerType.label);
  const [isActive, setIsActive] = useState(providerType.adminProvider?.isActive ?? true);
  const [visibleToCp, setVisibleToCp] = useState(providerType.adminProvider?.visibleToCp || false);
  const [credentials, setCredentials] = useState({});

  return (
    <Modal title={`${editing ? "Edit" : "Configure"} ${providerType.label}`} onClose={onClose}>
      <Input label="Display Name" value={name} onChange={setName} placeholder="e.g. Main Paystack Account" />

      <Toggle label="Active" sublabel="Inactive providers cannot process payments"
        checked={isActive} onChange={setIsActive} />

      <Toggle
        label="Share with child panel owners"
        sublabel="CP owners can route payments through YOUR credentials for this provider (separate from letting them configure their own)"
        checked={visibleToCp}
        onChange={setVisibleToCp}
      />

      {providerType.credentialFields.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1">
            {editing ? "API Credentials (leave blank to keep existing)" : "API Credentials"}
          </p>
          {providerType.credentialFields.map((f) => (
            <Input key={f.key} label={f.label} type={f.type || "text"}
              value={credentials[f.key] || ""}
              onChange={(v) => setCredentials({ ...credentials, [f.key]: v })}
              placeholder={editing ? "••••••••" : f.label} />
          ))}
        </div>
      )}

      <button
        onClick={() => onSave({ name, isActive, visibleToCp, credentials })}
        disabled={loading}
        className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
        {loading ? "Saving..." : editing ? "Update Provider" : "Save Provider"}
      </button>
    </Modal>
  );
}
