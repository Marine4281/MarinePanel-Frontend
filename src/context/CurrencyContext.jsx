// src/context/CurrencyContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useAuthContext } from "./AuthContext";

const CurrencyContext = createContext();
export const useCurrency = () => useContext(CurrencyContext);

const LS_KEY = "mp_public_currency";

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
    setLoading(true);
    try {
      if (isAuthenticated) {
        // logged-in: DB-backed, as before
        const res = await API.get("/currencies");
        const list = res.data?.currencies || [];
        setCurrencies(list);
        const savedId = res.data?.selectedCurrency;
        const match = savedId ? list.find((c) => c._id === savedId) : null;
        setSelected(match || USD_FALLBACK);
      } else {
        // guest: public, domain-aware list; selection lives in localStorage
        const res = await API.get("/currencies/public");
        const list = res.data?.currencies || [];
        setCurrencies(list);

        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(LS_KEY)); } catch { /* ignore */ }
        const match = saved ? list.find((c) => c._id === saved._id) : null;
        setSelected(match || USD_FALLBACK);
      }
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
    const previous = selected;
    setSelected(currency || USD_FALLBACK);

    if (!isAuthenticated) {
      // guest: local only, never touches the DB
      try {
        if (currency) localStorage.setItem(LS_KEY, JSON.stringify(currency));
        else localStorage.removeItem(LS_KEY);
      } catch { /* storage unavailable — ignore, UI state still updates */ }
      return;
    }

    // logged-in: persist to DB, as before
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
