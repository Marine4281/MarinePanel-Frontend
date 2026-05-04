// src/templates/neon/NeonServices.jsx
import { useState } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import NeonLayout from "./NeonLayout";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function NeonServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const neon = childPanel?.themeColor || "#00ff88";

  const filtered = services.filter(
    (s) => s.name?.toLowerCase().includes(search.toLowerCase()) || String(s.serviceId).includes(search)
  );
  const grouped = filtered.reduce((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Catalog</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Services</h2>
        </div>

        <div className="relative">
          <FiSearch size={13} className="absolute left-4 top-3.5" style={{ color: `${neon}44` }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search catalog…"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
            style={{ background: "#0d0d1a", border: `1px solid ${neon}22`, color: "#c4c4e0", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped).map(([cat, svcs]) => {
              const open = expanded[cat] !== false;
              return (
                <div key={cat} className="rounded-2xl overflow-hidden" style={{ background: "#0d0d1a", border: `1px solid ${neon}14` }}>
                  <button onClick={() => setExpanded((p) => ({ ...p, [cat]: !p[cat] }))}
                    className="w-full flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black" style={{ color: "#c4c4e0" }}>{cat}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-black"
                        style={{ background: `${neon}14`, color: neon }}>{svcs.length}</span>
                    </div>
                    {open ? <FiChevronUp size={13} style={{ color: `${neon}44` }} /> : <FiChevronDown size={13} style={{ color: `${neon}44` }} />}
                  </button>
                  {open && (
                    <div className="divide-y" style={{ borderColor: `${neon}08` }}>
                      {svcs.map((svc) => (
                        <div key={svc._id} className="flex items-start justify-between px-4 py-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-semibold truncate" style={{ color: "#8888a8" }}>{svc.name}</p>
                            <p className="text-xs" style={{ color: "#3a3a5a" }}>#{svc.serviceId} · {svc.min}–{svc.max}</p>
                          </div>
                          <span className="text-xs font-black flex-shrink-0" style={{ color: neon, textShadow: `0 0 6px ${neon}66` }}>
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
    </NeonLayout>
  );
}
