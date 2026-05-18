// src/components/admin/childpanel/settings/CPIntervalPicker.jsx

import { useState } from "react";
import { INTERVAL_PRESETS } from "./CPSettingsHelpers";

/**
 * Props
 *  value        {number}   current interval days
 *  onChange     {fn}       called with new number
 *  label        {string}   optional heading label
 *  helpText     {string}   optional sub-label
 */
export default function CPIntervalPicker({ value, onChange, label, helpText }) {
  // Is the current value a preset or custom?
  const isPreset    = INTERVAL_PRESETS.includes(Number(value));
  const [custom, setCustom] = useState(!isPreset);
  const [input,  setInput]  = useState(!isPreset ? String(value) : "");

  const selectPreset = (d) => {
    setCustom(false);
    setInput("");
    onChange(d);
  };

  const handleCustom = (v) => {
    setInput(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 1) onChange(n);
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
      )}

      {/* Preset chips */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {INTERVAL_PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => selectPreset(d)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
              !custom && Number(value) === d
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
            }`}
          >
            {d === 1 ? "1 day" : `${d} days`}
          </button>
        ))}

        {/* Custom chip */}
        <button
          type="button"
          onClick={() => { setCustom(true); setInput(custom ? input : ""); }}
          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
            custom
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom input */}
      {custom && (
        <input
          type="number"
          min="1"
          placeholder="Enter days e.g. 20"
          value={input}
          onChange={(e) => handleCustom(e.target.value)}
          className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}

      {helpText && (
        <p className="text-xs text-gray-400 mt-1">{helpText}</p>
      )}
    </div>
  );
          }
