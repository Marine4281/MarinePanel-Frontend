// src/pages/childpanel/ChildPanelServices.jsx
//
// Child panel owner — Services Control page.
// Two tabs:
//   1. Platform Services  — toggle which main-panel services are visible
//      to this CP's end users, and set custom markup prices.
//   2. My Provider Services — manage services imported from the CP owner's
//      own provider API connections (uses /cp/providers/* endpoints).
//      Includes a quick "Add Provider" shortcut so the owner never has
//      to leave this page.
//
// Service mode context:
//   serviceMode === "platform"  → only Tab 1 is active
//   serviceMode === "own"       → only Tab 2 is active
//   serviceMode === "both"      → both tabs active
//   serviceMode === "none"      → neither; shows setup prompt
//
// Backend endpoints used:
//   GET  /cp/settings              → read serviceMode + settings
//   GET  /cp/providers/profiles    → CP owner's provider API connections
//   POST /cp/providers/services    → fetch live services from a provider API
//   GET  /cp/providers/saved       → CP's already-imported services
//   POST /cp/providers/import      → import selected services
//   PATCH /cp/providers/saved/:id/toggle  → enable/disable a saved service
//   DELETE /cp/providers/saved/:id → remove a saved service
//   GET  /api/services             → all platform services (for Tab 1)
//   (Tab 1 toggle/price endpoints — see note below)

import { useState, useEffect, useCallback } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiLink,
  FiZap,
  FiEye,
  FiEyeOff,
  FiEdit2,
  FiSave,
  FiAlertCircle,
  FiSettings,
} from "react-icons/fi";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
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

function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon size={24} className="text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {sub && <p className="text-sm text-gray-400 max-w-xs">{sub}</p>}
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADD PROVIDER MODAL (quick-add without leaving page)
// ─────────────────────────────────────────────

function AddProviderModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", apiUrl: "", apiKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.apiUrl || !form.apiKey)
      return toast.error("All fields are required");
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Connect a Provider</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Enter your SMM provider API credentials
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {[
          { label: "Provider Name", key: "name", placeholder: "e.g. SMMKings", type: "text" },
          { label: "API URL", key: "apiUrl", placeholder: "https://provider.com/api/v2", type: "url" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => set(key)(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={form.apiKey}
              onChange={(e) => set("apiKey")(e.target.value)}
              placeholder="Your secret API key"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRICE EDIT INLINE
// ─────────────────────────────────────────────

function PriceCell({ service, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(service.customPrice ?? service.rate ?? "");
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    if (val === "" || isNaN(Number(val))) return toast.error("Enter a valid price");
    setSaving(true);
    try {
      await API.patch(`/cp/providers/saved/${service._id}/price`, {
        customPrice: Number(val),
      });
      toast.success("Price updated");
      onSave(service._id, Number(val));
      setEditing(false);
    } catch {
      toast.error("Failed to update price");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 group"
      >
        <span>${fmt(service.customPrice ?? service.rate, 4)}</span>
        <FiEdit2 size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        type="number"
        step="0.0001"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-24 border border-blue-400 rounded px-2 py-1 text-xs focus:outline-none"
      />
      <button onClick={commit} disabled={saving} className="text-green-600 hover:text-green-700">
        <FiCheck size={14} />
      </button>
      <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
        <FiX size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 2 — MY PROVIDER SERVICES
// ─────────────────────────────────────────────

function MyProviderServicesTab() {
  const [providers, setProviders] = useState([]);
  const [savedServices, setSavedServices] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Fetch-from-provider flow
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fetchedServices, setFetchedServices] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [selectedToImport, setSelectedToImport] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  // Modals
  const [showAddProvider, setShowAddProvider] = useState(false);

  // Saved services search
  const [savedSearch, setSavedSearch] = useState("");

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

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await API.get("/cp/providers/saved");
      setSavedServices(res.data || []);
    } catch {
      toast.error("Failed to load saved services");
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
    loadSaved();
  }, [loadProviders, loadSaved]);

  const fetchFromProvider = async (provider) => {
    setSelectedProvider(provider);
    setFetchedServices([]);
    setSelectedToImport(new Set());
    setFetching(true);
    try {
      const res = await API.post("/cp/providers/services", {
        profileId: provider._id,
      });
      setFetchedServices(res.data?.services || []);
    } catch {
      toast.error("Failed to fetch services from provider");
    } finally {
      setFetching(false);
    }
  };

  // Group fetched services by category
  const grouped = fetchedServices.reduce((acc, svc) => {
    const cat = svc.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, svcs]) => {
    const filtered = svcs.filter(
      (s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(s.service).includes(search)
    );
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {});

  const toggleCategory = (cat) =>
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const toggleSelect = (id) =>
    setSelectedToImport((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllInCategory = (svcs) => {
    const ids = svcs.map((s) => s.service);
    setSelectedToImport((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const importSelected = async () => {
    if (!selectedToImport.size) return toast.error("Select at least one service");
    setImporting(true);
    try {
      const toImport = fetchedServices.filter((s) =>
        selectedToImport.has(s.service)
      );
      await API.post("/cp/providers/import", {
        profileId: selectedProvider._id,
        services: toImport,
      });
      toast.success(`Imported ${selectedToImport.size} service(s)`);
      setSelectedToImport(new Set());
      setFetchedServices([]);
      setSelectedProvider(null);
      loadSaved();
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const toggleSaved = async (svc) => {
    try {
      await API.patch(`/cp/providers/saved/${svc._id}/toggle`);
      setSavedServices((prev) =>
        prev.map((s) =>
          s._id === svc._id ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch {
      toast.error("Failed to toggle service");
    }
  };

  const deleteSaved = async (id) => {
    if (!window.confirm("Remove this service?")) return;
    try {
      await API.delete(`/cp/providers/saved/${id}`);
      setSavedServices((prev) => prev.filter((s) => s._id !== id));
      toast.success("Service removed");
    } catch {
      toast.error("Failed to remove service");
    }
  };

  const updateSavedPrice = (id, price) =>
    setSavedServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, customPrice: price } : s))
    );

  const filteredSaved = savedServices.filter(
    (s) =>
      s.name?.toLowerCase().includes(savedSearch.toLowerCase()) ||
      String(s.serviceId || "").includes(savedSearch)
  );

  return (
    <div className="space-y-6">
      {showAddProvider && (
        <AddProviderModal
          onClose={() => setShowAddProvider(false)}
          onAdded={(p) => setProviders((prev) => [p, ...prev])}
        />
      )}

      {/* ── Provider Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 text-sm">
            Your Provider Connections
          </h3>
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
          <EmptyState
            icon={FiLink}
            title="No providers connected"
            sub="Connect an SMM provider API to import services for your end users."
            action={
              <button
                onClick={() => setShowAddProvider(true)}
                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <FiPlus size={14} /> Connect Provider
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map((p) => (
              <div
                key={p._id}
                className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">
                      {p.apiUrl}
                    </p>
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
                    className={
                      fetching && selectedProvider?._id === p._id
                        ? "animate-spin"
                        : ""
                    }
                  />
                  {fetching && selectedProvider?._id === p._id
                    ? "Fetching..."
                    : "Fetch Services"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Fetched Services (import flow) ── */}
      {selectedProvider && (
        <div className="border border-blue-200 rounded-2xl bg-blue-50/40 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-gray-800">
                Services from{" "}
                <span className="text-blue-600">{selectedProvider.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                {fetching
                  ? "Loading..."
                  : `${fetchedServices.length} services found`}
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
                  {importing
                    ? "Importing..."
                    : `Import ${selectedToImport.size} Selected`}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setFetchedServices([]);
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
              <div className="relative">
                <FiSearch
                  size={14}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {Object.entries(filteredGrouped).map(([cat, svcs]) => {
                  const isOpen = expandedCategories[cat] !== false;
                  const allSel = svcs.every((s) =>
                    selectedToImport.has(s.service)
                  );
                  return (
                    <div
                      key={cat}
                      className="border border-gray-200 rounded-xl bg-white overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(cat)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allSel}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => selectAllInCategory(svcs)}
                            className="accent-blue-600"
                          />
                          <span className="font-semibold text-sm text-gray-700">
                            {cat}
                          </span>
                          <Badge color="gray">{svcs.length}</Badge>
                        </div>
                        {isOpen ? (
                          <FiChevronUp size={14} className="text-gray-400" />
                        ) : (
                          <FiChevronDown size={14} className="text-gray-400" />
                        )}
                      </div>

                      {isOpen && (
                        <div className="divide-y divide-gray-100">
                          {svcs.map((svc) => (
                            <label
                              key={svc.service}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedToImport.has(svc.service)}
                                onChange={() => toggleSelect(svc.service)}
                                className="accent-blue-600 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">
                                  {svc.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ID: {svc.service} · Min {svc.min} / Max{" "}
                                  {svc.max}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-blue-700 flex-shrink-0">
                                ${fmt(svc.rate)}
                              </span>
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

      {/* ── Saved / Imported Services ── */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700 text-sm">
            Active Services{" "}
            <span className="text-gray-400 font-normal">
              ({savedServices.length})
            </span>
          </h3>
          <div className="relative">
            <FiSearch
              size={13}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              value={savedSearch}
              onChange={(e) => setSavedSearch(e.target.value)}
              placeholder="Search saved..."
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
            />
          </div>
        </div>

        {loadingSaved ? (
          <Spinner />
        ) : filteredSaved.length === 0 ? (
          <EmptyState
            icon={FiZap}
            title="No services imported yet"
            sub="Fetch services from a provider above and import them."
          />
        ) : (
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 font-semibold">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Cost Price</th>
                    <th className="px-4 py-3">Your Price</th>
                    <th className="px-4 py-3">Min / Max</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSaved.map((svc) => (
                    <tr key={svc._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 max-w-[200px] truncate">
                          {svc.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          #{svc.serviceId || svc.providerServiceId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {svc.category || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        ${fmt(svc.rate)}
                      </td>
                      <td className="px-4 py-3">
                        <PriceCell service={svc} onSave={updateSavedPrice} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {svc.min} / {svc.max}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSaved(svc)}
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                            svc.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {svc.isActive ? (
                            <FiToggleRight size={13} />
                          ) : (
                            <FiToggleLeft size={13} />
                          )}
                          {svc.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteSaved(svc._id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 1 — PLATFORM SERVICES
// ─────────────────────────────────────────────

function PlatformServicesTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/services");
        setServices(res.data || []);
      } catch {
        toast.error("Failed to load platform services");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const togglePlatformService = async (svc) => {
    setSaving((s) => ({ ...s, [svc._id]: true }));
    try {
      await API.patch(`/cp/settings/platform-service/${svc._id}/toggle`);
      setServices((prev) =>
        prev.map((s) =>
          s._id === svc._id
            ? { ...s, cpHidden: !s.cpHidden }
            : s
        )
      );
    } catch {
      toast.error("Failed to toggle service visibility");
    } finally {
      setSaving((s) => ({ ...s, [svc._id]: false }));
    }
  };

  const grouped = services.reduce((acc, svc) => {
    const cat = svc.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const filtered = Object.entries(grouped).reduce((acc, [cat, svcs]) => {
    const f = svcs.filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.serviceId || "").includes(search)
    );
    if (f.length) acc[cat] = f;
    return acc;
  }, {});

  const toggleCat = (cat) =>
    setExpandedCats((p) => ({ ...p, [cat]: !p[cat] }));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <FiAlertCircle size={15} className="flex-shrink-0" />
        <span>
          Toggle services on/off to control what your end users can order.
          All prices are inherited from the main platform.
        </span>
      </div>

      <div className="relative">
        <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search platform services..."
          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="space-y-2">
        {Object.entries(filtered).map(([cat, svcs]) => {
          const isOpen = expandedCats[cat] !== false;
          const visibleCount = svcs.filter((s) => !s.cpHidden).length;
          return (
            <div
              key={cat}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCat(cat)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-700">{cat}</span>
                  <Badge color="gray">{svcs.length}</Badge>
                  <Badge color={visibleCount > 0 ? "green" : "red"}>
                    {visibleCount} visible
                  </Badge>
                </div>
                {isOpen ? (
                  <FiChevronUp size={14} className="text-gray-400" />
                ) : (
                  <FiChevronDown size={14} className="text-gray-400" />
                )}
              </div>

              {isOpen && (
                <div className="divide-y divide-gray-100">
                  {svcs.map((svc) => (
                    <div
                      key={svc._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {svc.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          #{svc.serviceId} · ${fmt(svc.rate)} · Min {svc.min} / Max{" "}
                          {svc.max}
                        </p>
                      </div>
                      <button
                        onClick={() => togglePlatformService(svc)}
                        disabled={saving[svc._id]}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
                          !svc.cpHidden
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {saving[svc._id] ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : !svc.cpHidden ? (
                          <FiEye size={12} />
                        ) : (
                          <FiEyeOff size={12} />
                        )}
                        {!svc.cpHidden ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETUP PROMPT (serviceMode === "none")
// ─────────────────────────────────────────────

function ServiceModeSetup({ onGoToSettings }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
        <FiSettings size={28} className="text-yellow-500" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-800">Service Mode Not Set</p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Choose a service mode in Settings to start offering services to your
          end users.
        </p>
      </div>
      <button
        onClick={onGoToSettings}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
      >
        <FiSettings size={15} /> Go to Settings
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const TABS = [
  { key: "platform", label: "Platform Services", icon: <FiZap size={14} /> },
  { key: "own", label: "My Provider Services", icon: <FiLink size={14} /> },
];

export default function ChildPanelServices() {
  const [serviceMode, setServiceMode] = useState(null); // null = loading
  const [activeTab, setActiveTab] = useState("platform");
  const [loadingMode, setLoadingMode] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingMode(true);
      try {
        const res = await API.get("/cp/settings");
        const mode = res.data?.serviceMode || "none";
        setServiceMode(mode);
        // Auto-select tab based on mode
        if (mode === "own") setActiveTab("own");
        else setActiveTab("platform");
      } catch {
        toast.error("Failed to load service settings");
      } finally {
        setLoadingMode(false);
      }
    };
    load();
  }, []);

  const isTabAvailable = (key) => {
    if (!serviceMode || serviceMode === "none") return false;
    if (serviceMode === "both") return true;
    return serviceMode === key;
  };

  const goToSettings = () => (window.location.href = "/child-panel/settings");

  return (
    <ChildPanelLayout>
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control which services your end users can see and order.
          </p>
        </div>

        {loadingMode ? (
          <Spinner />
        ) : serviceMode === "none" ? (
          <ServiceModeSetup onGoToSettings={goToSettings} />
        ) : (
          <>
            {/* Mode badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Service Mode:</span>
              <Badge
                color={
                  serviceMode === "both"
                    ? "blue"
                    : serviceMode === "platform"
                    ? "green"
                    : "yellow"
                }
              >
                {serviceMode === "both"
                  ? "Platform + Own Providers"
                  : serviceMode === "platform"
                  ? "Platform Services"
                  : "Own Providers Only"}
              </Badge>
              <button
                onClick={goToSettings}
                className="text-xs text-blue-500 hover:underline ml-1"
              >
                Change
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {TABS.map((tab) => {
                const available = isTabAvailable(tab.key);
                return (
                  <button
                    key={tab.key}
                    onClick={() => available && setActiveTab(tab.key)}
                    disabled={!available}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-white shadow text-blue-700"
                        : available
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === "platform" && isTabAvailable("platform") && (
              <PlatformServicesTab />
            )}
            {activeTab === "own" && isTabAvailable("own") && (
              <MyProviderServicesTab />
            )}
          </>
        )}
      </div>
    </ChildPanelLayout>
  );
}
