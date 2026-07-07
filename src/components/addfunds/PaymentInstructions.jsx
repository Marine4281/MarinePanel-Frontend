import CopyRow from "./CopyRow";

const PaymentInstructions = ({ selected, mode }) => {
  if (!selected) return null;

  return (
    <>
      {(selected.adminNote || selected.cpNote) && (
        <div className="space-y-2">
          {selected.adminNote && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
              ℹ️ {selected.adminNote}
            </div>
          )}
          {selected.cpNote && (
            <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">
              📌 {selected.cpNote}
            </div>
          )}
        </div>
      )}

      {mode === "binance" && (
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 space-y-3">
          <p className="text-sm font-bold text-yellow-800">How to pay with Binance</p>
          {selected.paymentInstructions && (
            <p className="text-sm text-yellow-700 whitespace-pre-line">{selected.paymentInstructions}</p>
          )}
          {selected.qrImageUrl && (
            <img src={selected.qrImageUrl} alt="Binance QR" className="w-32 h-32 rounded-lg border mx-auto" />
          )}
          {selected.binanceId && <CopyRow label="Binance ID" value={selected.binanceId} />}
          {selected.binanceName && (
            <p className="text-xs text-yellow-700">Name on account: <b>{selected.binanceName}</b></p>
          )}
          <p className="text-sm text-yellow-700">
            After sending, fill in your Binance Order ID and your name below.
          </p>
        </div>
      )}

      {mode === "manual" && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
          {selected.paymentInstructions && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{selected.paymentInstructions}</p>
          )}

          {["mpesa", "momo", "airtel", "other"].includes(selected.manualType) && selected.manualConfig?.number && (
            <>
              <CopyRow label="Send money to" value={selected.manualConfig.number} />
              {selected.manualConfig.holderName && (
                <p className="text-xs text-gray-500">Name: <b>{selected.manualConfig.holderName}</b></p>
              )}
            </>
          )}

          {selected.manualType === "bank" && (
            <div className="space-y-2">
              {selected.manualConfig?.bankName && (
                <p className="text-xs text-gray-500">Bank: <b>{selected.manualConfig.bankName}</b></p>
              )}
              {selected.manualConfig?.accountNumber && (
                <CopyRow label="Account Number" value={selected.manualConfig.accountNumber} />
              )}
              {selected.manualConfig?.accountName && (
                <p className="text-xs text-gray-500">Account Name: <b>{selected.manualConfig.accountName}</b></p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PaymentInstructions;
