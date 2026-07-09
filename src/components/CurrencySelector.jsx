// src/components/CurrencySelector.jsx
import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { useCurrency } from "../context/CurrencyContext";

const CurrencySelector = () => {
  const { currencies, selected, selectCurrency, loading } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Nothing to choose between — hide selector entirely
  if (!loading && currencies.length === 0) return null;

  const handlePick = (currency) => {
    selectCurrency(currency);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <span>{selected?.symbol}</span>
        <span>{selected?.code}</span>
        <FaChevronDown className={`text-[10px] text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 max-h-72 overflow-y-auto">
          {/* USD is always available as the base option */}
          <button
            type="button"
            onClick={() => handlePick(null)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-gray-50"
          >
            <span>$ USD</span>
            {(!selected?._id) && <FaCheck className="text-xs text-orange-500" />}
          </button>

          {currencies.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => handlePick(c)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-gray-50"
            >
              <span>{c.symbol} {c.code} <span className="text-gray-400">— {c.name}</span></span>
              {selected?._id === c._id && <FaCheck className="text-xs text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
