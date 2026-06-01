// src/components/childpanel/services/import/CPPlatformServicesTab.jsx
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiDownload } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";
import CPImportCategoryBlock from "./CPImportCategoryBlock";
import CPImportDescriptionModal from "./CPImportDescriptionModal";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function PlatformServiceRow(svc, i, isSel, onToggleSelect, onShowDesc) {
  const isEven = i % 2 === 0;
  return (
    <tr
      key={svc._id}
      className={`border-b last:border-none transition-colors hover:bg-blue-50/40 cursor-pointer
        ${isSel ? "bg-blue-50" : isEven ? "bg-white" : "bg-gray-50"}`}
      onClick={() => onToggleSelect(svc._id)}
    >
      <td className="px-3 py-2">
        <input type="checkbox" checked={isSel}
          onChange={() => onToggleSelect(svc._id)}
          onClick={(e) => e.stopPropagation()}
          className="accent-blue-600" />
      </td>
      <td className="px-3 py-2 text-gray-500 font-mono">{svc.serviceId}</td>
      <td className="px-3 py-2 font-medium text-gray-800 min-w-[160px] max-w-[260px]">
        <span className="line-clamp-2">{svc.name}</span>
        <div className="text-[10px] text-gray-400 mt-0.5">{svc.platform}</div>
      </td>
      <td className="px-3 py-2 font-semibold text-blue-700 whitespace-nowrap">
        ${fmt(svc.rate)}
      </td>
      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
        ${fmt(svc.providerRate)}{" "}
        <span className="text-orange-500 font-semibold">+{svc.adminCommission}%</span>
      </td>
      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
        {Number(svc.min).toLocaleString()} / {Number(svc.max).toLocaleString()}
      </td>
      <td className="px-3 py-2 text-center">
        {svc.description
          ? <button onClick={(e) => { e.stopPropagation(); onShowDesc(svc.description); }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-[3px] rounded text-[10px] transition">
              Info
            </button>
          : <span className="text-gray-300 text-[10px]">—</span>}
      </td>
    </tr>
  );
}

export default function CPPlatformServicesTab({ onImportDone }) {
  const [services, setServices]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting]             = useState(false);
  const [importingCat, setImportingCat]       = useState(null);
  const [descText, setDescText]               = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/cp/services/platform");
        
        setServices(res.data || []);
      } catch {
        toast.error("Failed to load platform services");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
const 
const grouped = useMemo(() => {
  const q = search.toLowerCase();
  const filtered = q
    ? services.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          String(s.serviceId || "").includes(q) ||
          s.category?.toLowerCase().includes(q)
      )
    : services;

  const map = {};
  filtered.forEach((s) => {
    const cat = s.category || "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(s);
  });

  Object.values(map).forEach((svcs) =>
    svcs.sort((a, b) => a.serviceId - b.serviceId)
  );

  return Object.entries(map).sort(
    (a, b) =>
      a[1].reduce((m, s) => Math.min(m, s.serviceId), Infinity) -
      b[1].reduce((m, s) => Math.min(m, s.serviceId), Infinity)
  );
}, [services, search]);
  

  const allServices = useMemo(() => grouped.flatMap(([, svcs]) => svcs), [grouped]);

  const toggleSelect = (id) =>
    setSelectedToImport((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleCatSelect = (svcs) => {
    const ids = svcs.map((s) => s._id);
    setSelectedToImport((p) => {
      const n = new Set(p);
      const allSel = ids.every((id) => n.has(id));
      ids.forEach((id) => allSel ? n.delete(id) : n.add(id));
      return n;
    });
  };

  const importSelected = async () => {
    if (!selectedToImport.size) return toast.error("Select at least one service");
    setImporting(true);
    try {
      await API.post("/cp/services/import-platform", { serviceIds: [...selectedToImport] });
      toast.success(`${selectedToImport.size} platform service(s) enabled`);
      setSelectedToImport(new Set());
      onImportDone();
    } catch {
      toast.error("Failed to enable services");
    } finally {
      setImporting(false);
    }
  };

  const importCategory = async (category, svcs) => {
    setImportingCat(category);
    try {
      await API.post("/cp/services/import-platform", { serviceIds: svcs.map((s) => s._id) });
      toast.success(`Category "${category}" enabled (${svcs.length} services)`);
      onImportDone();
    } catch {
      toast.error("Failed to enable category");
    } finally {
      setImportingCat(null);
    }
  };

  // Platform table has an extra column (Raw / Admin %), override the shared header
  const platformHeader = (
    <thead>
      <tr className="bg-blue-600 text-white text-left text-[11px] uppercase tracking-wide">
        <th className="px-3 py-2 w-8" />
        <th className="px-3 py-2">ID</th>
        <th className="px-3 py-2">Service Name</th>
        <th className="px-3 py-2">Your Cost</th>
        <th className="px-3 py-2">Raw / Admin %</th>
        <th className="px-3 py-2">Min / Max</th>
        <th className="px-3 py-2 text-center">Desc</th>
      </tr>
    </thead>
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {descText && <CPImportDescriptionModal text={descText} onClose={() => setDescText(null)} />}

      {/* Info + bulk bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-sm text-gray-600 max-w-xl">
          Services published by the main admin. Rate shown is <strong>after admin commission</strong> — your cost.
          End users see: <strong>this rate + your commission%</strong>.
        </p>
        <div className="flex items-center gap-2">
          {allServices.length > 0 && selectedToImport.size === 0 && (
            <button onClick={() => setSelectedToImport(new Set(allServices.map((s) => s._id)))}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Select All
            </button>
          )}
          {selectedToImport.size > 0 && (
            <>
              <button onClick={() => setSelectedToImport(new Set())}
                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
                Clear
              </button>
              <button onClick={importSelected} disabled={importing}
                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 font-semibold">
                <FiDownload size={13} />
                {importing ? "Enabling..." : `Enable ${selectedToImport.size} Selected`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search platform services..."
          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {/* Categories */}
      <div className="space-y-2 overflow-y-auto pr-1">
        {grouped.map(([cat, svcs]) => (
          <CPImportCategoryBlock
            key={cat}
            category={cat}
            services={svcs}
            selectedToImport={selectedToImport}
            onToggleSelect={toggleSelect}
            onToggleCat={toggleCatSelect}
            onImportCategory={importCategory}
            onShowDesc={setDescText}
            importingCat={importingCat}
            idKey="_id"
            renderRow={PlatformServiceRow}
            headerOverride={platformHeader}
          />
        ))}
        {grouped.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            {search ? "No matching services" : "No platform services available yet — ask your admin to publish some"}
          </div>
        )}
      </div>
    </div>
  );
    }
