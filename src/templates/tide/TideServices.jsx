// src/templates/tide/TideServices.jsx
import { useState } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import TideLayout from "./TideLayout";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function TideServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

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
    <TideLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-gray-900">Services</h2>
          <p className="text-xs text-gray-400">Browse all available services</p>
        </div>

        <div className="relative max-w-md">
          <FiSearch size={15} className="absolute left-4 top-3.5 text-gray-300" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services…"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border border-gray-200 bg-white shadow-sm outline-none text-gray-800"
            onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, svcs]) => {
              const open = expanded[cat] !== false;
              return (
                <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => setExpanded((p) => ({ ...p, [cat]: !p[cat] }))}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: brand.color }} />
                      <span className="font-black text-sm text-gray-900">{cat}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                        style={{ background: `${brand.color}12`, color: brand.color }}>
                        {svcs.length} services
                      </span>
                    </div>
                    {open ? <FiChevronUp size={15} className="text-gray-400" /> : <FiChevronDown size={15} className="text-gray-400" />}
                  </button>

                  {open && (
                    <div className="border-t border-gray-50">
                      {/* Table header */}
                      <div className="grid grid-cols-12 px-5 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">Name</div>
                        <div className="col-span-2 text-center">Min</div>
                        <div className="col-span-2 text-center">Max</div>
                        <div className="col-span-1 text-right">Rate</div>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {svcs.map((svc) => (
                          <div key={svc._id} className="grid grid-cols-12 px-5 py-3 items-center hover:bg-gray-50 transition-colors">
                            <div className="col-span-1 text-xs text-gray-400">{svc.serviceId}</div>
                            <div className="col-span-6 text-xs font-semibold text-gray-800 truncate pr-2">{svc.name}</div>
                            <div className="col-span-2 text-xs text-gray-500 text-center">{svc.min}</div>
                            <div className="col-span-2 text-xs text-gray-500 text-center">{svc.max}</div>
                            <div className="col-span-1 text-xs font-black text-right" style={{ color: brand.color }}>
                              ${Number(svc.rate).toFixed(4)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TideLayout>
  );
}
