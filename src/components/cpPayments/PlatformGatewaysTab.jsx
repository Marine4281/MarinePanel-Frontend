import { MODE_ICONS } from "./constants";

export default function PlatformGatewaysTab({ platformGateways, isConnected, connecting, onConnect }) {
  return (
    <div className="space-y-3">
      {platformGateways.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No platform gateways available yet</p>
          <p className="text-xs mt-1 text-gray-400">
            Contact your admin to enable platform gateways for your panel
          </p>
        </div>
      )}

      {platformGateways.map((gw) => {
        const connected = isConnected(gw._id);
        return (
          <div key={gw._id} className={`rounded-2xl p-5 border ${
            connected ? "bg-green-50 border-green-200" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{MODE_ICONS[gw.paymentMode] || "💰"}</span>
                <div>
                  <p className="font-bold text-gray-900">{gw.name}</p>
                  <p className="text-xs mt-0.5 text-gray-500">
                    {gw.paymentMode} · {gw.processingCurrency}
                    {gw.depositFeeType !== "none" && ` · Deposit fee: ${gw.depositFeeType}`}
                    {gw.withdrawalFeeType !== "none" && ` · Withdraw fee: ${gw.withdrawalFeeType}`}
                  </p>
                  {gw.description && (
                    <p className="text-xs mt-1 text-gray-400">{gw.description}</p>
                  )}
                  {gw.adminNote && (
                    <p className="text-xs mt-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                      ℹ️ {gw.adminNote}
                    </p>
                  )}
                </div>
              </div>

              {connected ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 bg-green-100 text-green-700">
                  ✓ Connected
                </span>
              ) : (
                <button
                  onClick={() => onConnect(gw._id)}
                  disabled={connecting === gw._id}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 disabled:opacity-50 transition hover:bg-orange-600 bg-orange-500">
                  {connecting === gw._id ? "Connecting..." : "Connect"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-center pt-2 text-gray-400">
        Connecting a platform gateway lets your users pay through it. Payments go through the platform's provider — no setup needed on your end.
      </p>
    </div>
  );
}
