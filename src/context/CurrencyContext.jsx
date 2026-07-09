// src/context/CurrencyContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useAuthContext } from "./AuthContext";

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

// Fallback shown before any data loads / for logged-out users
const USD_FALLBACK = {
  _id: null,
  name: "US Dollar",
  code: "USD",
  symbol: "$",
  rate: 1,
  isDefault: true,
  isActive: true,
};

export const CurrencyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();

  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState(USD_FALLBACK);
  const [loading, setLoading] = useState(true);

  // ======================= FETCH LIST =======================
  const fetchCurrencies = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrencies([]);
      setSelected(USD_FALLBACK);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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

  // ======================= SELECT / SAVE =======================
  // Optimistic: updates UI immediately, persists to DB in background.
  const selectCurrency = async (currency) => {
    const previous = selected;
    setSelected(currency || USD_FALLBACK);

    try {
      await API.put("/currencies/select", {
        currencyId: currency?._id || null,
      });
    } catch (err) {
      console.error("Failed to save currency preference:", err);
      setSelected(previous); // revert on failure
    }
  };

  // ======================= CONVERT =======================
  // usdAmount -> number in the selected display currency.
  // Real values in the DB/backend stay in USD always — this is display-only.
  const convert = (usdAmount) => {
    const amount = Number(usdAmount) || 0;
    return amount * (selected?.rate || 1);
  };

  // ======================= FORMAT =======================
  // usdAmount -> formatted string, e.g. "KSh 1,234.56"
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
      value={{
        currencies,
        selected,
        loading,
        selectCurrency,
        convert,
        formatMoney,
        refreshCurrencies: fetchCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
