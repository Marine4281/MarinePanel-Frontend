import { useCurrency } from "../../context/CurrencyContext";

const QRow = ({ label, value, bold, color }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${color || "text-gray-700"}`}>{value}</span>
  </div>
);

const WithdrawQuoteBreakdown = ({ quote, quoteLoading, sym, curr, confirmed, setConfirmed }) => {
  const { formatMoney } = useCurrency();

  if (quoteLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
        <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
        Calculating...
      </div>
    );
  }

  if (!quote) return null;

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <div className="px-4 py-2 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Withdrawal Breakdown
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          <QRow label="Wallet debit"     value={formatMoney(quote.walletDebit, 4)} bold />
          {quote.fee > 0 && (
            <QRow label="Processing fee" value={`${sym}${Number(quote.fee).toFixed(2)} ${curr}`} color="text-red-500" />
          )}
          <QRow label="You will receive" value={`${sym}${Number(quote.amountReceived).toFixed(2)} ${curr}`} color="text-green-600" bold />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-orange-500" />
        <span className="text-xs text-gray-500 leading-relaxed">
          I understand {formatMoney(quote.walletDebit, 4)} will be deducted from my wallet
          and I will receive {sym}{Number(quote.amountReceived).toFixed(2)} {curr}.
        </span>
      </label>
    </>
  );
};

export default WithdrawQuoteBreakdown;
