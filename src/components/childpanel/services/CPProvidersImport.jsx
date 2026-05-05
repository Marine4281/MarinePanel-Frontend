// src/components/childpanel/services/CPProvidersImport.jsx
// Two sub-tabs: own provider APIs + platform services from main admin

import { useState, useEffect, useCallback } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import {
  FiPlus, FiRefreshCw, FiSearch, FiX, FiCheck,
  FiChevronDown, FiChevronUp, FiLink, FiEye, FiEyeOff, FiGrid,
} from "react-icons/fi";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Badge({ children, color = "gray" }) {
  const map = { gray: "bg-gray-100 text-gray-600", green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[color] || map.gray}`}>{children}</span>;
}

// ── Add Provider Modal ──
function AddProviderModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", apiUrl: "", apiKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.apiUrl || !form.apiKey) return toast.error("All fields required");
    setLoading(true);
    try {
      const res = await API.post("/cp/providers/profiles", form);
      toast.success("Provider connected");
      onAdded(res.data.provider);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Connect a Provider</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
        </div>
        {[
          { label: "Provider Name", key: "name", placeholder: "e.g. SMMKings", type: "text" },
          { label: "API URL", key: "apiUrl", placeholder: "https://provider.com/api/v2", type: "url" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
            <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">API Key</label>
          <div className="relative">
            <input type={showKey ? "text" : "password"} value={form.apiKey} onChange={set("apiKey")} placeholder="Secret API key"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button type="button" onClick={() => setShowKey((s) => !s)} className="absolute right-3 top-2.5 text-gray-400">
              {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Own Providers Sub-tab ──
function OwnProvidersTab({ onImportDone }) {
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});

  const loadProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await API.get("/cp/providers/profiles");
      setProviders(res.data || []);
    } catch { toast.error("Failed to load providers"); }
    finally { setLoadingProviders(false); }
  }, []);

  useEffect(() => { loadProviders(); }, [loadProviders]);

  const fetchFromProvider = async (provider) => {
    setSelectedProvider(provider);
    setFetchedCategories([]);
    setSelectedToImport(new Set());
    setFetching(true);
    try {
      const res = await API.post("/cp/providers/services", { provider: provider.name });
      setFetchedCategories(res.data || []);
    } catch { toast.error("Failed to fetch services"); }
    finally { setFetching(false); }
  };

  const allFetched = fetchedCategories.flatMap((c) => c.services || []);

  const filteredCats = fetchedCategories.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (s) => s.name?.toLowerCase().includes(search.toLowerCase()) || String(s.service).includes(search)
    ),
  })).filter((c) => c.services.length > 0);

  const toggleSelect = (id) => setSelectedToImport((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCatSelect = (svcs) => {
    const ids = svcs.map((s) => s.service);
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
      const toImport = allFetched.filter((s) => selectedToImport.has(s.service));
      await API.post("/cp/providers/import-selected", { provider: selectedProvider.name, services: toImport });
      toast.success(`Imported ${selectedToImport.size} service(s)`);
      setSelectedToImport(new Set());
      setFetchedCategories([]);
      setSelectedProvider(null);
      onImportDone();
    } catch { toast.error("Import failed"); }
    finally { setImporting(false); }
  };

  return (
    <div className="space-y-6">
      {showAddProvider && (
        <AddProviderModal onClose={() => setShowAddProvider(false)} onAdded={(p) => setProviders((prev) => [p, ...prev])} />
      )}

      {/* Provider Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 text-sm">Your Provider Connections</h3>
          <button onClick={() => setShowAddProvider(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiPlus size={13} /> Add Provider
          </button>
        </div>

        {loadingProviders ? <Spinner /> : providers.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <FiLink size={28} className="text-gray-300" />
            <p className="font-semibold text-gray-600">No providers connected</p>
            <button onClick={() => setShowAddProvider(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              <FiPlus size={14} /> Connect Provider
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map((p) => (
              <div key={p._id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{p.apiUrl}</p>
                  </div>
                  <Badge color="green">Live</Badge>
                </div>
                <button onClick={() => fetchFromProvider(p)} disabled={fetching && selectedProvider?._id === p._id}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-blue-500 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-60">
                  <FiRefreshCw size={12} className={fetching && selectedProvider?._id === p._id ? "animate-spin" : ""} />
                  {fetching && selectedProvider?._id === p._id ? "Fetching..." : "Fetch Services"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fetched Services Panel */}
      {selectedProvider && (
        <div className="border border-blue-200 rounded-2xl bg-blue-50/40 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-gray-800">Services from <span className="text-blue-600">{selectedProvider.name}</span></p>
              <p className="text-xs text-gray-500">{fetching ? "Loading..." : `${allFetched.length} found · ${selectedToImport.size} selected`}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedToImport.size > 0 && (
                <button onClick={importSelected} disabled={importing}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
                  <FiCheck size={13} /> {importing ? "Importing..." : `Import ${selectedToImport.size}`}
                </button>
              )}
              <button onClick={() => { setSelectedProvider(null); setFetchedCategories([]); setSelectedToImport(new Set()); }}
                className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
            </div>
          </div>

          {fetching ? <Spinner /> : (
            <>
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredCats.map(({ category, services: svcs }) => {
                  const isOpen = expandedCats[category] !== false;
                  const allSel = svcs.every((s) => selectedToImport.has(s.service));
                  return (
                    <div key={category} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedCats((p) => ({ ...p, [category]: !isOpen }))}>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={allSel} onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleCatSelect(svcs)} className="accent-blue-600" />
                          <span className="font-semibold text-sm text-gray-700">{category}</span>
                          <Badge>{svcs.length}</Badge>
                        </div>
                        {isOpen ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                      </div>
                      {isOpen && (
                        <div className="divide-y divide-gray-100">
                          {svcs.map((svc) => (
                            <label key={svc.service} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <input type="checkbox" checked={selectedToImport.has(svc.service)}
                                onChange={() => toggleSelect(svc.service)} className="accent-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{svc.name}</p>
                                <p className="text-xs text-gray-400">ID: {svc.service} · Min {svc.min} / Max {svc.max}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-semibold text-blue-700">${fmt(svc.rate)}</span>
                                {svc.statusLabel === "imported" && <div className="text-[10px] text-green-600">Imported</div>}
                                {svc.statusLabel === "updated" && (
                                  <div className={`text-[10px] ${svc.rateDiff > 0 ? "text-red-500" : "text-green-600"}`}>
                                    {svc.rateDiff > 0 ? "+" : ""}{Number(svc.rateDiff).toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Platform Services Sub-tab ──
function PlatformServicesTab({ onImportDone }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // This endpoint returns platform services with admin commission already applied
        const res = await API.get("/cp/services/platform");
        setServices(res.data || []);
      } catch { toast.error("Failed to load platform services"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const grouped = services.reduce((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, svcs]) => {
    const f = svcs.filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) || String(s.serviceId || "").includes(search)
    );
    if (f.length) acc[cat] = f;
    return acc;
  }, {});

  const toggleSelect = (id) => setSelectedToImport((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCatSelect = (svcs) => {
    const ids = svcs.map((s) => s._id);
    setSelectedToImport((p) => {
      const n = new Set(p);
      const allSel = ids.every((id) => n.has(id));
      ids.forEach((id) => allSel ? n.delete(id) : n.add(id));
      return n;
    });
  };

  // "Importing" a platform service means enabling it for this CP panel
  // by storing it in the CP's Service list with cpOwner set
  const importSelected = async () => {
    if (!selectedToImport.size) return toast.error("Select at least one service");
    setImporting(true);
    try {
      const toImport = services.filter((s) => selectedToImport.has(s._id));
      // Post each as a new CP service with source=platform
      await API.post("/cp/services/import-platform", { serviceIds: toImport.map((s) => s._id) });
      toast.success(`${selectedToImport.size} platform service(s) enabled`);
      setSelectedToImport(new Set());
      onImportDone();
    } catch { toast.error("Failed to enable services"); }
    finally { setImporting(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600">
          These services are published by the main admin.
          The rate shown is <strong>after admin commission</strong> — your cost.
          Your end users will see: <strong>this rate + your commission%</strong>.
        </p>
        {selectedToImport.size > 0 && (
          <button onClick={importSelected} disabled={importing}
            className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
            <FiCheck size={13} /> {importing ? "Enabling..." : `Enable ${selectedToImport.size} Selected`}
          </button>
        )}
      </div>

      <div className="relative">
        <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search platform services..."
          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {Object.entries(filteredGrouped).map(([cat, svcs]) => {
          const isOpen = expandedCats[cat] !== false;
          const allSel = svcs.every((s) => selectedToImport.has(s._id));
          return (
            <div key={cat} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedCats((p) => ({ ...p, [cat]: !isOpen }))}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={allSel} onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleCatSelect(svcs)} className="accent-blue-600" />
                  <span className="font-semibold text-sm text-gray-700">{cat}</span>
                  <Badge>{svcs.length}</Badge>
                </div>
                {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </div>
              {isOpen && (
                <div className="divide-y divide-gray-100">
                  {svcs.map((svc) => (
                    <label key={svc._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedToImport.has(svc._id)}
                        onChange={() => toggleSelect(svc._id)} className="accent-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{svc.name}</p>
                        <p className="text-xs text-gray-400">#{svc.serviceId} · {svc.platform} · Min {svc.min?.toLocaleString()} / Max {svc.max?.toLocaleString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-700">Your cost: ${fmt(svc.rate)}</p>
                        <p className="text-[10px] text-gray-400">Raw: ${fmt(svc.providerRate)} + {svc.adminCommission}% admin</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {Object.keys(filteredGrouped).length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            {search ? "No matching services" : "No platform services available yet — ask your admin to publish some"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Export ──
const IMPORT_TABS = [
  { key: "own",      label: "Own Provider APIs", icon: <FiLink size={13} /> },
  { key: "platform", label: "Platform Services",  icon: <FiGrid size={13} /> },
];

export default function CPProvidersImport({ onImportDone }) {
  const [subTab, setSubTab] = useState("own");

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {IMPORT_TABS.map((t) => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === t.key ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {subTab === "own"      && <OwnProvidersTab      onImportDone={onImportDone} />}
      {subTab === "platform" && <PlatformServicesTab  onImportDone={onImportDone} />}
    </div>
  );
}
