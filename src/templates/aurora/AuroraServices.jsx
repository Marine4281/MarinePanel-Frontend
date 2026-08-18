// src/templates/aurora/AuroraServices.jsx
import { useState, useMemo, useEffect } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import { FiSearch, FiChevronDown, FiChevronUp, FiInfo, FiX } from "react-icons/fi";

// Mirrors ServiceTable.jsx's rate resolution — respects reseller/system overrides when present.
const calculateRate = (service) => {
  if (service?.resellerRate != null) return Number(service.resellerRate);
  if (service?.systemRate != null) return Number(service.systemRate);
  if (service?.rate != null) return Number(service.rate);
  return 0;
};

export default function AuroraServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const { formatMoney } = useCurrency();
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [categoryMeta, setCategoryMeta] = useState([]);

  const brand = { color: childPanel?.themeColor || "#a78bfa" };

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

  const toggle = (key) => setExpandedCats((p) => ({ ...p, [key]: !p[key] }));

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-5 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand.color }}>
            Available
          </p>
          <h2 className="text-2xl font-black text-white">Services</h2>
        </div>

        <div className="relative">
          <FiSearch size={14} className="absolute left-4 top-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or category…"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }}
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-2xl py-12 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No services found for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {grouped.map((group) => {
              const key = `${group.platform}::${group.category}`;
              const open = expandedCats[key] !== false;
              const meta = metaMap[key];
              const featured = meta?.isFeatured;
              const featColor = meta?.featuredColor === "blue" ? "#60a5fa" : "#fb923c";

              return (
                <div
                  key={key}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-left min-w-0">
                        <span className="text-sm font-bold text-white truncate block">{group.category}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{group.platform}</span>
                      </div>
                      {featured && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: featColor, background: `${featColor}20`, border: `1px solid ${featColor}44` }}
                        >
                          Featured
                        </span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{ background: `${brand.color}20`, color: brand.color }}
                      >
                        {group.items.length}
                      </span>
                    </div>
                    {open ? (
                      <FiChevronUp size={14} style={{ color: "rgba(255,255,255,0.3)" }} className="flex-shrink-0" />
                    ) : (
                      <FiChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} className="flex-shrink-0" />
                    )}
                  </button>

                  {open && (
                    <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {group.items.map((svc) => (
                        <div key={svc._id} className="px-4 py-3 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{svc.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                              #{svc.serviceId} · Min {svc.min} / Max {svc.max}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold" style={{ color: brand.color }}>
                              {svc.isFree ? "Free" : formatMoney(calculateRate(svc), 4) + "/K"}
                            </span>
                            <button onClick={() => setSelectedService(svc)} style={{ color: "rgba(255,255,255,0.3)" }}>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedService(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div
            className="relative w-full max-w-md rounded-2xl p-5 space-y-4"
            style={{ background: "#1a1730", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">{selectedService.name}</h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{selectedService.platform} · {selectedService.category}</p>
              </div>
              <button onClick={() => setSelectedService(null)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                <FiX size={16} />
              </button>
            </div>
            <p className="text-sm whitespace-pre-line" style={{ color: "rgba(255,255,255,0.55)" }}>
              {selectedService.description || "No description provided."}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[["Rate", selectedService.isFree ? "Free" : formatMoney(calculateRate(selectedService), 4)],
                ["Min", selectedService.min], ["Max", selectedService.max]].map(([k, v]) => (
                <div key={k} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{k}</p>
                  <p className="text-sm font-bold" style={{ color: brand.color }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AuroraLayout>
  );
            }
