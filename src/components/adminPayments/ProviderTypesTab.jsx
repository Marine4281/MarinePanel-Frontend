export default function ProviderTypesTab({ providerTypes, onToggleVisibility, onConfigure }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Provider Type", "Your Instance", "CP Visible", "Configured", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {providerTypes.map((t) => (
              <tr key={t.providerType} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-semibold text-gray-800">{t.label}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    t.adminProvider?.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {t.adminProvider?.isActive ? "Active" : "Not set up"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleVisibility(t.providerType, !t.visibleToCp)}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${
                      t.visibleToCp ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}>
                    {t.visibleToCp ? "Yes — click to hide" : "No — click to show"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    t.adminProvider?.hasCredentials ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                  }`}>
                    {t.adminProvider?.hasCredentials ? "✓ Configured" : "⚠ Not configured"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onConfigure(t)}
                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">
                    {t.adminProvider ? "Edit" : "Configure"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 px-4 py-3 border-t">
        "CP Visible" lets child panel owners configure their own credentials for this provider type.
        "Your Instance" below is optional — only set it up if you also want to share your own credentials as a platform gateway.
      </p>
    </div>
  );
}
