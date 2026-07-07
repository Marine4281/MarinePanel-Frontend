import {
  FaMobileAlt,
  FaUniversity,
  FaCreditCard,
  FaLock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { SiBinance } from "react-icons/si";

const BRAND = "#f97316";

const PAYMENT_MODE_ICONS = {
  hosted:  FaCreditCard,
  mpesa:   FaMobileAlt,
  momo:    FaMobileAlt,
  airtel:  FaMobileAlt,
  card:    FaCreditCard,
  bank:    FaUniversity,
  crypto:  FaLock,
  binance: SiBinance,
  other:   FaMoneyBillWave,
};

const getGatewayIcon = (gw) => {
  if (gw.paymentMode === "manual") {
    return PAYMENT_MODE_ICONS[gw.manualType] || FaCreditCard;
  }
  return PAYMENT_MODE_ICONS[gw.paymentMode] || FaMoneyBillWave;
};

const GatewaySelector = ({ gateways, selected, onSelect }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
      Payment Method
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {gateways.length === 0 && (
        <p className="col-span-3 text-center py-6 text-sm text-gray-400">
          No payment methods available
        </p>
      )}
      {gateways.map((gw) => {
        const Icon = getGatewayIcon(gw);
        const isSelected = selected?._id === gw._id;
        return (
          <button key={gw._id} onClick={() => onSelect(gw)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all"
            style={{
              borderColor: isSelected ? BRAND : "#e5e7eb",
              background:  isSelected ? "#fff7ed" : "#fff",
              boxShadow:   isSelected ? `0 0 0 1px ${BRAND}` : "none",
            }}>
            <Icon className="text-2xl" style={{ color: isSelected ? BRAND : "#6b7280" }} />
            <span className="text-xs font-bold text-gray-700 leading-tight">{gw.name}</span>
            {gw.description && (
              <span className="text-[10px] text-gray-400 leading-tight">{gw.description}</span>
            )}
            {gw.processingCurrency !== "USD" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                {gw.processingCurrency}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default GatewaySelector;
