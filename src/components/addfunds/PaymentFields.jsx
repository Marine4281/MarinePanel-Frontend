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

const PaymentFields = ({ selected, mode, usdAmount, setUsdAmount, userPayData, setField }) => {
  const { selected: currency } = useCurrency();
  const rate   = currency?.rate || 1;
  const symbol = currency?.symbol || "$";
  const code   = currency?.code || "USD";
  const isUSD  = !currency?._id || code === "USD";

  // What the user actually types/sees — in their selected display currency.
  // usdAmount (the real value sent to the backend) is derived from this.
  const [displayAmount, setDisplayAmount] = useState("");

  // Reset local display when the amount is cleared externally (e.g. switching gateway)
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

  const minDepositDisplay = selected.minDeposit
    ? (isUSD ? selected.minDeposit.toFixed(2) : (selected.minDeposit * rate).toFixed(2))
    : null;

  return (
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Amount ({code})
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
        <input type="number" min="0" step="0.01" placeholder="0.00"
          value={displayAmount} onChange={(e) => handleDisplayChange(e.target.value)}
          className="w-full pl-8 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm outline-none focus:border-orange-400 transition" />
      </div>
      <div className="flex items-center justify-between mt-1">
        {minDepositDisplay && (
          <p className="text-xs text-gray-400">Min: {symbol}{minDepositDisplay} {code}</p>
        )}
        {!isUSD && usdAmount && Number(usdAmount) > 0 && (
          <p className="text-xs text-gray-400">≈ ${Number(usdAmount).toFixed(4)} USD</p>
        )}
      </div>
    </div>

    {(mode === "mpesa" || mode === "airtel") && (
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Phone Number
        </label>
        <PhoneInput
          country="ke"
          value={userPayData.phone || ""}
          onChange={(val) => setField("phone", val)}
          preferredCountries={["ke", "ug", "tz", "gh", "ng"]}
          inputClass="!w-full !py-3 !rounded-xl !border-2 !text-sm"
        />
      </div>
    )}

    {mode === "momo" && (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <PhoneInput country="gh" value={userPayData.phone || ""}
            onChange={(val) => setField("phone", val)}
            preferredCountries={["gh", "ug", "rw", "ci", "sn"]}
            inputClass="!w-full !py-3 !rounded-xl !border-2 !text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Network
          </label>
          <select value={userPayData.network || ""}
            onChange={(e) => setField("network", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400">
            <option value="">Select network</option>
            <option value="MTN">MTN MoMo</option>
            <option value="Vodafone">Vodafone Cash</option>
            <option value="AirtelTigo">AirtelTigo</option>
            <option value="Moov">Moov</option>
          </select>
        </div>
      </div>
    )}

    {mode === "card" && (
      <div className="space-y-3">
        <Field label="Card Number">
          <input type="text" maxLength={19} placeholder="1234 5678 9012 3456"
            value={userPayData.cardNumber || ""}
            onChange={(e) => setField("cardNumber", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry (MM/YY)">
            <input type="text" maxLength={5} placeholder="MM/YY"
              value={userPayData.expiry || ""}
              onChange={(e) => setField("expiry", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
          </Field>
          <Field label="CVV">
            <input type="password" maxLength={4} placeholder="•••"
              value={userPayData.cvv || ""}
              onChange={(e) => setField("cvv", e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
          </Field>
        </div>
        <Field label="Cardholder Name">
          <input type="text" placeholder="Full Name"
            value={userPayData.cardName || ""}
            onChange={(e) => setField("cardName", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
      </div>
    )}

    {mode === "bank" && (
      <div className="space-y-3">
        <Field label="Bank Name">
          <input type="text" placeholder="e.g. Equity Bank"
            value={userPayData.bankName || ""}
            onChange={(e) => setField("bankName", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
        <Field label="Account Number">
          <input type="text" placeholder="e.g. 0123456789"
            value={userPayData.accountNumber || ""}
            onChange={(e) => setField("accountNumber", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
        <Field label="Account Name">
          <input type="text" placeholder="Full Name"
            value={userPayData.accountName || ""}
            onChange={(e) => setField("accountName", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
      </div>
    )}

    {mode === "crypto" && (
      <div className="space-y-3">
        <Field label="Your Wallet Address">
          <input type="text" placeholder="e.g. TRx..."
            value={userPayData.walletAddress || ""}
            onChange={(e) => setField("walletAddress", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
        </Field>
        <Field label="Network">
          <select value={userPayData.network || ""}
            onChange={(e) => setField("network", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-800 outline-none focus:border-orange-400">
            <option value="">Select network</option>
            <option value="TRC20">USDT TRC20 (Tron)</option>
            <option value="ERC20">USDT ERC20 (Ethereum)</option>
            <option value="BEP20">USDT BEP20 (BSC)</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
          </select>
        </Field>
      </div>
    )}

    {mode === "binance" && (
      <div className="space-y-3">
        <Field label="Binance Order ID (from your Binance app)">
          <input type="text" placeholder="e.g. 1234567890"
            value={userPayData.binanceOrderId || ""}
            onChange={(e) => setField("binanceOrderId", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
        </Field>
        <Field label="Your Name">
          <input type="text" placeholder="Full Name"
            value={userPayData.senderName || ""}
            onChange={(e) => setField("senderName", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
      </div>
    )}

    {mode === "manual" && ["mpesa", "momo", "airtel", "other"].includes(selected.manualType) && (
      <div className="space-y-3">
        <Field label="Transaction Code (or leave blank if using name)">
          <input type="text" placeholder="e.g. UGT3VSJ89"
            value={userPayData.transactionCode || ""}
            onChange={(e) => setField("transactionCode", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400 font-mono" />
        </Field>
        <Field label="Sender's Name">
          <input type="text" placeholder="Full Name"
            value={userPayData.senderName || ""}
            onChange={(e) => setField("senderName", e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
        </Field>
      </div>
    )}

    {mode === "manual" && selected.manualType === "bank" && (
      <Field label="Sender's Name">
        <input type="text" placeholder="Full Name"
          value={userPayData.senderName || ""}
          onChange={(e) => setField("senderName", e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:border-orange-400" />
      </Field>
    )}
  </div>
  );
};

export default PaymentFields;
