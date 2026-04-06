// src/pages/ProviderSync.jsx
import { useState, useEffect, useMemo } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import ProviderServiceTable from "../components/ProviderServiceTable";
import toast from "react-hot-toast";

export default function ProviderServices() {
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [providers, setProviders] = useState([]);

  const [services, setServices] = useState([]);
  const [savedServices, setSavedServices] = useState([]);

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAllCategories, setSelectAllCategories] = useState(true);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    apiUrl: "",
    apiKey: "",
  });

  /* ================= LOAD PROVIDERS ================= */
  const loadProviders = async () => {
    try {
      const { data } = await API.get("/provider/profiles");
      setProviders(data);
    } catch {
      toast.error("Failed to load providers");
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  /* ================= SELECTED PROVIDER ================= */
  const selectedProvider = providers.find(
    (p) => p._id === selectedProviderId
  );

  /* ================= LOAD SAVED ================= */
  const loadSaved = async (providerId) => {
    try {
      const { data } = await API.get("/provider/services/saved", {
        params: { providerProfileId: providerId },
      });
      setSavedServices(data);
    } catch {
      toast.error("Failed to load saved services");
    }
  };

  /* ================= FETCH SERVICES ================= */
  const fetchServices = async () => {
    if (!selectedProvider) {
      toast.error("Select provider");
      return;
    }

    try {
      setLoading(true);

      const [{ data: fetched }, { data: saved }] = await Promise.all([
        API.post("/provider/services", {
          provider: selectedProvider.name,
        }),
        API.get("/provider/services/saved", {
          params: { providerProfileId: selectedProviderId },
        }),
      ]);

      setSavedServices(saved);

      // Map saved for fast lookup
      const savedMap = new Map();
      for (const s of saved) {
        savedMap.set(String(s.providerServiceId), s);
      }

      const normalized = fetched.map((s) => {
        const existing = savedMap.get(String(s.service));

        return {
          ...s,
          category: s.category || "Uncategorized",
          description: s.description || "",
          imported: !!existing,
          deleted: existing?.deleted || false,
        };
      });

      setServices(normalized);

      const uniqueCategories = [
        ...new Set(normalized.map((s) => s.category)),
      ];

      setCategories(uniqueCategories);
      setSelectedCategories(uniqueCategories);
      setSelectAllCategories(true);

      toast.success(`Fetched ${fetched.length} services`);
    } catch {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CATEGORY FILTER ================= */
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      const updated = selectedCategories.filter((c) => c !== cat);
      setSelectedCategories(updated);
      setSelectAllCategories(false);
    } else {
      const updated = [...selectedCategories, cat];
      setSelectedCategories(updated);
      setSelectAllCategories(updated.length === categories.length);
    }
  };

  const toggleAllCategories = () => {
    if (selectAllCategories) {
      setSelectedCategories([]);
      setSelectAllCategories(false);
    } else {
      setSelectedCategories(categories);
      setSelectAllCategories(true);
    }
  };

  /* ================= FILTERED ================= */
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!selectAllCategories && !selectedCategories.includes(s.category))
        return false;

      if (search) {
        const q = search.toLowerCase();

        if (
          !(
            s.name?.toLowerCase().includes(q) ||
            s.category?.toLowerCase().includes(q) ||
            String(s.rate).includes(q) ||
            String(s.service).includes(q)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [services, search, selectedCategories, selectAllCategories]);

  /* ================= SAVE PROVIDER ================= */
  const saveProvider = async () => {
    const { name, apiUrl, apiKey } = newProvider;

    if (!name || !apiUrl || !apiKey) {
      toast.error("All fields required");
      return;
    }

    try {
      await API.post("/provider/profiles", newProvider);

      toast.success("Provider saved");
      setShowModal(false);
      setNewProvider({ name: "", apiUrl: "", apiKey: "" });
      loadProviders();
    } catch {
      toast.error("Failed to save provider");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 relative">
        <h1 className="text-2xl font-bold mb-6">
          Provider Sync Dashboard
        </h1>

        {/* PROVIDER BAR */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-wrap gap-4 items-center">
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="border p-2 rounded w-64"
          >
            <option value="">Select Provider</option>
            {providers.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            + Add Provider
          </button>

          <button
            onClick={fetchServices}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-blue-300" : "bg-blue-600"
            }`}
          >
            {loading ? "Syncing..." : "Fetch & Sync"}
          </button>
        </div>

        {/* CATEGORY FILTER */}
        {categories.length > 0 && (
          <div className="bg-white shadow rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleAllCategories}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                {selectAllCategories ? "Unselect All" : "Select All"}
              </button>

              {categories.map((cat) => (
                <label key={cat} className="text-sm flex gap-1">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        {/* TABLE */}
        <ProviderServiceTable
          services={filteredServices}
          providerProfileId={selectedProviderId}
        />

        {/* LOADING */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="text-xl font-bold mb-4">Add Provider</h2>

            <input
              placeholder="Provider Name"
              value={newProvider.name}
              onChange={(e) =>
                setNewProvider({ ...newProvider, name: e.target.value })
              }
              className="border p-2 rounded w-full mb-3"
            />

            <input
              placeholder="API URL"
              value={newProvider.apiUrl}
              onChange={(e) =>
                setNewProvider({ ...newProvider, apiUrl: e.target.value })
              }
              className="border p-2 rounded w-full mb-3"
            />

            <input
              placeholder="API Key"
              value={newProvider.apiKey}
              onChange={(e) =>
                setNewProvider({ ...newProvider, apiKey: e.target.value })
              }
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveProvider}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
        }
