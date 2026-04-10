// src/pages/ProviderSync.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import ProviderServiceTable from "../components/ProviderServiceTable";
import ProviderFields from "../components/ProviderFields"; // ✅ IMPORT
import toast from "react-hot-toast";

export default function ProviderSync() {
  const [form, setForm] = useState({
    providerProfileId: "",
    newProviderName: "",
    providerApiUrl: "",
    providerApiKey: "",
  });

  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadProviders();
  }, []);

  /* ================= HANDLE FORM ================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectedProvider = providers.find(
    (p) => p._id === form.providerProfileId
  );

  const isAddingNewProvider = form.providerProfileId === "new";

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

      setCategories(data);

      const total = data.reduce(
        (sum, cat) => sum + cat.services.length,
        0
      );

      toast.success(`Fetched ${total} services`);
    } catch (error) {
      console.error("Fetch Services Error:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredCategories = categories
    .map((cat) => {
      const filteredServices = cat.services.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          cat.category?.toLowerCase().includes(q) ||
          String(s.rate).includes(q) ||
          String(s.service).includes(q)
        );
      });

      return {
        ...cat,
        services: filteredServices,
      };
    })
    .filter((cat) => cat.services.length > 0);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 relative">
        <h1 className="text-2xl font-bold mb-6">Provider Services</h1>

        {/* ================= PROVIDER FIELDS (REPLACED EVERYTHING) ================= */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 space-y-4">

          <ProviderFields
            form={form}
            handleChange={handleChange}
            providers={providers}
            isAddingNewProvider={isAddingNewProvider}
          />

          <div className="flex items-center gap-4 flex-wrap">
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
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {selectedProvider.name}
                </span>
                <span className="block text-xs">
                  API: {selectedProvider.apiUrl}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* ================= CATEGORY TABLE ================= */}
        <ProviderServiceTable
          categories={filteredCategories}
          providerProfile={selectedProvider}
        />

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-700 font-medium">
                Fetching services from provider...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
