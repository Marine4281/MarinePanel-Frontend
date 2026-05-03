// src/templates/aurora/AuroraServices.jsx
import { useState } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import AuroraLayout from "./AuroraLayout";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function AuroraServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});

  const brand = { color: childPanel?.themeColor || "#a78bfa" };

  const filtered = services.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.serviceId).includes(search)
  );

  const grouped = filtered.reduce((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const toggle = (cat) =>
    setExpandedCats((p) => ({ ...p, [cat]: !p[cat] }));

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
            placeholder="Search services…"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped).map(([cat, svcs]) => {
              const open = expandedCats[cat] !== false;
              return (
                <div
                  key={cat}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <button
                    onClick={() => toggle(cat)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{cat}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${brand.color}20`, color: brand.color }}
                      >
                        {svcs.length}
                      </span>
                    </div>
                    {open ? (
                      <FiChevronUp size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                    ) : (
                      <FiChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                    )}
                  </button>

                  {open && (
                    <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {svcs.map((svc) => (
                        <div key={svc._id} className="px-4 py-3 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{svc.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                              #{svc.serviceId} · Min {svc.min} / Max {svc.max}
                            </p>
                          </div>
                          <span
                            className="text-xs font-bold flex-shrink-0"
                            style={{ color: brand.color }}
                          >
                            ${Number(svc.rate).toFixed(4)}/K
                          </span>
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
    </AuroraLayout>
  );
}
