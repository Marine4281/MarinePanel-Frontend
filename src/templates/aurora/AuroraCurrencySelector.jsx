// src/templates/aurora/AuroraCurrencySelector.jsx
import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

export default function AuroraCurrencySelector({ brandColor }) {
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
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition disabled:opacity-50"
        style={{ background: "rgba(255,255,255,0.08)", color: brandColor, border: `1px solid ${brandColor}40` }}
      >
        <span>{selected?.symbol}</span>
        <span>{selected?.code}</span>
        <FiChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-2xl py-1.5 z-50 max-h-72 overflow-y-auto"
          style={{ background: "#1a1730", border: `1px solid ${brandColor}30`, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
        >
          <button
            type="button"
            onClick={() => handlePick(null)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left"
            style={{ color: "#e2e8f0" }}
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
              style={{ color: "#e2e8f0" }}
            >
              <span>{c.symbol} {c.code} <span style={{ color: "#64748b" }}>— {c.name}</span></span>
              {selected?._id === c._id && <FiCheck size={12} style={{ color: brandColor }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
