// src/components/childpanel/financial/CPFinancialShared.jsx
import { useState, useRef, useEffect } from "react";

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
  Completed:  "bg-green-100 text-green-700 border border-green-300",
  Failed:     "bg-red-100 text-red-700 border border-red-300",
  Pending:    "bg-yellow-100 text-yellow-700 border border-yellow-300",
  Processing: "bg-blue-100 text-blue-700 border border-blue-300",
};

export const COUNTRIES = [
  { name: "All", code: "All" },
  { name: "Afghanistan", code: "AF" }, { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" }, { name: "Angola", code: "AO" },
  { name: "Argentina", code: "AR" }, { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" }, { name: "Bangladesh", code: "BD" },
  { name: "Belgium", code: "BE" }, { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" }, { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" }, { name: "Egypt", code: "EG" },
  { name: "Ethiopia", code: "ET" }, { name: "France", code: "FR" },
  { name: "Germany", code: "DE" }, { name: "Ghana", code: "GH" },
  { name: "India", code: "IN" }, { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" }, { name: "Iraq", code: "IQ" },
  { name: "Italy", code: "IT" }, { name: "Japan", code: "JP" },
  { name: "Jordan", code: "JO" }, { name: "Kenya", code: "KE" },
  { name: "Malaysia", code: "MY" }, { name: "Mexico", code: "MX" },
  { name: "Morocco", code: "MA" }, { name: "Myanmar", code: "MM" },
  { name: "Nepal", code: "NP" }, { name: "Netherlands", code: "NL" },
  { name: "Nigeria", code: "NG" }, { name: "Pakistan", code: "PK" },
  { name: "Philippines", code: "PH" }, { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" }, { name: "Qatar", code: "QA" },
  { name: "Russia", code: "RU" }, { name: "Saudi Arabia", code: "SA" },
  { name: "Singapore", code: "SG" }, { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" }, { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" }, { name: "Sudan", code: "SD" },
  { name: "Sweden", code: "SE" }, { name: "Thailand", code: "TH" },
  { name: "Tunisia", code: "TN" }, { name: "Turkey", code: "TR" },
  { name: "Uganda", code: "UG" }, { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Vietnam", code: "VN" }, { name: "Yemen", code: "YE" },
  { name: "Zimbabwe", code: "ZW" },
];

export function StatCard({ label, value, sub, accent = "blue" }) {
  const accents = {
    blue:   "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
    green:  "border-green-200 bg-gradient-to-br from-green-50 to-white",
    purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-white",
    cyan:   "border-cyan-200 bg-gradient-to-br from-cyan-50 to-white",
    orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
  };
  return (
    <div className={`rounded-xl border p-5 ${accents[accent]}`}>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function MiniChart({ data }) {
  if (!data?.length) return <p className="text-gray-400 text-sm">No chart data</p>;
  const max = Math.max(...data.map((d) => d.profit), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-2">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-blue-400/70 hover:bg-blue-500 rounded-t transition-all"
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

export function CountryDropdown({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const ref                  = useRef(null);

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

  return (
    <div ref={ref} className="relative w-52">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 hover:border-blue-400 transition"
      >
        <span>{selected.name}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 text-gray-700 text-sm rounded px-3 py-1.5 outline-none placeholder-gray-400"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && <li className="px-3 py-2 text-gray-400 text-sm">No results</li>}
            {filtered.map((c) => (
              <li
                key={c.code}
                onClick={() => { onChange(c.code); setSearch(""); setOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition ${c.code === value ? "text-blue-600 font-semibold" : "text-gray-700"}`}
              >
                <span>{c.name}</span>
                <span className="text-xs text-gray-400">{c.code === "All" ? "" : c.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
                                    }
