import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

// Which recipient fields to show — automatic gateways are driven by the
// provider adapter (mpesa/flutterwave/binance), manual ones by manualType.
const getPayoutChannel = (selected) =>
  selected.paymentMode === "manual" ? (selected.manualType || "other") : selected.providerType;

const PayoutFields = ({ selected, usdAmount, setUsdAmount, userPayoutData, setField }) => {
  const channel = getPayoutChannel(selected);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
          <input type="number" min="0" step="0.01" placeholder="0.00"
            value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm outline-none focus:border-orange-400 transition" />
        </div>
        {selected.minWithdraw > 0 && (
          <p className="text-xs text-gray-400 mt-1">Min: ${selected.minWithdraw} USD</p>
        )}
      </div>

      {["mpesa", "airtel", "momo"].includes(channel) && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Phone Number to Receive Funds
            </label>
            <PhoneInput
              country="ke"
              value={userPayoutData.phone || ""}
              onChange={(val) => setField("phone", val)}
              preferredCountries={["ke", "ug", "tz", "gh", "ng"]}
              inputClass="!w-full !py-3 !rounded-xl !border-2 !text-sm"
            />
          </div>
          {channel === "momo" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Network
              </label>
              <select value={userPayoutData.network || ""}
                onChange={(e) => setField("network", e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400">
                <option value="">Select network</option>
                <option value="MTN">MTN MoMo</option>
                <option value="Vodafone">Vodafone Cash</option>
                <option value="AirtelTigo">AirtelTigo</option>
                <option value="Moov">Moov</option>
              </select>
            </div>
          )}
        </div>
      )}

      {["bank", "flutterwave"].includes(channel) && (
        <div className="space-y-3">
          <Field label="Bank / Mobile Money Code">
            <input type="text" placeholder="e.g. 044 (bank code) or MPS (mobile money)"
              value={userPayoutData.bankCode || ""}
              onChange={(e) => setField("bankCode", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
          </Field>
          <Field label="Account Number">
            <input type="text" placeholder="e.g. 0123456789"
              value={userPayoutData.accountNumber || ""}
              onChange={(e) => setField("accountNumber", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
          </Field>
          <Field label="Account Name">
            <input type="text" placeholder="Full Name"
              value={userPayoutData.accountName || ""}
              onChange={(e) => setField("accountName", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
          </Field>
        </div>
      )}

      {["crypto", "binance"].includes(channel) && (
        <div className="space-y-3">
          <Field label="Your Wallet Address">
            <input type="text" placeholder="e.g. TRx..."
              value={userPayoutData.walletAddress || ""}
              onChange={(e) => setField("walletAddress", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
          </Field>
          <Field label="Network">
            <select value={userPayoutData.network || ""}
              onChange={(e) => setField("network", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400">
              <option value="">Select network</option>
              <option value="USDT">USDT</option>
              <option value="TRC20">USDT TRC20 (Tron)</option>
              <option value="ERC20">USDT ERC20 (Ethereum)</option>
              <option value="BEP20">USDT BEP20 (BSC)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
            </select>
          </Field>
          <Field label="Memo / Address Tag (if required)">
            <input type="text" placeholder="Optional"
              value={userPayoutData.addressTag || ""}
              onChange={(e) => setField("addressTag", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
          </Field>
        </div>
      )}

      {channel === "other" && (
        <Field label="Payout Details (phone / account, etc.)">
          <textarea rows={3} placeholder="Where should we send your funds?"
            value={userPayoutData.notes || ""}
            onChange={(e) => setField("notes", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
      )}
    </div>
  );
};

export default PayoutFields;
