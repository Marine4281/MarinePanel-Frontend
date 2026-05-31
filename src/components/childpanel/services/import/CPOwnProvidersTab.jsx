// src/components/childpanel/services/import/CPOwnProvidersTab.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiPlus, FiRefreshCw, FiSearch, FiX, FiDownload, FiLink } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";
import Badge from "./CPImportBadge";
import CPImportCategoryBlock from "./CPImportCategoryBlock";
import CPImportAddProviderModal from "./CPImportAddProviderModal";
import CPImportDescriptionModal from "./CPImportDescriptionModal";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function OwnServiceRow(svc, i, isSel, onToggleSelect, onShowDesc) {
  const isEven = i % 2 === 0;
  return (
    <tr
      key={svc.service}
      className={`border-b last:border-none transition-colors hover:bg-blue-50/40 cursor-pointer
        ${isSel ? "bg-blue-50" : isEven ? "bg-white" : "bg-gray-50"}`}
      onClick={() => onToggleSelect(svc.service)}
    >
      <td className="px-3 py-2">
        <input type="checkbox" checked={isSel}
          onChange={() => onToggleSelect(svc.service)}
          onClick={(e) => e.stopPropagation()}
          className="accent-blue-600" />
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
        {svc.description
          ? <button onClick={(e) => { e.stopPropagation(); onShowDesc(svc.description); }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-[3px] rounded text-[10px] transition">
              Info
            </button>
          : <span className="text-gray-300 text-[10px]">—</span>}
      </td>
      <td className="px-3 py-2 text-center">
        {svc.statusLabel === "imported" && (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Imported</span>
        )}
        {svc.statusLabel === "updated" && (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Updated</span>
        )}
        {!svc.statusLabel && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">New</span>
        )}
      </td>
    </tr>
  );
}

export default function CPOwnProvidersTab({ onImportDone }) {
  const [providers, setProviders]               = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showAddProvider, setShowAddProvider]   = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetching, setFetching]                 = useState(false);
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting]               = useState(false);
  const [importingCat, setImportingCat]         = useState(null);
  const [search, setSearch]                     = useState("");
  const [descText, setDescText]                 = useState(null);

  const loadProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await API.get("/cp/providers/profiles");
      setProviders((res.data || []).slice().reverse()); // newest first
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
      
      setFetchedCategories(res.data || []);
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
          (s) => s.name?.toLowerCase().includes(q) || String(s.service).includes(q)
        ),
      }))
      .filter((c) => c.services.length > 0);
  }, [fetchedCategories, search]);

  const toggleSelect = (id) =>
    setSelectedToImport((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

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
        provider: selectedProvider.name, category, services: svcs,
      });
      toast.success(`Category "${category}" imported (${svcs.length} services)`);
      setFetchedCategories((prev) =>
        prev.map((c) =>
          c.category === category
            ? { ...c, services: c.services.map((s) => ({ ...s, statusLabel: "imported" })) }
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
        <CPImportAddProviderModal
          onClose={() => setShowAddProvider(false)}
          onAdded={(p) => setProviders((prev) => [p, ...prev])}
        />
      )}
      {descText && <CPImportDescriptionModal text={descText} onClose={() => setDescText(null)} />}

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
                <button onClick={() => fetchFromProvider(p)}
                  disabled={fetching && selectedProvider?._id === p._id}
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
        <div className="border border-blue-200 rounded-2xl bg-blue-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-gray-800">
                Services from <span className="text-blue-600">{selectedProvider.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                {fetching ? "Loading..." : `${allFetched.length} found · ${selectedToImport.size} selected`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!fetching && allFetched.length > 0 && (
                <>
                  <button onClick={() => setSelectedToImport(new Set(allFetched.map((s) => s.service)))}
                    className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                    Select All
                  </button>
                  {selectedToImport.size > 0 && (
                    <button onClick={() => setSelectedToImport(new Set())}
                      className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
                      Clear
                    </button>
                  )}
                </>
              )}
              {selectedToImport.size > 0 && (
                <button onClick={importSelected} disabled={importing}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 font-semibold">
                  <FiDownload size={13} />
                  {importing ? "Importing..." : `Import ${selectedToImport.size} Selected`}
                </button>
              )}
              <button onClick={() => { setSelectedProvider(null); setFetchedCategories([]); setSelectedToImport(new Set()); }}
                className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>
          </div>

          {fetching ? <Spinner /> : (
            <>
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services by name or ID..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
              </div>

              <div className="space-y-2 overflow-y-auto pr-1">
                {filteredCats.map(({ category, services: svcs }) => (
                  <CPImportCategoryBlock
                    key={category}
                    category={category}
                    services={svcs}
                    selectedToImport={selectedToImport}
                    onToggleSelect={toggleSelect}
                    onToggleCat={toggleCatSelect}
                    onImportCategory={importCategory}
                    onShowDesc={setDescText}
                    importingCat={importingCat}
                    idKey="service"
                    renderRow={OwnServiceRow}
                    headerExtra={
                      svcs.filter((s) => s.statusLabel === "imported").length > 0
                        ? <Badge color="green">{svcs.filter((s) => s.statusLabel === "imported").length} imported</Badge>
                        : null
                    }
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
