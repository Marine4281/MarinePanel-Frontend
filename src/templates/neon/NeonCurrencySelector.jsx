// src/templates/neon/NeonCurrencySelector.jsx
import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

export default function NeonCurrencySelector({ brandColor, compact = false }) {
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
        className={`flex items-center gap-1 rounded-lg text-xs font-bold transition disabled:opacity-50 ${compact ? "px-2 py-1" : "px-3 py-1.5"}`}
        style={{ background: `${brandColor}14`, color: brandColor, border: `1px solid ${brandColor}33` }}
      >
        <span>{selected?.symbol}</span>
        <span>{selected?.code}</span>
        <FiChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl py-1.5 z-50 max-h-72 overflow-y-auto"
          style={{ background: "#181828", border: `1px solid ${brandColor}25`, boxShadow: `0 8px 30px rgba(0,0,0,0.5)` }}
        >
          <button
            type="button"
            onClick={() => handlePick(null)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left"
            style={{ color: "#c4c4e0" }}
          >
            <span>$ USD</span>
            {!selected?._id && <FiCheck size={12} style={{ color: brandColor }} />}
          </button>

          {currencies.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => handlePick(c)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left"
              style={{ color: "#c4c4e0" }}
            >
              <span>{c.symbol} {c.code} <span style={{ color: "#5c5c82" }}>— {c.name}</span></span>
              {selected?._id === c._id && <FiCheck size={12} style={{ color: brandColor }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
