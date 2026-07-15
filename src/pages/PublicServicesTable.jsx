// src/pages/PublicServicesTable.jsx
import { useState, useMemo } from "react";
import { useCachedServices } from "../context/CachedServicesContext";
import { useCurrency } from "../context/CurrencyContext";
import { FiSearch, FiChevronDown, FiCheck } from "react-icons/fi";

export default function PublicServicesTable({ themeColor = "#f97316" }) {
  const { services, loading, platforms } = useCachedServices();
  const { currencies, selected, selectCurrency, formatMoney } = useCurrency();

  const [platform, setPlatform] = useState("All");
  const [search, setSearch]     = useState("");
  const [ccyOpen, setCcyOpen]   = useState(false);

  const filtered = useMemo(() => {
    let list = services;
    if (platform !== "All") {
      list = list.filter((s) => (s.platform || "General") === platform);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          String(s.serviceId || "").includes(q) ||
          (s.name || "").toLowerCase().includes(q) ||
          (s.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [services, platform, search]);

  // Group by category — same pattern as the admin service table,
  // so the public list starts with a category, then its services.
  const groupedServices = useMemo(() => {
    return Object.entries(
      filtered.reduce((acc, s) => {
        const cat = s.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
      }, {})
    );
  }, [filtered]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {["All", ...platforms].map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={
                platform === p
                  ? { background: themeColor, borderColor: themeColor, color: "#fff" }
                  : { background: "#fff", borderColor: "#e5e7eb", color: "#6b7280" }
              }
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-8 pr-3 py-2 rounded-xl text-sm border border-gray-200 outline-none w-48 focus:border-gray-300"
            />
          </div>

          {/* Currency switcher — guest selection, stored locally only */}
          {(currencies.length > 0) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCcyOpen((o) => !o)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700"
              >
                <span>{selected?.symbol}</span>
                <span>{selected?.code}</span>
                <FiChevronDown size={12} className={`transition-transform ${ccyOpen ? "rotate-180" : ""}`} />
              </button>
              {ccyOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    type="button"
                    onClick={() => { selectCurrency(null); setCcyOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <span>$ USD</span>
                    {!selected?._id && <FiCheck size={12} style={{ color: themeColor }} />}
                  </button>
                  {currencies.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => { selectCurrency(c); setCcyOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      <span>{c.symbol} {c.code}</span>
                      {selected?._id === c._id && <FiCheck size={12} style={{ color: themeColor }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-14 text-center text-gray-400 text-sm">Loading services...</div>
        ) : groupedServices.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No services found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Rate / 1K</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Min / Max</th>
                </tr>
              </thead>
              <tbody>
                {groupedServices.map(([category, items]) => (
                  <>
                    <tr key={`cat-${category}`} className="bg-gray-100">
                      <td colSpan="5" className="px-4 py-2 font-bold text-gray-700 text-xs uppercase tracking-wide">
                        📦 {category} <span className="font-normal text-gray-400 normal-case">({items.length})</span>
                      </td>
                    </tr>
                    {items.map((s) => (
                      <tr key={s._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                        <td className="px-4 py-3 text-gray-400">{s.serviceId}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                        <td className="px-4 py-3 text-gray-500">{s.category}</td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: themeColor }}>
                          {formatMoney(s.rate, 4)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                          {s.min} / {s.max}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
