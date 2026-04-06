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
  const [activeCategory, setActiveCategory] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const selectedProvider = providers.find(
    (p) => p._id === selectedProviderId
  );

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

      const savedMap = new Map();
      for (const s of saved) {
        savedMap.set(String(s.providerServiceId), s);
      }

      const normalized = fetched.map((s) => {
        const existing = savedMap.get(String(s.service));

        return {
          ...s,
          category: s.category || "Uncategorized",
          imported: !!existing,
          deleted: existing?.deleted || false,
        };
      });

      // 🔥 SORT: Imported first
      normalized.sort((a, b) => {
        if (a.imported === b.imported) return 0;
        return a.imported ? -1 : 1;
      });

      setServices(normalized);

      const uniqueCategories = [
        ...new Set(normalized.map((s) => s.category)),
      ];

      setCategories(uniqueCategories);
      setActiveCategory(uniqueCategories[0] || "");

      toast.success(`Fetched ${fetched.length} services`);
    } catch {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;

      if (search) {
        const q = search.toLowerCase();

        if (
          !(
            s.name?.toLowerCase().includes(q) ||
            String(s.service).includes(q)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [services, search, activeCategory]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">
          Provider Sync Dashboard
        </h1>

        {/* TOP BAR */}
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
            onClick={fetchServices}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-blue-300" : "bg-blue-600"
            }`}
          >
            {loading ? "Syncing..." : "Fetch & Sync"}
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex gap-6">
          {/* CATEGORY SIDEBAR */}
          <div className="w-64 bg-white shadow rounded-lg p-4 h-fit">
            <h3 className="font-semibold mb-3">Categories</h3>

            <div className="space-y-2 max-h-[500px] overflow-auto">
              {categories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search in category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />

            {/* TABLE */}
            <ProviderServiceTable
              services={filteredServices}
              providerProfileId={selectedProviderId}
            />
          </div>
        </div>

        {/* LOADER */}
        {loading && (
          <div className="fixed inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
                   }
