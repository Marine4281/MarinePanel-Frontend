export const PROVIDER_TYPES = [
  { value: "paystack",    label: "Paystack",      fields: ["secretKey","publicKey"] },
  { value: "flutterwave", label: "Flutterwave",   fields: ["secretKey","publicKey","encryptionKey","webhookSecret"] },
  { value: "mpesa",       label: "M-Pesa Daraja", fields: ["consumerKey","consumerSecret","shortcode","passkey"] },
  { value: "kora",        label: "Kora",          fields: ["secretKey","publicKey"] },
  { value: "binance",     label: "Binance Pay",   fields: ["apiKey","secretKey"] },
  { value: "cryptomus",   label: "Cryptomus",     fields: ["apiKey","merchantId"] },
  { value: "manual",      label: "Manual",        fields: [] },
];

export const FIELD_LABELS = {
  secretKey:"Secret Key", publicKey:"Public Key", encryptionKey:"Encryption Key",
  webhookSecret:"Webhook Secret", consumerKey:"Consumer Key",
  consumerSecret:"Consumer Secret", shortcode:"Shortcode", passkey:"Passkey",
  apiKey:"API Key", merchantId:"Merchant UUID",
};

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

export const EMPTY_PROVIDER = {
  name: "", providerType: "", credentials: {},
  isActive: true, visibleToCp: false,
};

export const EMPTY_GATEWAY = {
  name: "", description: "", paymentMode: "hosted", providerProfile: "",
  binanceId: "", binanceName: "", qrImageUrl: "",
  manualType: "", manualConfig: { number: "", holderName: "", bankName: "", accountNumber: "", accountName: "" },
  paymentInstructions: "",
  processingCurrency: "USD", processingCurrencySymbol: "$",
  exchangeRate: 1, feeType: "none", feePercentage: 0, feeFixed: 0,
  minDeposit: 0, supportsWithdraw: false, minWithdraw: 0,
  adminNote: "", cpNote: "",
  isVisible: true, visibleToCp: false,
};
