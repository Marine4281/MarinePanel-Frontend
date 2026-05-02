// src/pages/childpanel/ChildPanelProviders.jsx
//
// Child panel owner managing their own provider API connections.
// Fully self-contained — does NOT share components with the main
// platform provider sync page since those hit different endpoints.
// Hits /cp/providers/* exclusively.

import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

// ======================= HELPERS =======================

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

// ======================= PROVIDER FORM MODAL =======================

function ProviderFormModal({ existing, onClose, onSaved }) {
  const isEdit = !!existing;
  const [form, setForm] = useState({
    name: existing?.name || "",
    apiUrl: existing?.apiUrl || "",
    apiKey: existing?.apiKey || "",
  });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.apiUrl || !form.apiKey) {
      return toast.error("All fields are required");
    }
    setLoading(true);
    try {
      if (isEdit) {
        const res = await API.put(
          `/cp/providers/profiles/${existing._id}`,
          form
        );
        toast.success("Provider updated");
        onSaved(res.data.provider);
      } else {
        const res = await API.post("/cp/providers/profiles", form);
        toast.success("Provider created");
        onSaved(res.data.provider);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-800">
            {isEdit ? "Edit Provider" : "Add Provider"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Provider Name
            </label>
            <input
              type="text"
              placeholder="e.g. SMMPanel"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              API URL
            </label>
            <input
              type="text"
              placeholder="https://provider.com/api/v2"
              value={form.apiUrl}
              onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="Your API key"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================= SERVICE TABLE =======================

function ServiceTable({ categories, selectedProvider, onImported }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loadingImport, setLoadingImport] = useState(null);
  const [importingAll, setImportingAll] = useState(false);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      services: cat.services.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          cat.category?.toLowerCase().includes(q) ||
          String(s.rate).includes(q) ||
          String(s.service).includes(q)
        );
      }),
    }))
    .filter((cat) => cat.services.length > 0);

  const toggleCategory = (cat) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleServiceSelect = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleCategorySelect = (cat) => {
    const ids = cat.services.map((s) => s.service);
    const allSelected = ids.every((id) => selectedServices.includes(id));

    if (allSelected) {
      setSelectedServices((prev) => prev.filter((id) => !ids.includes(id)));
      setSelectedCategories((prev) => prev.filter((c) => c !== cat.category));
    } else {
      setSelectedServices((prev) => [...new Set([...prev, ...ids])]);
      setSelectedCategories((prev) => [...new Set([...prev, cat.category])]);
    }
  };

  const importSelected = async () => {
    if (!selectedProvider || selectedServices.length === 0) return;

    const allServices = categories.flatMap((c) => c.services);
    const toImport = allServices.filter((s) =>
      selectedServices.includes(s.service)
    );

    setImportingAll(true);
    try {
      const res = await API.post("/cp/providers/import-selected", {
        provider: selectedProvider.name,
        services: toImport,
      });
      toast.success(`Imported ${res.data.count} services`);
      setSelectedServices([]);
      onImported?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImportingAll(false);
    }
  };

  const importCategory = async (category) => {
    if (!selectedProvider) return;
    const allServices = categories.flatMap((c) => c.services);

    setLoadingImport(category);
    try {
      const res = await API.post("/cp/providers/import-category", {
        provider: selectedProvider.name,
        category,
        services: allServices,
      });
      toast.success(`Imported ${res.data.count} services from ${category}`);
      onImported?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setLoadingImport(null);
    }
  };

  if (categories.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Search + import selected */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {selectedServices.length > 0 && (
          <button
            onClick={importSelected}
            disabled={importingAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            <FiCheck size={14} />
            {importingAll
              ? "Importing..."
              : `Import ${selectedServices.length} Selected`}
          </button>
        )}
      </div>

      {/* Categories */}
      {filtered.map((cat) => {
        const isOpen = expanded[cat.category];
        const catIds = cat.services.map((s) => s.service);
        const allChecked = catIds.every((id) =>
          selectedServices.includes(id)
        );

        return (
          <div
            key={cat.category}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            {/* Category header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => toggleCategorySelect(cat)}
                  className="rounded"
                />
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="flex items-center gap-2 font-semibold text-gray-800 text-sm hover:text-blue-600"
                >
                  {cat.category}
                  <span className="text-xs text-gray-400 font-normal">
                    ({cat.services.length})
                  </span>
                  {isOpen ? (
                    <FiChevronUp size={14} />
                  ) : (
                    <FiChevronDown size={14} />
                  )}
                </button>
              </div>

              <button
                onClick={() => importCategory(cat.category)}
                disabled={loadingImport === cat.category}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 disabled:opacity-60"
              >
                {loadingImport === cat.category
                  ? "Importing..."
                  : "Import All"}
              </button>
            </div>

            {/* Services */}
            {isOpen && (
              <div className="border-t overflow-x-auto">
                <table className="min-w-[600px] w-full text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left w-8" />
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Rate</th>
                      <th className="px-4 py-2 text-left">Min</th>
                      <th className="px-4 py-2 text-left">Max</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.services.map((s) => (
                      <tr
                        key={s.service}
                        className={`border-t ${
                          selectedServices.includes(s.service)
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(s.service)}
                            onChange={() => toggleServiceSelect(s.service)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-2 font-mono text-gray-500">
                          {s.service}
                        </td>
                        <td className="px-4 py-2 text-gray-700 max-w-[200px] truncate">
                          {s.name}
                        </td>
                        <td className="px-4 py-2 font-semibold text-gray-800">
                          ${fmt(s.rate)}
                        </td>
                        <td className="px-4 py-2 text-gray-500">{s.min}</td>
                        <td className="px-4 py-2 text-gray-500">{s.max}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.statusLabel === "imported"
                                ? "bg-green-100 text-green-700"
                                : s.statusLabel === "updated"
                                ? "bg-orange-100 text-orange-700"
                                : s.statusLabel === "deleted"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {s.statusLabel || "new"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelProviders() {
  const [providers, setProviders] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [formModal, setFormModal] = useState(null); // null | "add" | provider object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ======================= LOAD PROVIDERS =======================

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cp/providers/profiles");
      setProviders(res.data || []);
    } catch {
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers.find((p) => p._id === selectedId);

  // ======================= FETCH SERVICES =======================

  const fetchServices = async () => {
    if (!selectedProvider) return toast.error("Select a provider first");
    setFetching(true);
    setCategories([]);
    try {
      const res = await API.post("/cp/providers/services", {
        provider: selectedProvider.name,
      });
      setCategories(res.data || []);
      const total = (res.data || []).reduce(
        (sum, c) => sum + c.services.length,
        0
      );
      toast.success(`Fetched ${total} services`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch services");
    } finally {
      setFetching(false);
    }
  };

  // ======================= DELETE PROVIDER =======================

  const handleDelete = async () => {
    try {
      await API.delete(`/cp/providers/profiles/${deleteTarget._id}`);
      setProviders((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      if (selectedId === deleteTarget._id) setSelectedId("");
      toast.success("Provider deleted");
    } catch {
      toast.error("Failed to delete provider");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ======================= RENDER =======================

  return (
    <ChildPanelLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Providers</h1>
          <p className="text-sm text-gray-500">
            Connect your own SMM provider APIs and import services
          </p>
        </div>

        {/* Provider list + selector */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Your Providers
            </p>
            <button
              onClick={() => setFormModal("add")}
              className="flex items-center gap-1.5 text-sm px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <FiPlus size={14} /> Add Provider
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : providers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No providers yet. Add one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {providers.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedId(p._id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${
                    selectedId === p._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[220px]">
                      {p.apiUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormModal(p);
                      }}
                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(p);
                      }}
                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fetch button */}
          {selectedProvider && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={fetchServices}
                disabled={fetching}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                <FiRefreshCw
                  size={14}
                  className={fetching ? "animate-spin" : ""}
                />
                {fetching ? "Fetching..." : "Fetch Services"}
              </button>
              <div className="text-xs text-gray-500">
                Selected:{" "}
                <span className="font-semibold text-gray-700">
                  {selectedProvider.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Services table */}
        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Fetching services...</p>
            </div>
          </div>
        ) : categories.length > 0 ? (
          <ServiceTable
            categories={categories}
            selectedProvider={selectedProvider}
            onImported={loadProviders}
          />
        ) : null}
      </div>

      {/* Provider form modal */}
      {formModal && (
        <ProviderFormModal
          existing={formModal === "add" ? null : formModal}
          onClose={() => setFormModal(null)}
          onSaved={(saved) => {
            if (formModal === "add") {
              setProviders((prev) => [saved, ...prev]);
              setSelectedId(saved._id);
            } else {
              setProviders((prev) =>
                prev.map((p) => (p._id === saved._id ? saved : p))
              );
            }
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <p className="text-sm text-gray-700 mb-1 text-center font-semibold">
              Delete {deleteTarget.name}?
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">
              All imported services from this provider will also be removed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ChildPanelLayout>
  );
}
