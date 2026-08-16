// src/templates/pulse/PulseCurrencySelector.jsx
import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

export default function PulseCurrencySelector({ brandColor }) {
  const { currencies, selected, selectCurrency, loading } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition disabled:opacity-50"
        style={{ background: `${brandColor}12`, color: brandColor }}
      >
        <span>{selected?.symbol}</span>
        <span>{selected?.code}</span>
        <FiChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50 max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={() => handlePick(null)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-gray-50"
          >
            <span>$ USD</span>
            {!selected?._id && <FiCheck size={12} style={{ color: brandColor }} />}
          </button>
          {currencies.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => handlePick(c)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-gray-50"
            >
              <span>{c.symbol} {c.code} <span className="text-gray-400">— {c.name}</span></span>
              {selected?._id === c._id && <FiCheck size={12} style={{ color: brandColor }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
