// src/components/childpanel/orders/CPOrdersFilters.jsx
import { useEffect, useState } from "react";

const QUICK = [
  { label: "Custom", value: "" },
  { label: "Last 24h", value: "24h" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

const STATUSES = ["", "pending", "processing", "completed", "partial", "failed", "refunded"];

function applyQuick(value) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (value === "today") return { from: today, to: today };
  if (value === "yesterday") {
    const y = new Date(now); y.setDate(now.getDate() - 1);
    const d = y.toISOString().split("T")[0];
    return { from: d, to: d };
  }
  if (value === "24h") {
    const d = new Date(now); d.setHours(now.getHours() - 24);
    return { from: d.toISOString().split("T")[0], to: today };
  }
  if (value === "7days") {
    const d = new Date(now); d.setDate(now.getDate() - 7);
    return { from: d.toISOString().split("T")[0], to: today };
  }
  if (value === "30days") {
    const d = new Date(now); d.setDate(now.getDate() - 30);
    return { from: d.toISOString().split("T")[0], to: today };
  }
  if (value === "month") {
    return { from: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`, to: today };
  }
  if (value === "year") return { from: `${now.getFullYear()}-01-01`, to: today };
  return { from: "", to: "" };
}

export default function CPOrdersFilters({
  search, setSearch, status, setStatus,
  fromDate, setFromDate, toDate, setToDate,
  onSearch,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const [quick, setQuick] = useState("");

  useEffect(() => { setLocalSearch(search); }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 500);
    return () => clearTimeout(t);
  }, [localSearch, setSearch]);

  useEffect(() => { onSearch(); }, [search, status, fromDate, toDate]);

  const handleQuick = (v) => {
    setQuick(v);
    const { from, to } = applyQuick(v);
    setFromDate(from);
    setToDate(to);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder="Search ID, email, service, link..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}
          </option>
        ))}
      </select>

      <select
        value={quick}
        onChange={(e) => handleQuick(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {QUICK.map((q) => (
          <option key={q.value} value={q.value}>{q.label}</option>
        ))}
      </select>

      <input
        type="date"
        value={fromDate}
        onChange={(e) => { setQuick(""); setFromDate(e.target.value); }}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <input
        type="date"
        value={toDate}
        onChange={(e) => { setQuick(""); setToDate(e.target.value); }}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={() => { onSearch(); }}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
      >
        Filter
      </button>
    </div>
  );
}
