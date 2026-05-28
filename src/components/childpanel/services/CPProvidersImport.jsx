// src/components/childpanel/services/CPProvidersImport.jsx
// Mirrors main-platform UX: newest-first, visible category headers,
// tap-to-expand, import category, bulk import, toggle description.

import { useState, useEffect, useCallback, useMemo } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import {
  FiPlus, FiRefreshCw, FiSearch, FiX, FiCheck,
  FiChevronDown, FiChevronUp, FiLink, FiEye, FiEyeOff,
  FiGrid, FiInfo, FiDownload, FiPackage,
} from "react-icons/fi";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────
function Badge({ children, color = "gray" }) {
  const map = {
    gray:   "bg-gray-100 text-gray-600",
    green:  "bg-green-100 text-green-700",
    blue:   "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}

// ─── Description Modal ──────────────────────────────────────────────────────
function DescriptionModal({ text, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FiInfo size={16} className="text-blue-500" /> Service Description
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {text || "No description available."}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Add Provider Modal ─────────────────────────────────────────────────────
function AddProviderModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", apiUrl: "", apiKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.apiUrl || !form.apiKey)
      return toast.error("All fields required");
    setLoading(true);
    try {
      const res = await API.post("/cp/providers/profiles", form);
      toast.success("Provider connected");
      onAdded(res.data.provider);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect");
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
          { label: "API URL",       key: "apiUrl", placeholder: "https://provider.com/api/v2", type: "url" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
            <input
              type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"} value={form.apiKey} onChange={set("apiKey")} placeholder="Secret API key"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="button" onClick={() => setShowKey((s) => !s)} className="absolute right-3 top-2.5 text-gray-400">
              {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">Cancel</button>
          <button
            onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Block (own provider) ─────────────────────────────────────────
function OwnCategoryBlock({
  category, services: svcs, selectedToImport, onToggleSelect,
  onToggleCat, onImportCategory, onShowDesc, providerName, importingCat,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const allSel  = svcs.length > 0 && svcs.every((s) => selectedToImport.has(s.service));
  const someSel = svcs.some((s) => selectedToImport.has(s.service));
  const importedCount = svcs.filter((s) => s.statusLabel === "imported").length;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Category header — same style as main platform */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="checkbox"
            checked={allSel}
            ref={(el) => { if (el) el.indeterminate = !allSel && someSel; }}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleCat(svcs)}
            className="accent-blue-600"
          />
          <span className="font-bold text-sm text-gray-700">📦 {category}</span>
          <Badge color="gray">{svcs.length}</Badge>
          {importedCount > 0 && <Badge color="green">{importedCount} imported</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {/* Import Category button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImportCategory(category, svcs);
            }}
            disabled={importingCat === category}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-semibold"
          >
            <FiPackage size={11} />
            {importingCat === category ? "Importing..." : "Import Category"}
          </button>
          {isOpen ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Services table */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-full">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-[11px] uppercase tracking-wide">
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Service Name</th>
                <th className="px-3 py-2">Rate</th>
                <th className="px-3 py-2">Min / Max</th>
                <th className="px-3 py-2 text-center">Desc</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {svcs.map((svc, i) => {
                const isEven = i % 2 === 0;
                const isSel  = selectedToImport.has(svc.service);
                return (
                  <tr
                    key={svc.service}
                    className={`border-b last:border-none transition-colors hover:bg-blue-50/40 cursor-pointer
                      ${isSel ? "bg-blue-50" : isEven ? "bg-white" : "bg-gray-50"}`}
                    onClick={() => onToggleSelect(svc.service)}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox" checked={isSel}
                        onChange={() => onToggleSelect(svc.service)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-blue-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-500 font-mono">{svc.service}</td>
                    <td className="px-3 py-2 font-medium text-gray-800 min-w-[160px] max-w-[260px]">
                      <span className="line-clamp-2">{svc.name}</span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-blue-700 whitespace-nowrap">
                      ${fmt(svc.rate)}
                      {svc.statusLabel === "updated" && (
                        <div className={`text-[10px] font-normal ${svc.rateDiff > 0 ? "text-red-500" : "text-green-600"}`}>
                          {svc.rateDiff > 0 ? "+" : ""}{Number(svc.rateDiff).toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                      {Number(svc.min).toLocaleString()} / {Number(svc.max).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {svc.description ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowDesc(svc.description); }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-[3px] rounded text-[10px] transition"
                        >
                          Info
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {svc.statusLabel === "imported" && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Imported
                        </span>
                      )}
                      {svc.statusLabel === "updated" && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                          Updated
                        </span>
                      )}
                      {!svc.statusLabel && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">New</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Own Providers Sub-tab ──────────────────────────────────────────────────
function OwnProvidersTab({ onImportDone }) {
  const [providers, setProviders]           = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showAddProvider, setShowAddProvider]   = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetching, setFetching]             = useState(false);
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting]           = useState(false);
  const [importingCat, setImportingCat]     = useState(null);
  const [search, setSearch]                 = useState("");
  const [descText, setDescText]             = useState(null);

  const loadProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await API.get("/cp/providers/profiles");
      // Newest first
      setProviders((res.data || []).slice().reverse());
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
    setSearch("");
    setFetching(true);
    try {
      const res = await API.post("/cp/providers/services", { provider: provider.name });
      // Keep newest-first within each category (they come indexed, so reverse)
      const cats = (res.data || []).map((c) => ({
        ...c,
        services: [...(c.services || [])].reverse(),
      }));
      setFetchedCategories(cats);
    } catch {
      toast.error("Failed to fetch services");
    } finally {
      setFetching(false);
    }
  };

  const allFetched = useMemo(
    () => fetchedCategories.flatMap((c) => c.services || []),
    [fetchedCategories]
  );

  const filteredCats = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return fetchedCategories;
    return fetchedCategories
      .map((cat) => ({
        ...cat,
        services: cat.services.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            String(s.service).includes(q)
        ),
      }))
      .filter((c) => c.services.length > 0);
  }, [fetchedCategories, search]);

  const toggleSelect = (id) =>
    setSelectedToImport((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleCatSelect = (svcs) => {
    const ids = svcs.map((s) => s.service);
    setSelectedToImport((p) => {
      const n = new Set(p);
      const allSel = ids.every((id) => n.has(id));
      ids.forEach((id) => (allSel ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  const selectAll = () => {
    setSelectedToImport(new Set(allFetched.map((s) => s.service)));
  };

  const clearAll = () => setSelectedToImport(new Set());

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

  const importCategory = async (category, svcs) => {
    setImportingCat(category);
    try {
      await API.post("/cp/providers/import-category", {
        provider: selectedProvider.name,
        category,
        services: svcs,
      });
      toast.success(`Category "${category}" imported (${svcs.length} services)`);
      // Mark them as imported in local state
      setFetchedCategories((prev) =>
        prev.map((c) =>
          c.category === category
            ? {
                ...c,
                services: c.services.map((s) => ({ ...s, statusLabel: "imported" })),
              }
            : c
        )
      );
      onImportDone();
    } catch {
      toast.error("Category import failed");
    } finally {
      setImportingCat(null);
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
      {descText && (
        <DescriptionModal text={descText} onClose={() => setDescText(null)} />
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

        {loadingProviders ? (
          <Spinner />
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <FiLink size={28} className="text-gray-300" />
            <p className="font-semibold text-gray-600">No providers connected</p>
            <button
              onClick={() => setShowAddProvider(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
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
                  <FiRefreshCw
                    size={12}
                    className={fetching && selectedProvider?._id === p._id ? "animate-spin" : ""}
                  />
                  {fetching && selectedProvider?._id === p._id ? "Fetching..." : "Fetch Services"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fetched Services Panel */}
      {selectedProvider && (
        <div className="border border-blue-200 rounded-2xl bg-blue-50/30 p-5 space-y-4">
          {/* Panel header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-gray-800">
                Services from{" "}
                <span className="text-blue-600">{selectedProvider.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                {fetching
                  ? "Loading..."
                  : `${allFetched.length} found · ${selectedToImport.size} selected`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!fetching && allFetched.length > 0 && (
                <>
                  <button
                    onClick={selectAll}
                    className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Select All
                  </button>
                  {selectedToImport.size > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
              {selectedToImport.size > 0 && (
                <button
                  onClick={importSelected}
                  disabled={importing}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 font-semibold"
                >
                  <FiDownload size={13} />
                  {importing ? "Importing..." : `Import ${selectedToImport.size} Selected`}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setFetchedCategories([]);
                  setSelectedToImport(new Set());
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {fetching ? (
            <Spinner />
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services by name or ID..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredCats.map(({ category, services: svcs }) => (
                  <OwnCategoryBlock
                    key={category}
                    category={category}
                    services={svcs}
                    selectedToImport={selectedToImport}
                    onToggleSelect={toggleSelect}
                    onToggleCat={toggleCatSelect}
                    onImportCategory={importCategory}
                    onShowDesc={setDescText}
                    providerName={selectedProvider.name}
                    importingCat={importingCat}
                  />
                ))}
                {filteredCats.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {search ? "No matching services" : "No services returned"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Platform Category Block ────────────────────────────────────────────────
function PlatformCategoryBlock({
  category, services: svcs, selectedToImport, onToggleSelect, onToggleCat,
  onImportCategory, onShowDesc, importingCat,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const allSel  = svcs.length > 0 && svcs.every((s) => selectedToImport.has(s._id));
  const someSel = svcs.some((s) => selectedToImport.has(s._id));

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="checkbox"
            checked={allSel}
            ref={(el) => { if (el) el.indeterminate = !allSel && someSel; }}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleCat(svcs)}
            className="accent-blue-600"
          />
          <span className="font-bold text-sm text-gray-700">📦 {category}</span>
          <Badge color="gray">{svcs.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImportCategory(category, svcs);
            }}
            disabled={importingCat === category}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-semibold"
          >
            <FiPackage size={11} />
            {importingCat === category ? "Enabling..." : "Enable Category"}
          </button>
          {isOpen ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-full">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-[11px] uppercase tracking-wide">
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Service Name</th>
                <th className="px-3 py-2">Your Cost</th>
                <th className="px-3 py-2">Raw / Admin %</th>
                <th className="px-3 py-2">Min / Max</th>
                <th className="px-3 py-2 text-center">Desc</th>
              </tr>
            </thead>
            <tbody>
              {svcs.map((svc, i) => {
                const isEven = i % 2 === 0;
                const isSel  = selectedToImport.has(svc._id);
                return (
                  <tr
                    key={svc._id}
                    className={`border-b last:border-none transition-colors hover:bg-blue-50/40 cursor-pointer
                      ${isSel ? "bg-blue-50" : isEven ? "bg-white" : "bg-gray-50"}`}
                    onClick={() => onToggleSelect(svc._id)}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox" checked={isSel}
                        onChange={() => onToggleSelect(svc._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-blue-600"
                      />
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
                      {svc.description ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowDesc(svc.description); }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-[3px] rounded text-[10px] transition"
                        >
                          Info
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Platform Services Sub-tab ──────────────────────────────────────────────
function PlatformServicesTab({ onImportDone }) {
  const [services, setServices]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting]           = useState(false);
  const [importingCat, setImportingCat]     = useState(null);
  const [descText, setDescText]             = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/cp/services/platform");
        // Newest at top within each load (sort by _id desc as proxy for createdAt)
        const sorted = (res.data || []).slice().sort((a, b) =>
          (b._id || "").localeCompare(a._id || "")
        );
        setServices(sorted);
      } catch {
        toast.error("Failed to load platform services");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group by category, preserving newest-first within each
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
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [services, search]);

  const allServices = useMemo(() => grouped.flatMap(([, svcs]) => svcs), [grouped]);

  const toggleSelect = (id) =>
    setSelectedToImport((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleCatSelect = (svcs) => {
    const ids = svcs.map((s) => s._id);
    setSelectedToImport((p) => {
      const n = new Set(p);
      const allSel = ids.every((id) => n.has(id));
      ids.forEach((id) => (allSel ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  const importSelected = async () => {
    if (!selectedToImport.size) return toast.error("Select at least one service");
    setImporting(true);
    try {
      await API.post("/cp/services/import-platform", {
        serviceIds: [...selectedToImport],
      });
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
      await API.post("/cp/services/import-platform", {
        serviceIds: svcs.map((s) => s._id),
      });
      toast.success(`Category "${category}" enabled (${svcs.length} services)`);
      onImportDone();
    } catch {
      toast.error("Failed to enable category");
    } finally {
      setImportingCat(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {descText && (
        <DescriptionModal text={descText} onClose={() => setDescText(null)} />
      )}

      {/* Info + bulk action bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-sm text-gray-600 max-w-xl">
          These are services published by the main admin. Rate shown is{" "}
          <strong>after admin commission</strong> — your cost. End users see:{" "}
          <strong>this rate + your commission%</strong>.
        </p>
        <div className="flex items-center gap-2">
          {selectedToImport.size > 0 && (
            <>
              <button
                onClick={() => setSelectedToImport(new Set())}
                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={importSelected}
                disabled={importing}
                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 font-semibold"
              >
                <FiDownload size={13} />
                {importing ? "Enabling..." : `Enable ${selectedToImport.size} Selected`}
              </button>
            </>
          )}
          {allServices.length > 0 && selectedToImport.size === 0 && (
            <button
              onClick={() => setSelectedToImport(new Set(allServices.map((s) => s._id)))}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Select All
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search platform services..."
          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {grouped.map(([cat, svcs]) => (
          <PlatformCategoryBlock
            key={cat}
            category={cat}
            services={svcs}
            selectedToImport={selectedToImport}
            onToggleSelect={toggleSelect}
            onToggleCat={toggleCatSelect}
            onImportCategory={importCategory}
            onShowDesc={setDescText}
            importingCat={importingCat}
          />
        ))}
        {grouped.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            {search
              ? "No matching services"
              : "No platform services available yet — ask your admin to publish some"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────
const IMPORT_TABS = [
  { key: "own",      label: "Own Provider APIs",  icon: <FiLink size={13} /> },
  { key: "platform", label: "Platform Services",   icon: <FiGrid size={13} /> },
];

export default function CPProvidersImport({ onImportDone }) {
  const [subTab, setSubTab] = useState("own");

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {IMPORT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === t.key
                ? "bg-white shadow text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {subTab === "own"      && <OwnProvidersTab      onImportDone={onImportDone} />}
      {subTab === "platform" && <PlatformServicesTab  onImportDone={onImportDone} />}
    </div>
  );
    }
