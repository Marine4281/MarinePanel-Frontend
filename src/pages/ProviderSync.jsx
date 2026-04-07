// src/pages/ProviderSync.jsx
import { useState, useEffect, useMemo } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import ProviderServiceTable from "../components/ProviderServiceTable";
import toast from "react-hot-toast";

export default function ProviderServices() {
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");

  const [services, setServices] = useState([]);
  const [savedServices, setSavedServices] = useState([]);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* LOAD PROVIDERS */
  useEffect(() => {
    API.get("/provider/profiles")
      .then((res) => setProviders(res.data))
      .catch(() => toast.error("Failed to load providers"));
  }, []);

  const selectedProvider = providers.find(
    (p) => p._id === selectedProviderId
  );

  /* FETCH SERVICES */
  const fetchServices = async () => {
    if (!selectedProvider) return toast.error("Select provider");

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
      saved.forEach((s) =>
        savedMap.set(String(s.providerServiceId), s)
      );

      const normalized = fetched.map((s) => {
        const existing = savedMap.get(String(s.service));
        return {
          ...s,
          category: s.category || "Uncategorized",
          imported: !!existing,
          deleted: existing?.deleted || false,
        };
      });

      // sort: imported first
      normalized.sort((a, b) =>
        a.imported === b.imported ? 0 : a.imported ? -1 : 1
      );

      setServices(normalized);

      const cats = [...new Set(normalized.map((s) => s.category))];
      setCategories(cats);
      setActiveCategory(cats[0] || "");

      toast.success(`Loaded ${normalized.length} services`);
    } catch {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  /* FILTER */
  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          String(s.service).includes(q)
        );
      }

      return true;
    });
  }, [services, activeCategory, search]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">
          Provider Sync
        </h1>

        {/* TOP BAR */}
        <div className="bg-white p-5 rounded-xl shadow flex gap-4 mb-6">
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
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Syncing..." : "Fetch Services"}
          </button>
        </div>

        {/* MAIN */}
        <div className="flex gap-6">
          {/* CATEGORY SIDEBAR */}
          <div className="w-64 bg-white rounded-xl shadow p-4">
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

          {/* CONTENT */}
          <div className="flex-1">
            <input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />

            <ProviderServiceTable
              services={filtered}
              providerProfileId={selectedProviderId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
