import { MODE_ICONS, MODE_COLORS } from "./constants";

export default function OwnGatewaysTab({ ownGateways, onEdit, onRotateToken, onDelete, getWebhookUrl }) {
  return (
    <div className="space-y-3">
      {ownGateways.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white border border-dashed border-gray-200">
          <p className="text-sm mb-1 text-gray-500">No gateways yet</p>
          <p className="text-xs text-gray-400">
            Add your own or connect a platform gateway from the Platform Gateways tab
          </p>
        </div>
      )}

      {ownGateways.map((gw) => {
        const Icon = MODE_ICONS[gw.paymentMode] || MODE_ICONS.hosted;
        const iconColor = MODE_COLORS[gw.paymentMode] || "#6b7280";
        return (
          <div key={gw._id} className="rounded-2xl p-5 space-y-3 bg-white border border-gray-200 shadow-sm">

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Icon className="text-2xl mt-0.5" style={{ color: iconColor }} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{gw.name}</p>
                    {gw.isPlatformConnected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                        Platform
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      gw.isVisible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {gw.isVisible ? "Visible" : "Hidden"}
                    </span>
                    {gw.supportsWithdraw && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">
                        Withdraw
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 text-gray-500">
                    {gw.paymentMode} · {gw.processingCurrency} · Rate: {gw.exchangeRate}
                    {gw.depositFeeType !== "none" && ` · Deposit fee: ${gw.depositFeeType}`}
                    {gw.supportsWithdraw && gw.withdrawalFeeType !== "none" && ` · Withdraw fee: ${gw.withdrawalFeeType}`}
                    {gw.supportsWithdraw && ` · Min withdraw: $${gw.minWithdraw}`}
                  </p>
                  {gw.adminNote && (
                    <p className="text-xs mt-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                      ℹ️ {gw.adminNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onEdit(gw)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Edit
                </button>
                <button onClick={() => onRotateToken(gw)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100">
                  🔄 Webhook
                </button>
                <button onClick={() => onDelete(gw._id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100">
                  Del
                </button>
              </div>
            </div>

            {gw.webhookToken && !gw.isPlatformConnected && (
              <div>
                <p className="text-xs mb-1 text-gray-400">
                  Webhook URL — paste in your provider dashboard:
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                  <code className="text-xs flex-1 truncate text-green-600">
                    {getWebhookUrl(gw)}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(getWebhookUrl(gw)); }}
                    className="text-xs px-2 py-1 rounded-md flex-shrink-0 bg-gray-200 text-gray-600 hover:bg-gray-300">
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
