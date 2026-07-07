import { F, I } from "./FormControls";
import { PAYMENT_MODES, MANUAL_TYPES } from "./constants";

export default function GatewayFormModal({ form, setForm, editing, loading, availProviders, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4 bg-white border border-gray-200 shadow-xl">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">
            {editing ? "Edit Gateway" : "Add Gateway"}
          </h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <F label="Gateway Name (shown to users)">
          <I value={form.name} onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Pay with M-Pesa" />
        </F>

        <F label="Description (optional)">
          <I value={form.description} onChange={(v) => setForm({ ...form, description: v })}
            placeholder="e.g. Pay using your M-Pesa wallet" />
        </F>

        <F label="Payment Mode">
          <select value={form.paymentMode}
            onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
            {PAYMENT_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </F>

        {!["binance", "manual"].includes(form.paymentMode) && (
          <F label="Provider">
            {availProviders.length === 0 ? (
              <p className="text-xs px-3 py-2 rounded-xl bg-yellow-50 text-yellow-700">
                ⚠ No providers available. Ask your admin to enable providers for CP owners.
              </p>
            ) : (
              <select value={form.providerProfile}
                onChange={(e) => setForm({ ...form, providerProfile: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
                <option value="">Select provider</option>
                {availProviders.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.providerType})
                  </option>
                ))}
              </select>
            )}
          </F>
        )}

        {/* Binance */}
        {form.paymentMode === "binance" && (
          <div className="space-y-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
            <F label="Your Binance ID (shown to user)">
              <I value={form.binanceId} onChange={(v) => setForm({ ...form, binanceId: v })}
                placeholder="e.g. 123456789" />
            </F>
            <F label="Name shown during transfer (optional)">
              <I value={form.binanceName} onChange={(v) => setForm({ ...form, binanceName: v })}
                placeholder="e.g. John Doe" />
            </F>
            <F label="QR Code Image URL">
              <I value={form.qrImageUrl} onChange={(v) => setForm({ ...form, qrImageUrl: v })}
                placeholder="https://..." />
            </F>
            {form.qrImageUrl && (
              <img src={form.qrImageUrl} alt="QR preview" className="w-24 h-24 rounded-lg border object-contain" />
            )}
          </div>
        )}

        {/* Manual */}
        {form.paymentMode === "manual" && (
          <div className="space-y-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <F label="Manual Type">
              <select value={form.manualType}
                onChange={(e) => setForm({ ...form, manualType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
                <option value="">Select...</option>
                {MANUAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </F>

            {["mpesa","momo","airtel","other"].includes(form.manualType) && (
              <>
                <F label="Number to send money to">
                  <I value={form.manualConfig.number}
                    onChange={(v) => setForm({ ...form, manualConfig: { ...form.manualConfig, number: v } })}
                    placeholder="e.g. 0712345678" />
                </F>
                <F label="Name shown during send money (optional)">
                  <I value={form.manualConfig.holderName}
                    onChange={(v) => setForm({ ...form, manualConfig: { ...form.manualConfig, holderName: v } })}
                    placeholder="e.g. John Doe" />
                </F>
              </>
            )}

            {form.manualType === "bank" && (
              <>
                <F label="Bank Name">
                  <I value={form.manualConfig.bankName}
                    onChange={(v) => setForm({ ...form, manualConfig: { ...form.manualConfig, bankName: v } })}
                    placeholder="e.g. Equity Bank" />
                </F>
                <F label="Account Number">
                  <I value={form.manualConfig.accountNumber}
                    onChange={(v) => setForm({ ...form, manualConfig: { ...form.manualConfig, accountNumber: v } })}
                    placeholder="e.g. 0123456789" />
                </F>
                <F label="Account Name (optional)">
                  <I value={form.manualConfig.accountName}
                    onChange={(v) => setForm({ ...form, manualConfig: { ...form.manualConfig, accountName: v } })}
                    placeholder="e.g. MarinePanel Ltd" />
                </F>
              </>
            )}

            <F label="Description / Instructions (shown to user)">
              <textarea value={form.paymentInstructions} rows={3}
                onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
                placeholder="e.g. Go to M-Pesa, Send Money, then enter the code you receive below."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-white border border-gray-300 text-gray-900 focus:border-orange-400" />
            </F>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <F label="Currency">
            <I value={form.processingCurrency}
              onChange={(v) => setForm({ ...form, processingCurrency: v.toUpperCase() })}
              placeholder="KES" />
          </F>
          <F label="Symbol">
            <I value={form.processingCurrencySymbol}
              onChange={(v) => setForm({ ...form, processingCurrencySymbol: v })}
              placeholder="Ksh" />
          </F>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <F label="Exchange Rate (1 USD = ?)">
            <I type="number" value={form.exchangeRate}
              onChange={(v) => setForm({ ...form, exchangeRate: Number(v) })} placeholder="129" />
          </F>
          <F label="Min Deposit (USD)">
            <I type="number" value={form.minDeposit}
              onChange={(v) => setForm({ ...form, minDeposit: Number(v) })} placeholder="1" />
          </F>
        </div>

        <F label="Fee Type">
          <select value={form.feeType}
            onChange={(e) => setForm({ ...form, feeType: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400">
            <option value="none">No Fee</option>
            <option value="fixed">Fixed Fee</option>
            <option value="percentage">Percentage</option>
            <option value="both">Fixed + Percentage</option>
          </select>
        </F>

        {(form.feeType === "percentage" || form.feeType === "both") && (
          <F label="Fee %">
            <I type="number" value={form.feePercentage}
              onChange={(v) => setForm({ ...form, feePercentage: Number(v) })} placeholder="2.5" />
          </F>
        )}
        {(form.feeType === "fixed" || form.feeType === "both") && (
          <F label={`Fixed Fee (${form.processingCurrency})`}>
            <I type="number" value={form.feeFixed}
              onChange={(v) => setForm({ ...form, feeFixed: Number(v) })} placeholder="50" />
          </F>
        )}

        <F label="Note for your users (optional)">
          <textarea value={form.cpNote} rows={2}
            onChange={(e) => setForm({ ...form, cpNote: e.target.value })}
            placeholder="e.g. Use your registered M-Pesa number only"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none bg-white border border-gray-300 text-gray-900 focus:border-orange-400" />
        </F>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-900">Visible to users</p>
            <p className="text-xs mt-0.5 text-gray-500">Users can see and use this gateway</p>
          </div>
          <button onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.isVisible ? "bg-orange-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isVisible ? "left-5" : "left-0.5"}`} />
          </button>
        </div>

        <button onClick={onSave} disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition hover:bg-orange-600 bg-orange-500">
          {loading ? "Saving..." : editing ? "Update Gateway" : "Create Gateway"}
        </button>
      </div>
    </div>
  );
                }
