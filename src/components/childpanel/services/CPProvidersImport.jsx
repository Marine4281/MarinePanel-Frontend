// src/components/childpanel/services/CPProvidersImport.jsx
// Provider API connection + service import tab for the CP owner.
// Extracted from old ChildPanelServices.jsx into a standalone component.

import { useState, useEffect, useCallback } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import {
  FiPlus, FiRefreshCw, FiSearch, FiX, FiCheck,
  FiChevronDown, FiChevronUp, FiLink, FiZap, FiEye, FiEyeOff,
  FiTrash2, FiEdit2,
} from "react-icons/fi";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[color]}`}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Add Provider Modal ──
function AddProviderModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", apiUrl: "", apiKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.apiUrl || !form.apiKey) {
      return toast.error("All fields required");
    }
    setLoading(true);
    try {
      const res = await API.post("/cp/providers/profiles", form);
      toast.success("Provider connected");
      onAdded(res.data.provider);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect provider");
    } finally {
      setLoading(false);
    }
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
            <input type={showKey ? "text" : "password"} value={form.apiKey} onChange={set("apiKey")}
              placeholder="Your secret API key"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button type="button" onClick={() => setShowKey((s) => !s)} className="absolute right-3 top-2.5 text-gray-400">
              {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function CPProvidersImport({ onImportDone }) {
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showAddProvider, setShowAddProvider] = useState(false);

  // Fetch flow
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  const loadProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await API.get("/cp/providers/profiles");
      setProviders(res.data || []);
    } catch {
      toast.error("Failed to load providers");
    } finally {
      setLoadingProviders(false);
    }
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
    } catch {
      toast.error("Failed to fetch services from provider");
    } finally {
      setFetching(false);
    }
  };

  // All fetched services flattened
  const allFetched = fetchedCategories.flatMap((c) => c.services || []);

  const filteredCategories = fetchedCategories.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(s.service).includes(search)
    ),
  })).filter((c) => c.services.length > 0);

  const toggleCategory = (cat) =>
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const toggleSelect = (id) =>
    setSelectedToImport((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCategorySelect = (svcs) => {
    const ids = svcs.map((s) => s.service);
    setSelectedToImport((prev) => {
      const next = new Set(prev);
      const allSel = ids.every((id) => next.has(id));
      if (allSel) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const importSelected = async () => {
    if (!selectedToImport.size) return toast.error("Select at least one service");
    setImporting(true);
    try {
      const toImport = allFetched.filter((s) => selectedToImport.has(s.service));
      await API.post("/cp/providers/import-selected", {
        provider: selectedProvider.name,
        services: toImport,
      });
      toast.success(`Imported ${selectedToImport.size} service(s)`);
      setSelectedToImport(new Set());
      setFetchedCategories([]);
      setSelectedProvider(null);
      onImportDone();
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showAddProvider && (
        <AddProviderModal
          onClose={() => setShowAddProvider(false)}
          onAdded={(p) => setProviders((prev) => [p, ...prev])}
        />
      )}

      {/* Provider Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 text-sm">Your Provider Connections</h3>
          <button
            onClick={() => setShowAddProvider(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus size={13} /> Add Provider
          </button>
        </div>

        {loadingProviders ? <Spinner /> : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <FiLink size={28} className="text-gray-300" />
            <p className="font-semibold text-gray-600">No providers connected</p>
            <p className="text-sm text-gray-400">Connect an SMM provider API to import services.</p>
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
                <button
                  onClick={() => fetchFromProvider(p)}
                  disabled={fetching && selectedProvider?._id === p._id}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-blue-500 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-60"
                >
                  <FiRefreshCw size={12} className={fetching && selectedProvider?._id === p._id ? "animate-spin" : ""} />
                  {fetching && selectedProvider?._id === p._id ? "Fetching..." : "Fetch Services"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fetched Services */}
      {selectedProvider && (
        <div className="border border-blue-200 rounded-2xl bg-blue-50/40 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-gray-800">
                Services from <span className="text-blue-600">{selectedProvider.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                {fetching ? "Loading..." : `${allFetched.length} services found — ${selectedToImport.size} selected`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedToImport.size > 0 && (
                <button
                  onClick={importSelected}
                  disabled={importing}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  <FiCheck size={13} />
                  {importing ? "Importing..." : `Import ${selectedToImport.size} Selected`}
                </button>
              )}
              <button
                onClick={() => { setSelectedProvider(null); setFetchedCategories([]); setSelectedToImport(new Set()); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {fetching ? <Spinner /> : (
            <>
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredCategories.map(({ category, services: svcs }) => {
                  const isOpen = expandedCategories[category] !== false;
                  const allSel = svcs.every((s) => selectedToImport.has(s.service));
                  return (
                    <div key={category} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                      <div
                        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={allSel}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleCategorySelect(svcs)}
                            className="accent-blue-600" />
                          <span className="font-semibold text-sm text-gray-700">{category}</span>
                          <Badge color="gray">{svcs.length}</Badge>
                        </div>
                        {isOpen ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                      </div>
                      {isOpen && (
                        <div className="divide-y divide-gray-100">
                          {svcs.map((svc) => (
                            <label key={svc.service} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <input type="checkbox" checked={selectedToImport.has(svc.service)}
                                onChange={() => toggleSelect(svc.service)}
                                className="accent-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{svc.name}</p>
                                <p className="text-xs text-gray-400">
                                  ID: {svc.service} · Min {svc.min} / Max {svc.max}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-semibold text-blue-700">${fmt(svc.rate)}</span>
                                {svc.statusLabel === "imported" && (
                                  <div className="text-[10px] text-green-600">Imported</div>
                                )}
                                {svc.statusLabel === "updated" && (
                                  <div className={`text-[10px] ${svc.rateDiff > 0 ? "text-red-500" : "text-green-600"}`}>
                                    {svc.rateDiff > 0 ? "+" : ""}{Number(svc.rateDiff).toFixed(4)} change
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
