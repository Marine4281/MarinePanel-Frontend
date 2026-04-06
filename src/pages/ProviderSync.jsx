//src/pages/ProviderSync.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import ProviderServiceTable from "../components/ProviderServiceTable";
import toast from "react-hot-toast";

export default function ProviderServices() {
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    apiUrl: "",
    apiKey: "",
  });

  /* ==============================
  LOAD PROVIDERS
  ============================== */
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

  /* ==============================
  SELECT PROVIDER
  ============================== */
  const selectedProvider = providers.find(
    (p) => p._id === selectedProviderId
  );

  /* ==============================
  FETCH SERVICES
  ============================== */
  const fetchServices = async () => {
    if (!selectedProvider) {
      toast.error("Please select a provider");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/provider/services", {
        providerProfileId: selectedProvider._id,
        apiUrl: selectedProvider.apiUrl,
        apiKey: selectedProvider.apiKey,
      });

      setServices(data);
      toast.success("Services fetched successfully");

    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
  SAVE NEW PROVIDER
  ============================== */
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

    } catch (error) {
      toast.error("Failed to save provider");
    }
  };

  /* ==============================
  SEARCH FILTER
  ============================== */
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

        {/* ================= PROVIDER SELECT ================= */}

        <div className="bg-white shadow rounded-lg p-6 mb-6 flex gap-4 items-center">

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
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Fetching..." : "Fetch Services"}
          </button>

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

        {/* ================= TABLE ================= */}

        <ProviderServiceTable
          services={filteredServices}
          providerProfileId={selectedProviderId}
        />

      </div>

      {/* ================= ADD PROVIDER MODAL ================= */}

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
