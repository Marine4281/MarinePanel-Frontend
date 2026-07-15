import {
  FaMobileAlt,
  FaUniversity,
  FaCreditCard,
  FaLock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { SiBinance } from "react-icons/si";

export const PAYMENT_MODES = [
  { value: "hosted",  label: "Hosted (redirect to provider)" },
  { value: "mpesa",   label: "M-Pesa (phone number)" },
  { value: "momo",    label: "MoMo (phone + network)" },
  { value: "airtel",  label: "Airtel Money (phone number)" },
  { value: "card",    label: "Card (number, expiry, cvv)" },
  { value: "bank",    label: "Bank Transfer" },
  { value: "crypto",  label: "Crypto (wallet address + network)" },
  { value: "binance", label: "Binance (Binance ID)" },
  { value: "manual",  label: "Manual (instructions only)" },
];

export const MANUAL_TYPES = [
  { value: "mpesa",  label: "M-Pesa" },
  { value: "momo",   label: "MoMo" },
  { value: "airtel", label: "Airtel Money" },
  { value: "other",  label: "Other local payment" },
  { value: "bank",   label: "Bank Transfer" },
];

// Icon components (react-icons) instead of emoji — matches the icon set
// used on the AddFunds page's GatewaySelector.
export const MODE_ICONS = {
  hosted:  FaCreditCard,
  mpesa:   FaMobileAlt,
  momo:    FaMobileAlt,
  airtel:  FaMobileAlt,
  card:    FaCreditCard,
  bank:    FaUniversity,
  crypto:  FaLock,
  binance: SiBinance,
  manual:  FaMoneyBillWave,
};

// Brand colors, same palette as AddFunds' GatewaySelector.
export const MODE_COLORS = {
  hosted:  "#2563eb",
  mpesa:   "#4CAF50",
  momo:    "#FFCC00",
  airtel:  "#ED1C24",
  card:    "#2563eb",
  bank:    "#1E3A8A",
  crypto:  "#7C3AED",
  binance: "#F0B90B",
  manual:  "#6b7280",
};

export const EMPTY_FORM = {
  name: "", description: "", paymentMode: "hosted",
  providerProfile: "", binanceId: "", binanceName: "", qrImageUrl: "",
  manualType: "", manualConfig: { number: "", holderName: "", bankName: "", accountNumber: "", accountName: "" },
  paymentInstructions: "",
  processingCurrency: "USD", processingCurrencySymbol: "$",
  exchangeRate: 1,
  depositFeeType: "none", depositFeePercentage: 0, depositFeeFixed: 0,
  withdrawalFeeType: "none", withdrawalFeePercentage: 0, withdrawalFeeFixed: 0,
  minDeposit: 0, supportsWithdraw: false, minWithdraw: 0,
  cpNote: "", isVisible: true,
};
