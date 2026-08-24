export default function ProviderTypesTab({ providerTypes, onConfigure }) {
  return (
    <div className="space-y-3">
      {providerTypes.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
          <p className="text-sm mb-1 text-gray-500">No provider types available yet</p>
          <p className="text-xs text-gray-400">Ask your admin to enable a provider for CP owners</p>
        </div>
      )}

      {providerTypes.map((t) => (
        <div key={t.providerType} className="rounded-2xl p-5 flex items-center justify-between gap-4 bg-white border border-gray-200 shadow-sm">
          <div>
            <p className="font-bold text-gray-900">{t.label}</p>
            <p className="text-xs mt-0.5 text-gray-500">
              {t.ownProvider?.hasCredentials
                ? (t.ownProvider.isActive ? "Configured and active" : "Configured but inactive")
                : "Not configured yet"}
            </p>
          </div>
          <button onClick={() => onConfigure(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 flex-shrink-0">
            {t.ownProvider ? "Edit" : "Configure"}
          </button>
        </div>
      ))}
    </div>
  );
}
