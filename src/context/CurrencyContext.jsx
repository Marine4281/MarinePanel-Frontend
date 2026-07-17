// src/context/CurrencyContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useAuthContext } from "./AuthContext";

const CurrencyContext = createContext();
export const useCurrency = () => useContext(CurrencyContext);

const USD_FALLBACK = {
  _id: null, name: "US Dollar", code: "USD", symbol: "$",
  rate: 1, isDefault: true, isActive: true,
};

export const CurrencyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();

  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState(USD_FALLBACK);
  const [loading, setLoading] = useState(true);

  const fetchCurrencies = useCallback(async () => {
    if (!isAuthenticated) {
      // No logged-in user — nothing to fetch, nothing to persist.
      // Guest/storefront currency is handled entirely by usePublicCurrency.
      setCurrencies([]);
      setSelected(USD_FALLBACK);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get("/currencies");
      const list = res.data?.currencies || [];
      setCurrencies(list);
      const savedId = res.data?.selectedCurrency;
      const match = savedId ? list.find((c) => c._id === savedId) : null;
      setSelected(match || USD_FALLBACK);
    } catch (err) {
      console.error("Failed to fetch currencies:", err);
      setCurrencies([]);
      setSelected(USD_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies, user?._id]);

  const selectCurrency = async (currency) => {
    if (!isAuthenticated) return; // no-op for guests — nothing to save

    const previous = selected;
    setSelected(currency || USD_FALLBACK);

    try {
      await API.put("/currencies/select", { currencyId: currency?._id || null });
    } catch (err) {
      console.error("Failed to save currency preference:", err);
      setSelected(previous);
    }
  };

  const convert = (usdAmount) => (Number(usdAmount) || 0) * (selected?.rate || 1);

  const formatMoney = (usdAmount, decimals = 2) => {
    const converted = convert(usdAmount);
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${selected?.symbol || "$"} ${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currencies, selected, loading, selectCurrency, convert, formatMoney, refreshCurrencies: fetchCurrencies }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
