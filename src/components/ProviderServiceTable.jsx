// src/components/ProviderServiceTable.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderServiceTable = ({ categories, providerProfile }) => {
  const [existingServices, setExistingServices] = useState([]);
  const [loadingImport, setLoadingImport] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showDescription, setShowDescription] = useState(false);
  const [updatingAll, setUpdatingAll] = useState(false);

   /* =========================================
     ✅ PLATFORM DETECTION (NEW)
  ========================================= */
  const getPlatformFromCategory = (category = "") => {
    const c = category.toLowerCase();

    if (c.includes("instagram")) return "Instagram";
    if (c.includes("tiktok")) return "TikTok";
    if (c.includes("facebook")) return "Facebook";
    if (c.includes("youtube")) return "YouTube";
    if (c.includes("whatsapp")) return "WhatsApp";
    if (c.includes("telegram")) return "Telegram";

    return "Other";
  };

  /* =========================================
     RATE HELPERS (✅ SAME AS ADMIN PANEL)
  ========================================= */
  const getProviderRate = (s) =>
    Number(s.newRate ?? s.rate ?? 0);

  const getYourRate = (existing) =>
    Number(existing?.rate ?? 0);

  const getLastSyncedRate = (existing) =>
    Number(existing?.lastSyncedRate ?? existing?.rate ?? 0);

  /* =========================================
     LOAD EXISTING SERVICES
  ========================================= */
  const loadExistingServices = async () => {
    try {
      const { data } = await API.get("/admin/services");
      setExistingServices(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load existing services");
    }
  };

  useEffect(() => {
    loadExistingServices();
  }, []);

  /* =========================================
     FIND EXISTING
  ========================================= */
  const findExisting = (providerServiceId) => {
    return existingServices.find(
      (s) =>
        s.providerServiceId === String(providerServiceId) &&
        s.provider === providerProfile?.name
    );
  };

  /* =========================================
     RATE CHANGES SUMMARY (✅ FIXED)
  ========================================= */
  const rateChanges = categories.flatMap((cat) =>
    cat.services
      .map((s) => {
        const existing = findExisting(s.service);
        if (!existing) return null;

        const providerRate = getProviderRate(s);
        const yourRate = getYourRate(existing);
        const lastSyncedRate = getLastSyncedRate(existing);

        if (providerRate === yourRate) return null;

        return {
          id: s.service,
          name: s.name,
          category: cat.category,
          providerRate,
          yourRate,
          lastSyncedRate,
          diff: providerRate - yourRate,
          existing,
        };
      })
      .filter(Boolean)
  );

  /* =========================================
     UPDATE RATE
  ========================================= */
  const updateRate = async (existing, newRate) => {
    try {
      await API.put(`/admin/services/${existing._id}`, {
        rate: newRate,
        lastSyncedRate: newRate,
      });
      toast.success("Rate updated");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update rate");
    }
  };

  /* =========================================
     UPDATE ALL RATES
  ========================================= */
  const updateAllRates = async () => {
    if (rateChanges.length === 0) return;

    try {
      setUpdatingAll(true);

      for (const r of rateChanges) {
        await API.put(`/admin/services/${r.existing._id}`, {
          rate: r.providerRate,
          lastSyncedRate: r.providerRate,
        });
      }

      toast.success("All rates updated");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Bulk update failed");
    } finally {
      setUpdatingAll(false);
    }
  };

  /* =========================================
     STATUS LABEL
  ========================================= */
  const getStatus = (existing) => {
    if (existing?.deleted) return "Deleted";
    if (existing) return "Imported";
    return "New";
  };

  /* =========================================
     TOGGLE CATEGORY
  ========================================= */
  const toggleCategory = (cat) => {
    const isSelected = selectedCategories.includes(cat.category);

    if (isSelected) {
      setSelectedCategories((prev) =>
        prev.filter((c) => c !== cat.category)
      );

      setSelectedServices((prev) =>
        prev.filter(
          (id) => !cat.services.some((s) => s.service === id)
        )
      );
    } else {
      setSelectedCategories((prev) => [...prev, cat.category]);
      setSelectedServices((prev) => [
        ...prev,
        ...cat.services.map((s) => s.service),
      ]);
    }
  };

  /* =========================================
     TOGGLE SERVICE
  ========================================= */
  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service.service)
        ? prev.filter((id) => id !== service.service)
        : [...prev, service.service]
    );
  };

  /* =========================================
     IMPORT SINGLE SERVICE
  ========================================= */
  const importService = async (service, cat) => {
    if (!providerProfile?.name) return toast.error("Provider required");

    try {
      setLoadingImport(service.service);

      await API.post("/provider/import-selected", {
        services: [
          {
            name: service.name,
            category: service.category,
            rate: service.rate,
            min: service.min,
            max: service.max,
            service: service.service,
            platform: getPlatformFromCategory(cat.category),
            description: service.description || "",
            type: service.type || "Default",

            refill: s.refill ?? true,
            cancel: s.cancel ?? true,
          },
        ],
        provider: providerProfile.name,
      });

      toast.success("Service imported");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setLoadingImport(null);
    }
  };

  /* =========================================
     BULK IMPORT
  ========================================= */
  const importSelected = async () => {
    if (!providerProfile?.name) return toast.error("Provider required");
    if (selectedServices.length === 0)
      return toast.error("No services selected");

    const servicesToImport = categories
      .flatMap((cat) =>
        cat.services.map((s) => ({
          ...s,
          _category: cat.category,
        }))
      )
      .filter((s) => selectedServices.includes(s.service));

    try {
      await API.post("/provider/import-selected", {
        services: servicesToImport.map((s) => ({
          name: s.name,
          category: s.category,
          rate: s.rate,
          min: s.min,
          max: s.max,
          service: s.service,
          platform: getPlatformFromCategory(s._category),
          description: s.description || "",
          type: service.type || "Default",

          refill: s.refill ?? true,
          cancel: s.cancel ?? true,
        })),
        provider: providerProfile.name,
      });

      toast.success("Selected services imported");
      setSelectedServices([]);
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Bulk import failed");
    }
  };


  /* =========================================
     IMPORT CATEGORY
  ========================================= */
  const importCategory = async (category) => {
    if (!providerProfile?._id) {
      return toast.error("Provider required");
    }

    const catObj = categories.find((c) => c.category === category);

    if (!catObj || catObj.services.length === 0) {
      return toast.error("No services found in this category");
    }

    try {
      await API.post("/provider/import-category", {
        category,
        services: catObj.services.map((s) => ({
          name: s.name,
          category: s.category,
          rate: s.rate,
          min: s.min,
          max: s.max,
          service: s.service,
          platform: getPlatformFromCategory(catObj.category),
          description: s.description || "",
          type: service.type || "Default",

          refill: s.refill ?? true,
          cancel: s.cancel ?? true,
        })),
        provider: providerProfile.name,
      });

      toast.success("Category imported");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Category import failed");
    }
  };


  /* =========================================
     TOGGLE CATEGORY EXPAND
  ========================================= */
  const toggleExpand = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* TOP ACTIONS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={importSelected}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Import Selected ({selectedServices.length})
        </button>

        <button
          onClick={() => setShowDescription(!showDescription)}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Toggle Description
        </button>
      </div>

      {/* RATE CHANGES */}
      {rateChanges.length > 0 && (
        <div className="mb-4 border rounded-lg p-4 bg-yellow-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-yellow-800">
              ⚠ Rate Changes ({rateChanges.length})
            </h2>

            <button
              onClick={updateAllRates}
              disabled={updatingAll}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs"
            >
              {updatingAll ? "Updating..." : "Update All"}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {rateChanges.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center bg-white p-2 rounded border"
              >
                <div className="text-sm">
                  <span className="font-medium">{r.id}</span> — {r.name}
                  <span className="ml-2 text-xs text-gray-500">
                    ({r.category})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    Your: {r.yourRate.toFixed(4)}
                  </span>
                  <span>→</span>
                  <span className="font-semibold">
                    Provider: {r.providerRate.toFixed(4)}
                  </span>

                  <span
                    className={`text-xs ${
                      r.diff > 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {r.diff > 0 ? "+" : ""}
                    {r.diff.toFixed(4)}
                  </span>

                  <button
                    onClick={() =>
                      updateRate(r.existing, r.providerRate)
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {categories.map((cat) => (
        <div key={cat.category} className="border rounded mb-4">
          <div className="flex items-center justify-between bg-gray-100 p-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.category)}
                onChange={() => toggleCategory(cat)}
              />

              <span
                className="font-semibold cursor-pointer"
                onClick={() => toggleExpand(cat.category)}
              >
                {cat.category}
              </span>

              <span className="text-xs text-gray-500">
                ({cat.services.length})
              </span>
            </div>

            <button
              onClick={() => importCategory(cat.category)}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs"
            >
              Import Category
            </button>
          </div>

          {expandedCategories[cat.category] && (
            <div className="p-3 space-y-2">
              {cat.services.map((s) => {
                const existing = findExisting(s.service);

                const providerRate = getProviderRate(s);
                const yourRate = getYourRate(existing);
                const rateDiff = existing
                  ? providerRate - yourRate
                  : 0;

                const status = getStatus(existing);

                return (
                  <div
                    key={s.service}
                    className={`border p-3 rounded flex flex-col gap-2 ${
                      rateDiff !== 0
                        ? "bg-yellow-50 border-yellow-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.service)}
                        onChange={() => toggleService(s)}
                      />

                      <span className="w-16">{s.service}</span>
                      <span className="flex-1">{s.name}</span>

                      <span className="text-sm">
                        ${providerRate.toFixed(4)}
                        {existing && rateDiff !== 0 && (
                          <span
                            className={`ml-2 text-xs ${
                              rateDiff > 0
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {rateDiff > 0 ? "+" : ""}
                            {rateDiff.toFixed(4)}
                          </span>
                        )}
                      </span>

                      <span className="text-xs font-semibold">
                        {status}
                      </span>

                      {!existing && (
                        <button
                          onClick={() => importService(s, cat)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          {loadingImport === s.service
                            ? "..."
                            : "Import"}
                        </button>
                      )}

                      {existing && rateDiff !== 0 && (
                        <button
                          onClick={() =>
                            updateRate(existing, providerRate)
                          }
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Update
                        </button>
                      )}

                      {existing && rateDiff === 0 && (
                        <span className="text-gray-400 text-xs">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 flex gap-4">
                      <span>Min: {s.min}</span>
                      <span>Max: {s.max}</span>
                    </div>

                    {showDescription && (
                      <div className="text-xs text-gray-400">
                        {s.description || "No description"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProviderServiceTable;
