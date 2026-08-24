import { useState } from "react";

export default function ProviderTypeFormModal({ providerType, loading, onSave, onClose }) {
  const editing = !!providerType.ownProvider;
  const [name, setName] = useState(providerType.ownProvider?.name || providerType.label);
  const [isActive, setIsActive] = useState(providerType.ownProvider?.isActive ?? true);
  const [credentials, setCredentials] = useState({});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4 bg-white border border-gray-200 shadow-xl">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">
            {editing ? "Edit" : "Configure"} {providerType.label}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400"
            placeholder="e.g. My Paystack Account" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        {providerType.credentialFields.length > 0 && (
          <div className="space-y-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-black text-gray-600 uppercase tracking-wider">
              {editing ? "API Credentials (leave blank to keep existing)" : "API Credentials"}
            </p>
            {providerType.credentialFields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-500">{f.label}</label>
                <input type={f.type || "text"} value={credentials[f.key] || ""}
                  onChange={(e) => setCredentials({ ...credentials, [f.key]: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400"
                  placeholder={editing ? "••••••••" : f.label} />
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          These are your own credentials — payments and payouts on gateways using this provider go straight to your account.
        </p>

        <button onClick={() => onSave({ name, isActive, credentials })} disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition hover:bg-orange-600 bg-orange-500">
          {loading ? "Saving..." : editing ? "Update Provider" : "Save Provider"}
        </button>
      </div>
    </div>
  );
}
