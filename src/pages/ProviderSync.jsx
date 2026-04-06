// src/pages/ProviderSync.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

export default function ProviderServices() {
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [groupedServices, setGroupedServices] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedServices, setSelectedServices] = useState({});
  const [expandedServices, setExpandedServices] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error(error);
      toast.error("Failed to load providers");
    }
  };

  useEffect(() => loadProviders(), []);

  const selectedProvider = providers.find((p) => p._id === selectedProviderId);

  /* ================= FETCH SERVICES ================= */
  const fetchServices = async () => {
    if (!selectedProvider) {
      toast.error("Please select a provider");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/provider/services", {
        provider: selectedProvider.name,
      });

      // Group by category
      const grouped = {};
      data.forEach((s) => {
        const cat = s.category || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      });

      setServices(data);
      setGroupedServices(grouped);

      // Reset selections and expansion
      setSelectedCategories({});
      setSelectedServices({});
      setExpandedServices({});

      toast.success(`Fetched ${data.length} services`);
    } catch (error) {
      console.error("Fetch Services Error:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE CATEGORY ================= */
  const toggleCategory = (category) => {
    const isSelected = selectedCategories[category];
    const newSelectedCategories = { ...selectedCategories, [category]: !isSelected };
    setSelectedCategories(newSelectedCategories);

    const updatedServices = { ...selectedServices };
    groupedServices[category].forEach((s) => {
      updatedServices[s.service] = !isSelected; // select/unselect all in category
    });
    setSelectedServices(updatedServices);
  };

  /* ================= TOGGLE SERVICE ================= */
  const toggleService = (serviceId) => {
    setSelectedServices({
      ...selectedServices,
      [serviceId]: !selectedServices[serviceId],
    });
  };

  /* ================= TOGGLE EXPAND DESCRIPTION ================= */
  const toggleExpand = (serviceId) => {
    setExpandedServices({
      ...expandedServices,
      [serviceId]: !expandedServices[serviceId],
    });
  };

  /* ================= SAVE PROVIDER ================= */
  const saveProvider = async () => {
    const { name, apiUrl, apiKey } = newProvider;
    if (!name || !apiUrl || !apiKey) {
      toast.error("All fields required");
      return;
    }

    try {
      await API.post("/provider/profiles", newProvider);
      toast.success("Provider saved successfully");
      setShowModal(false);
      setNewProvider({ name: "", apiUrl: "", apiKey: "" });
      loadProviders();
    } catch (error) {
      console.error("Save Provider Error:", error);
      toast.error("Failed to save provider");
    }
  };

  /* ================= IMPORT SELECTED ================= */
  const importSelected = async () => {
    const selected = services.filter((s) => selectedServices[s.service]);
    if (selected.length === 0) {
      toast.error("No services selected");
      return;
    }

    try {
      setLoading(true);
      await API.post("/provider/import-selected", {
        services: selected,
        provider: selectedProvider.name,
      });
      toast.success(`Imported ${selected.length} services`);
      fetchServices(); // refresh
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("Failed to import services");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH ================= */
  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      String(s.rate).includes(q) ||
      s.service?.toLowerCase().includes(q)
    );
  });

  // Regroup filtered services
  const filteredGrouped = {};
  filteredServices.forEach((s) => {
    const cat = s.category || "Other";
    if (!filteredGrouped[cat]) filteredGrouped[cat] = [];
    filteredGrouped[cat].push(s);
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 relative">
        <h1 className="text-2xl font-bold mb-6">Provider Services</h1>

        {/* Provider Select */}
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
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Fetching services..." : "Fetch Services"}
          </button>

          {selectedProvider && (
            <div className="text-sm text-gray-600 ml-2">
              <span className="font-medium">{selectedProvider.name}</span>
              <span className="block text-xs">API: {selectedProvider.apiUrl}</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Services by Category */}
        {Object.entries(filteredGrouped).map(([category, services]) => (
          <div key={category} className="mb-6 bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{category}</h3>
              <button
                onClick={() => toggleCategory(category)}
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                {selectedCategories[category] ? "Unselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {services.map((s) => (
                <div
                  key={s.service}
                  className={`p-3 border rounded flex flex-col justify-between ${
                    selectedServices[s.service] ? "bg-green-100" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-600">
                        Rate: {s.rate} | Deduction: {s.rateDeduction || 0} | {s.imported ? "Imported" : "New"}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {s.serviceId}
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={!!selectedServices[s.service]}
                        onChange={() => toggleService(s.service)}
                      />
                    </div>
                  </div>
                  {/* Description Collapse */}
                  {s.description && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleExpand(s.service)}
                        className="text-blue-600 text-xs underline"
                      >
                        {expandedServices[s.service] ? "Hide Details" : "View Details"}
                      </button>
                      {expandedServices[s.service] && (
                        <div className="text-xs text-gray-700 mt-1">
                          {s.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={importSelected}
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Importing..." : "Import Selected Services"}
        </button>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-700 font-medium">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
