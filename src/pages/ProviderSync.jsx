// src/pages/ProviderSync.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import ProviderServiceTable from "../components/ProviderServiceTable";
import ProviderFields from "../components/ProviderFields";
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

  /* ================= 🔥 INSTANT UI UPDATE ================= */

  // When provider is created
  const handleProviderCreated = (newProvider) => {
    setProviders((prev) => [newProvider, ...prev]);

    setForm((prev) => ({
      ...prev,
      providerProfileId: newProvider._id,
    }));
  };

  // When provider is updated
  const handleProviderUpdated = (updatedProvider) => {
    setProviders((prev) =>
      prev.map((p) =>
        p._id === updatedProvider._id ? updatedProvider : p
      )
    );
  };

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

      toast.success(`Fetched ${total} services 🚀`);
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
        {/* 🔥 HEADER */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <h1 className="text-2xl font-bold">Provider Services</h1>
          <p className="text-sm opacity-90">
            Sync, manage and import provider services in real-time ⚡
          </p>
        </div>

        {/* ================= PROVIDER SECTION ================= */}
        <div className="bg-white shadow-xl rounded-xl p-6 mb-6 space-y-5 border">

          <ProviderFields
            form={form}
            handleChange={handleChange}
            providers={providers}
            isAddingNewProvider={isAddingNewProvider}
            onProviderCreated={handleProviderCreated}   // 🔥
            onProviderUpdated={handleProviderUpdated}   // 🔥
          />

          <div className="flex items-center gap-4 flex-wrap">

            <button
              onClick={fetchServices}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                loading
                  ? "bg-blue-300"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Fetching..." : "🚀 Fetch Services"}
            </button>

            {selectedProvider && (
              <div className="bg-gray-50 border px-4 py-2 rounded-lg text-sm shadow-sm">
                <p className="font-semibold text-gray-800">
                  {selectedProvider.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[250px]">
                  {selectedProvider.apiUrl}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
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
              <p className="text-sm font-medium text-gray-700">
                Fetching services...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
