// src/templates/pulse/PulseServices.jsx
import { useState } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import PulseLayout from "./PulseLayout";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function PulseServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const brand = { color: childPanel?.themeColor || "#6366f1" };

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

  const toggle = (cat) => setExpanded((p) => ({ ...p, [cat]: !p[cat] }));

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-black text-gray-900 pt-1">Services</h2>

        {/* Search */}
        <div className="relative">
          <FiSearch size={14} className="absolute left-4 top-3.5 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm border border-gray-100 bg-white outline-none text-gray-800 shadow-sm"
            onFocus={(e) => (e.target.style.borderColor = brand.color)}
            onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped).map(([cat, svcs]) => {
              const open = expanded[cat] !== false;
              return (
                <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggle(cat)}
                    className="w-full flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-900">{cat}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${brand.color}12`, color: brand.color }}
                      >
                        {svcs.length}
                      </span>
                    </div>
                    {open
                      ? <FiChevronUp size={14} className="text-gray-300" />
                      : <FiChevronDown size={14} className="text-gray-300" />}
                  </button>

                  {open && (
                    <div className="divide-y divide-gray-50">
                      {svcs.map((svc) => (
                        <div key={svc._id} className="flex items-start justify-between px-4 py-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-bold text-gray-800 truncate">{svc.name}</p>
                            <p className="text-xs text-gray-400">#{svc.serviceId} · Min {svc.min} / Max {svc.max}</p>
                          </div>
                          <span className="text-xs font-black flex-shrink-0" style={{ color: brand.color }}>
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
    </PulseLayout>
  );
}
