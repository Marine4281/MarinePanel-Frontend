// src/hooks/usePublicCurrency.js
//
// Always public, always domain-scoped, never touches auth state or the DB.
// Used only by guest-facing surfaces (PublicServicesTable / ServicesPublic).
// Deliberately separate from CurrencyContext, which is the logged-in
// user's personal DB-backed preference and must not be reused here.

import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";

const LS_KEY = "mp_public_currency";

const USD_FALLBACK = {
  _id: null, name: "US Dollar", code: "USD", symbol: "$",
  rate: 1, isDefault: true, isActive: true,
};

export const usePublicCurrency = () => {
  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState(USD_FALLBACK);
  const [loading, setLoading] = useState(true);

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/currencies/public"); // always public, regardless of who's logged in
      const list = res.data?.currencies || [];
      setCurrencies(list);

      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(LS_KEY)); } catch { /* ignore */ }
      const match = saved ? list.find((c) => c._id === saved._id) : null;
      setSelected(match || USD_FALLBACK);
    } catch (err) {
      console.error("Failed to fetch public currencies:", err);
      setCurrencies([]);
      setSelected(USD_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCurrencies(); }, [fetchCurrencies]);

  const selectCurrency = (currency) => {
    setSelected(currency || USD_FALLBACK);
    try {
      if (currency) localStorage.setItem(LS_KEY, JSON.stringify(currency));
      else localStorage.removeItem(LS_KEY);
    } catch { /* storage unavailable — ignore, UI state still updates */ }
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

  return { currencies, selected, loading, selectCurrency, convert, formatMoney };
};
