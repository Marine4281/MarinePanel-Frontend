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

export const MODE_ICONS = {
  hosted:"💳", mpesa:"📱", momo:"📲", airtel:"📡",
  card:"💳", bank:"🏦", crypto:"🔐", binance:"🟡", manual:"📋",
};

export const EMPTY_FORM = {
  name: "", description: "", paymentMode: "hosted",
  providerProfile: "", binanceId: "", binanceName: "", qrImageUrl: "",
  manualType: "", manualConfig: { number: "", holderName: "", bankName: "", accountNumber: "", accountName: "" },
  paymentInstructions: "",
  processingCurrency: "USD", processingCurrencySymbol: "$",
  exchangeRate: 1, feeType: "none", feePercentage: 0,
  feeFixed: 0, minDeposit: 0, cpNote: "", isVisible: true,
};
