//src/pages/ProviderSync.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import ProviderServiceTable from "../components/ProviderServiceTable";
import toast from "react-hot-toast";

export default function ProviderServices() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------------------------
  Load saved provider profiles
  ------------------------------ */

  const loadProviders = async () => {
    try {
      const { data } = await API.get("/provider/profiles");
      setProviders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  /* ------------------------------
  Fetch services (UPDATED)
  ------------------------------ */

  const fetchServices = async () => {
    if (!provider) {
      toast.error("Select or enter provider");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/provider/services", {
        provider,
        // apiUrl & apiKey now optional (backend auto-loads)
        apiUrl,
        apiKey,
      });

      setServices(data);
      toast.success("Services fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------
  Save provider (UPDATED)
  ------------------------------ */

  const saveProvider = async () => {
    if (!provider || !apiUrl || !apiKey) {
      toast.error("All fields required");
      return;
    }

    try {
      await API.post("/provider/profiles", {
        name: provider,
        apiUrl,
        apiKey,
      });

      toast.success("Provider saved");
      loadProviders();
    } catch (error) {
      toast.error("Failed to save provider");
    }
  };

  /* ------------------------------
  Select provider (AUTO-FILL)
  ------------------------------ */

  const selectProvider = (p) => {
    setProvider(p.name);
    setApiUrl(p.apiUrl || "");
    setApiKey(p.apiKey || "");

    toast.success(`Loaded ${p.name}`);
  };

  /* ------------------------------
  Search filter
  ------------------------------ */

  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase();

    return (
      s.name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      String(s.rate).includes(q) ||
      String(s.service).includes(q)
    );
  });

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Provider Services</h1>

        {/* Provider Inputs */}

        <div className="bg-white shadow rounded-lg p-6 mb-6 grid grid-cols-5 gap-4">

          <input
            type="text"
            placeholder="Provider Name"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="API URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={fetchServices}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Fetching..." : "Fetch Services"}
          </button>

          <button
            onClick={saveProvider}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Save Provider
          </button>

        </div>

        {/* Saved Providers */}

        {providers.length > 0 && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="font-semibold mb-3">Saved Providers</h2>

            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <button
                  key={p.name}
                  onClick={() => selectProvider(p)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search services (name, category, rate, id)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Services Table */}

        <ProviderServiceTable
          services={filteredServices}
          provider={provider}
          apiUrl={apiUrl}
          apiKey={apiKey}
        />

      </div>
    </div>
  );
        }
