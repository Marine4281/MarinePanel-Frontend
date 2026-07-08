import { Modal, Input, Select, Toggle } from "./FormControls";
import { PAYMENT_MODES, MANUAL_TYPES, FEE_TYPE_OPTIONS } from "./constants";

export default function GatewayFormModal({ gatewayForm, setGatewayForm, editingGateway, loading, providerOptions, onSave, onClose }) {
  return (
    <Modal title={editingGateway ? "Edit Gateway" : "Add Gateway"} onClose={onClose}>
      <Input label="Gateway Name (user-facing)"
        value={gatewayForm.name}
        onChange={(v) => setGatewayForm({ ...gatewayForm, name: v })}
        placeholder="e.g. Pay with M-Pesa" />

      <Input label="Description (shown to end user)"
        value={gatewayForm.description}
        onChange={(v) => setGatewayForm({ ...gatewayForm, description: v })}
        placeholder="e.g. Pay using your M-Pesa mobile wallet" />

      <Select label="Payment Mode (determines user fields)"
        value={gatewayForm.paymentMode}
        onChange={(v) => setGatewayForm({ ...gatewayForm, paymentMode: v })}
        options={PAYMENT_MODES} />

      {!["binance","manual"].includes(gatewayForm.paymentMode) && (
        <Select label="Provider (processes this gateway)"
          value={gatewayForm.providerProfile}
          onChange={(v) => setGatewayForm({ ...gatewayForm, providerProfile: v })}
          options={providerOptions} />
      )}

      {/* Binance */}
      {gatewayForm.paymentMode === "binance" && (
        <div className="space-y-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
          <Input label="Your Binance ID (shown to user)"
            value={gatewayForm.binanceId}
            onChange={(v) => setGatewayForm({ ...gatewayForm, binanceId: v })}
            placeholder="e.g. 123456789" />
          <Input label="Name shown during transfer (optional)"
            value={gatewayForm.binanceName}
            onChange={(v) => setGatewayForm({ ...gatewayForm, binanceName: v })}
            placeholder="e.g. John Doe" />
          <Input label="QR Code Image URL"
            value={gatewayForm.qrImageUrl}
            onChange={(v) => setGatewayForm({ ...gatewayForm, qrImageUrl: v })}
            placeholder="https://..." />
          {gatewayForm.qrImageUrl && (
            <img src={gatewayForm.qrImageUrl} alt="QR preview" className="w-24 h-24 rounded-lg border object-contain" />
          )}
        </div>
      )}

      {/* Manual */}
      {gatewayForm.paymentMode === "manual" && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <Select label="Manual Type" value={gatewayForm.manualType}
            onChange={(v) => setGatewayForm({ ...gatewayForm, manualType: v })}
            options={MANUAL_TYPES} />

          {["mpesa","momo","airtel","other"].includes(gatewayForm.manualType) && (
            <>
              <Input label="Number to send money to"
                value={gatewayForm.manualConfig.number}
                onChange={(v) => setGatewayForm({ ...gatewayForm, manualConfig: { ...gatewayForm.manualConfig, number: v } })}
                placeholder="e.g. 0712345678" />
              <Input label="Name shown during send money (optional)"
                value={gatewayForm.manualConfig.holderName}
                onChange={(v) => setGatewayForm({ ...gatewayForm, manualConfig: { ...gatewayForm.manualConfig, holderName: v } })}
                placeholder="e.g. John Doe" />
            </>
          )}

          {gatewayForm.manualType === "bank" && (
            <>
              <Input label="Bank Name"
                value={gatewayForm.manualConfig.bankName}
                onChange={(v) => setGatewayForm({ ...gatewayForm, manualConfig: { ...gatewayForm.manualConfig, bankName: v } })}
                placeholder="e.g. Equity Bank" />
              <Input label="Account Number"
                value={gatewayForm.manualConfig.accountNumber}
                onChange={(v) => setGatewayForm({ ...gatewayForm, manualConfig: { ...gatewayForm.manualConfig, accountNumber: v } })}
                placeholder="e.g. 0123456789" />
              <Input label="Account Name (optional)"
                value={gatewayForm.manualConfig.accountName}
                onChange={(v) => setGatewayForm({ ...gatewayForm, manualConfig: { ...gatewayForm.manualConfig, accountName: v } })}
                placeholder="e.g. MarinePanel Ltd" />
            </>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Description / Instructions (shown to user)
            </label>
            <textarea value={gatewayForm.paymentInstructions} rows={3}
              onChange={(e) => setGatewayForm({ ...gatewayForm, paymentInstructions: e.target.value })}
              placeholder="e.g. Go to M-Pesa, Send Money, then enter the code you receive below."
              className="w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 resize-none" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input label="Processing Currency" value={gatewayForm.processingCurrency}
          onChange={(v) => setGatewayForm({ ...gatewayForm, processingCurrency: v.toUpperCase() })}
          placeholder="KES" />
        <Input label="Currency Symbol" value={gatewayForm.processingCurrencySymbol}
          onChange={(v) => setGatewayForm({ ...gatewayForm, processingCurrencySymbol: v })}
          placeholder="Ksh" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Exchange Rate (1 USD = ?)" type="number"
          value={gatewayForm.exchangeRate}
          onChange={(v) => setGatewayForm({ ...gatewayForm, exchangeRate: Number(v) })}
          placeholder="129" />
        <Input label="Min Deposit (USD)" type="number"
          value={gatewayForm.minDeposit}
          onChange={(v) => setGatewayForm({ ...gatewayForm, minDeposit: Number(v) })}
          placeholder="1" />
      </div>

      {/* ─── DEPOSIT FEE ─── */}
      <div className="space-y-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Deposit Fee</p>

        <Select label="Deposit Fee Type" value={gatewayForm.depositFeeType}
          onChange={(v) => setGatewayForm({ ...gatewayForm, depositFeeType: v })}
          options={FEE_TYPE_OPTIONS} />

        {(gatewayForm.depositFeeType === "percentage" || gatewayForm.depositFeeType === "both") && (
          <Input label="Deposit Fee %" type="number" value={gatewayForm.depositFeePercentage}
            onChange={(v) => setGatewayForm({ ...gatewayForm, depositFeePercentage: Number(v) })} placeholder="2.5" />
        )}
        {(gatewayForm.depositFeeType === "fixed" || gatewayForm.depositFeeType === "both") && (
          <Input label={`Deposit Fixed Fee (${gatewayForm.processingCurrency})`} type="number"
            value={gatewayForm.depositFeeFixed}
            onChange={(v) => setGatewayForm({ ...gatewayForm, depositFeeFixed: Number(v) })} placeholder="50" />
        )}
      </div>

      {/* ─── WITHDRAWAL FEE ─── */}
      <div className="space-y-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Withdrawal Fee</p>

        <Select label="Withdrawal Fee Type" value={gatewayForm.withdrawalFeeType}
          onChange={(v) => setGatewayForm({ ...gatewayForm, withdrawalFeeType: v })}
          options={FEE_TYPE_OPTIONS} />

        {(gatewayForm.withdrawalFeeType === "percentage" || gatewayForm.withdrawalFeeType === "both") && (
          <Input label="Withdrawal Fee %" type="number" value={gatewayForm.withdrawalFeePercentage}
            onChange={(v) => setGatewayForm({ ...gatewayForm, withdrawalFeePercentage: Number(v) })} placeholder="2.5" />
        )}
        {(gatewayForm.withdrawalFeeType === "fixed" || gatewayForm.withdrawalFeeType === "both") && (
          <Input label={`Withdrawal Fixed Fee (${gatewayForm.processingCurrency})`} type="number"
            value={gatewayForm.withdrawalFeeFixed}
            onChange={(v) => setGatewayForm({ ...gatewayForm, withdrawalFeeFixed: Number(v) })} placeholder="50" />
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Admin Note (shown to CP owners)
        </label>
        <textarea value={gatewayForm.adminNote} rows={2}
          onChange={(e) => setGatewayForm({ ...gatewayForm, adminNote: e.target.value })}
          placeholder="Internal note visible to child panel owners only"
          className="w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400 resize-none" />
      </div>

      <div className="space-y-2 pt-1">
        <Toggle label="Visible to end users"
          sublabel="End users can see and use this gateway"
          checked={gatewayForm.isVisible}
          onChange={(v) => setGatewayForm({ ...gatewayForm, isVisible: v })} />

        <Toggle label="Visible to child panel owners"
          sublabel="CP owners can connect and use this gateway on their panels"
          checked={gatewayForm.visibleToCp}
          onChange={(v) => setGatewayForm({ ...gatewayForm, visibleToCp: v })} />

        <Toggle label="Enable for withdrawals"
          sublabel="Users can withdraw wallet funds through this gateway. Automatic payout requires a provider with payout support (M-Pesa, Flutterwave, Binance) — otherwise requests just queue for manual admin approval."
          checked={gatewayForm.supportsWithdraw}
          onChange={(v) => setGatewayForm({ ...gatewayForm, supportsWithdraw: v })} />
      </div>

      {gatewayForm.supportsWithdraw && (
        <Input label="Min Withdraw (USD)" type="number"
          value={gatewayForm.minWithdraw}
          onChange={(v) => setGatewayForm({ ...gatewayForm, minWithdraw: Number(v) })}
          placeholder="5" />
      )}

      <button onClick={onSave} disabled={loading}
        className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
        {loading ? "Saving..." : editingGateway ? "Update Gateway" : "Create Gateway"}
      </button>
    </Modal>
  );
      }
