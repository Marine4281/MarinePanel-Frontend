// src/templates/pulse/PulseServices.jsx
import { useState, useMemo, useEffect } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import { FiSearch, FiChevronDown, FiChevronUp, FiInfo, FiX } from "react-icons/fi";

// Mirrors ServiceTable.jsx's rate resolution — respects reseller/system overrides when present.
const calculateRate = (service) => {
  if (service?.resellerRate != null) return Number(service.resellerRate);
  if (service?.systemRate != null) return Number(service.systemRate);
  if (service?.rate != null) return Number(service.rate);
  return 0;
};

export default function PulseServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const { formatMoney } = useCurrency();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [categoryMeta, setCategoryMeta] = useState([]);

  const brand = { color: childPanel?.themeColor || "#6366f1" };

  useEffect(() => {
    API.get("/category-meta").then((r) => setCategoryMeta(r.data || [])).catch(() => setCategoryMeta([]));
  }, []);

  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => { m[`${c.platform}::${c.category}`] = c; });
    return m;
  }, [categoryMeta]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(
      (s) => s.name?.toLowerCase().includes(q) || String(s.serviceId || "").includes(q) || s.category?.toLowerCase().includes(q)
    );
  }, [services, search]);

  const grouped = useMemo(() => {
    const acc = {};
    filtered.forEach((s) => {
      const key = `${s.platform || "General"} · ${s.category || "Other"}`;
      if (!acc[key]) acc[key] = { platform: s.platform || "General", category: s.category || "Other", items: [] };
      acc[key].items.push(s);
    });
    return Object.values(acc).sort((a, b) => {
      const orderA = metaMap[`${a.platform}::${a.category}`]?.sortOrder ?? 999;
      const orderB = metaMap[`${b.platform}::${b.category}`]?.sortOrder ?? 999;
      return orderA - orderB;
    });
  }, [filtered, metaMap]);

  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4 → max-w-2xl mx-auto space-y-4 ">
        <h2 className="text-xl font-black text-gray-900 pt-1">Services</h2>

        {/* Search */}
        <div className="relative">
          <FiSearch size={14} className="absolute left-4 top-3.5 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or category…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm border border-gray-100 bg-white outline-none text-gray-800 shadow-sm"
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
            <p className="text-sm text-gray-400">No services found for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {grouped.map((group) => {
              const key = `${group.platform}::${group.category}`;
              const open = expanded[key] !== false;
              const meta = metaMap[key];
              const featured = meta?.isFeatured;
              const featColor = meta?.featuredColor === "blue" ? "#3b82f6" : "#f97316";

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-left min-w-0">
                        <span className="font-black text-sm text-gray-900 truncate block">{group.category}</span>
                        <span className="text-xs text-gray-400">{group.platform}</span>
                      </div>
                      {featured && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: featColor, background: `${featColor}14`, border: `1px solid ${featColor}44` }}
                        >
                          Featured
                        </span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={{ background: `${brand.color}12`, color: brand.color }}
                      >
                        {group.items.length}
                      </span>
                    </div>
                    {open
                      ? <FiChevronUp size={14} className="text-gray-300 flex-shrink-0" />
                      : <FiChevronDown size={14} className="text-gray-300 flex-shrink-0" />}
                  </button>

                  {open && (
                    <div className="divide-y divide-gray-50">
                      {group.items.map((svc) => (
                        <div key={svc._id} className="flex items-start justify-between px-4 py-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-bold text-gray-800 truncate">{svc.name}</p>
                            <p className="text-xs text-gray-400">#{svc.serviceId} · Min {svc.min} / Max {svc.max}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-black" style={{ color: brand.color }}>
                              {svc.isFree ? "Free" : formatMoney(calculateRate(svc), 4) + "/K"}
                            </span>
                            <button onClick={() => setSelectedService(svc)} className="text-gray-300">
                              <FiInfo size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setSelectedService(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-black text-gray-900 truncate">{selectedService.name}</h2>
                <p className="text-xs text-gray-400">{selectedService.platform} · {selectedService.category}</p>
              </div>
              <button onClick={() => setSelectedService(null)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                <FiX size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 whitespace-pre-line">
              {selectedService.description || "No description provided."}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[["Rate", selectedService.isFree ? "Free" : formatMoney(calculateRate(selectedService), 4)],
                ["Min", selectedService.min], ["Max", selectedService.max]].map(([k, v]) => (
                <div key={k} className="rounded-2xl p-3 text-center bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-black" style={{ color: brand.color }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PulseLayout>
  );
}
