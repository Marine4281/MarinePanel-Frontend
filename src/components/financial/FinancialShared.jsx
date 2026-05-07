// src/components/financial/FinancialShared.jsx
export const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

export const RANGES = [
  { label: "Today",       value: "today" },
  { label: "This Week",   value: "thisWeek" },
  { label: "Last 7 Days", value: "last7" },
  { label: "This Month",  value: "thisMonth" },
  { label: "This Year",   value: "thisYear" },
  { label: "All Time",    value: "all" },
  { label: "Custom",      value: "custom" },
];

export const STATUS_COLORS = {
  Completed:  "bg-green-900/50 text-green-400 border border-green-700",
  Failed:     "bg-red-900/50 text-red-400 border border-red-700",
  Pending:    "bg-yellow-900/50 text-yellow-400 border border-yellow-700",
  Processing: "bg-blue-900/50 text-blue-400 border border-blue-700",
};

export const COUNTRIES = [
  { name: "All",                  code: "All" },
  { name: "Afghanistan",          code: "AF" },
  { name: "Albania",              code: "AL" },
  { name: "Algeria",              code: "DZ" },
  { name: "Angola",               code: "AO" },
  { name: "Argentina",            code: "AR" },
  { name: "Australia",            code: "AU" },
  { name: "Austria",              code: "AT" },
  { name: "Bangladesh",           code: "BD" },
  { name: "Belgium",              code: "BE" },
  { name: "Bolivia",              code: "BO" },
  { name: "Brazil",               code: "BR" },
  { name: "Cambodia",             code: "KH" },
  { name: "Cameroon",             code: "CM" },
  { name: "Canada",               code: "CA" },
  { name: "Chile",                code: "CL" },
  { name: "China",                code: "CN" },
  { name: "Colombia",             code: "CO" },
  { name: "Congo (DRC)",          code: "CD" },
  { name: "Costa Rica",           code: "CR" },
  { name: "Côte d'Ivoire",        code: "CI" },
  { name: "Denmark",              code: "DK" },
  { name: "Dominican Republic",   code: "DO" },
  { name: "Ecuador",              code: "EC" },
  { name: "Egypt",                code: "EG" },
  { name: "El Salvador",          code: "SV" },
  { name: "Ethiopia",             code: "ET" },
  { name: "Finland",              code: "FI" },
  { name: "France",               code: "FR" },
  { name: "Germany",              code: "DE" },
  { name: "Ghana",                code: "GH" },
  { name: "Greece",               code: "GR" },
  { name: "Guatemala",            code: "GT" },
  { name: "Honduras",             code: "HN" },
  { name: "Hungary",              code: "HU" },
  { name: "India",                code: "IN" },
  { name: "Indonesia",            code: "ID" },
  { name: "Iran",                 code: "IR" },
  { name: "Iraq",                 code: "IQ" },
  { name: "Ireland",              code: "IE" },
  { name: "Israel",               code: "IL" },
  { name: "Italy",                code: "IT" },
  { name: "Jamaica",              code: "JM" },
  { name: "Japan",                code: "JP" },
  { name: "Jordan",               code: "JO" },
  { name: "Kazakhstan",           code: "KZ" },
  { name: "Kenya",                code: "KE" },
  { name: "Kuwait",               code: "KW" },
  { name: "Lebanon",              code: "LB" },
  { name: "Libya",                code: "LY" },
  { name: "Madagascar",           code: "MG" },
  { name: "Malaysia",             code: "MY" },
  { name: "Mali",                 code: "ML" },
  { name: "Mexico",               code: "MX" },
  { name: "Morocco",              code: "MA" },
  { name: "Mozambique",           code: "MZ" },
  { name: "Myanmar",              code: "MM" },
  { name: "Nepal",                code: "NP" },
  { name: "Netherlands",          code: "NL" },
  { name: "New Zealand",          code: "NZ" },
  { name: "Nicaragua",            code: "NI" },
  { name: "Niger",                code: "NE" },
  { name: "Nigeria",              code: "NG" },
  { name: "Norway",               code: "NO" },
  { name: "Oman",                 code: "OM" },
  { name: "Pakistan",             code: "PK" },
  { name: "Panama",               code: "PA" },
  { name: "Paraguay",             code: "PY" },
  { name: "Peru",                 code: "PE" },
  { name: "Philippines",          code: "PH" },
  { name: "Poland",               code: "PL" },
  { name: "Portugal",             code: "PT" },
  { name: "Qatar",                code: "QA" },
  { name: "Romania",              code: "RO" },
  { name: "Russia",               code: "RU" },
  { name: "Rwanda",               code: "RW" },
  { name: "Saudi Arabia",         code: "SA" },
  { name: "Senegal",              code: "SN" },
  { name: "Serbia",               code: "RS" },
  { name: "Sierra Leone",         code: "SL" },
  { name: "Singapore",            code: "SG" },
  { name: "Somalia",              code: "SO" },
  { name: "South Africa",         code: "ZA" },
  { name: "South Korea",          code: "KR" },
  { name: "Spain",                code: "ES" },
  { name: "Sri Lanka",            code: "LK" },
  { name: "Sudan",                code: "SD" },
  { name: "Sweden",               code: "SE" },
  { name: "Switzerland",          code: "CH" },
  { name: "Syria",                code: "SY" },
  { name: "Taiwan",               code: "TW" },
  { name: "Tanzania",             code: "TZ" },
  { name: "Thailand",             code: "TH" },
  { name: "Tunisia",              code: "TN" },
  { name: "Turkey",               code: "TR" },
  { name: "Uganda",               code: "UG" },
  { name: "Ukraine",              code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom",       code: "GB" },
  { name: "United States",        code: "US" },
  { name: "Uruguay",              code: "UY" },
  { name: "Uzbekistan",           code: "UZ" },
  { name: "Venezuela",            code: "VE" },
  { name: "Vietnam",              code: "VN" },
  { name: "Yemen",                code: "YE" },
  { name: "Zambia",               code: "ZM" },
  { name: "Zimbabwe",             code: "ZW" },
];

// ─── StatCard ─────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent = "orange" }) {
  const accents = {
    orange: "border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent",
    blue:   "border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-transparent",
    green:  "border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent",
    purple: "border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent",
    cyan:   "border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent",
  };
  return (
    <div className={`rounded-xl border p-5 ${accents[accent]}`}>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────
export function Section({ title, children }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── MiniChart ────────────────────────────────────────────────────
export function MiniChart({ data }) {
  if (!data?.length) return <p className="text-gray-500 text-sm">No chart data</p>;
  const max = Math.max(...data.map((d) => d.profit), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-2">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-orange-500/70 hover:bg-orange-500 rounded-t transition-all"
            style={{ height: `${Math.max(4, (d.profit / max) * 80)}px` }}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
            ${fmt(d.profit)} · {d.date}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CountryDropdown ──────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";

export function CountryDropdown({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const ref                  = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0];

  const pick = (c) => {
    onChange(c.code);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-52">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 hover:border-gray-500 transition"
      >
        <span>{selected.name}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-700">
            <input
              autoFocus
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-700 text-white text-sm rounded px-3 py-1.5 outline-none placeholder-gray-400"
            />
          </div>
          {/* List */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-500 text-sm">No results</li>
            )}
            {filtered.map((c) => (
              <li
                key={c.code}
                onClick={() => pick(c)}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 transition ${
                  c.code === value ? "text-orange-400 font-semibold" : "text-gray-200"
                }`}
              >
                <span>{c.name}</span>
                <span className="text-xs text-gray-500">{c.code === "All" ? "" : c.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
   }
