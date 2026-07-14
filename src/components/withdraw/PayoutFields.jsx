import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useCurrency } from "../../context/CurrencyContext";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

// Which recipient fields to show — automatic gateways are driven by the
// provider adapter (mpesa/flutterwave), manual ones by manualType,
// and binance is its own dedicated channel (no provider attached).
const getPayoutChannel = (selected) => {
  if (selected.paymentMode === "binance") return "binance";
  if (selected.paymentMode === "manual") return selected.manualType || "other";
  return selected.providerType;
};

const PayoutFields = ({ selected, usdAmount, setUsdAmount, userPayoutData, setField }) => {
  const channel = getPayoutChannel(selected);
  const { selected: currency } = useCurrency();
  const rate   = currency?.rate || 1;
  const symbol = currency?.symbol || "$";
  const code   = currency?.code || "USD";
  const isUSD  = !currency?._id || code === "USD";

  const [displayAmount, setDisplayAmount] = useState("");

  useEffect(() => {
    if (usdAmount === "" && displayAmount !== "") setDisplayAmount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdAmount]);

  const handleDisplayChange = (val) => {
    setDisplayAmount(val);
    if (val === "" || isNaN(Number(val))) { setUsdAmount(""); return; }
    const usd = isUSD ? Number(val) : Number(val) / rate;
    setUsdAmount(usd.toFixed(6));
  };

  const minWithdrawDisplay = selected.minWithdraw
    ? (isUSD ? selected.minWithdraw.toFixed(2) : (selected.minWithdraw * rate).toFixed(2))
    : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Amount ({code})
        </label>
        <div className="flex items-stretch border-2 rounded-xl overflow-hidden focus-within:border-orange-400 transition">
          <span className="flex items-center justify-center px-3 bg-gray-50 text-gray-500 font-bold text-sm shrink-0 border-r border-gray-200">
            {symbol}
          </span>
          <input type="number" min="0" step="0.01" placeholder="0.00"
            value={displayAmount} onChange={(e) => handleDisplayChange(e.target.value)}
            className="flex-1 min-w-0 px-3 py-3 text-gray-800 text-sm outline-none" />
        </div>
        <div className="flex items-center justify-between mt-1">
          {minWithdrawDisplay && (
            <p className="text-xs text-gray-400">Min: {symbol}{minWithdrawDisplay} {code}</p>
          )}
          {!isUSD && usdAmount && Number(usdAmount) > 0 && (
            <p className="text-xs text-gray-300">${Number(usdAmount).toFixed(4)}</p>
          )}
        </div>
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

      {/* ✅ Binance now has its own fields — Binance ID + Full Name, not a
          wallet address. Binance Pay/internal transfers route by these,
          not an on-chain address. */}
      {channel === "binance" && (
        <div className="space-y-3">
          <Field label="Your Binance ID">
            <input type="text" placeholder="e.g. 123456789"
              value={userPayoutData.binanceId || ""}
              onChange={(e) => setField("binanceId", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
          </Field>
          <Field label="Full Name (as registered on Binance)">
            <input type="text" placeholder=" Full Name"
              value={userPayoutData.fullName || ""}
              onChange={(e) => setField("fullName", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
          </Field>
        </div>
      )}

      {channel === "crypto" && (
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
