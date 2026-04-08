// src/components/ProviderServiceTable.jsx
import { useEffect, useState, useMemo } from "react";
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
  const [updatingSelected, setUpdatingSelected] = useState(false);
  const [updatingSingle, setUpdatingSingle] = useState(null);

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
     RATE CHANGES (OPTIMIZED)
  ========================================= */
  const rateChanges = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.services
        .map((s) => {
          const existing = findExisting(s.service);
          if (!existing) return null;

          const newRate = Number(s.rate);
          const oldRate =
            existing?.lastSyncedRate || existing?.rate || 0;

          const diff = newRate - oldRate;
          if (diff === 0) return null;

          return {
            id: s.service,
            name: s.name,
            category: cat.category,
            oldRate,
            newRate,
            diff,
            existing,
          };
        })
        .filter(Boolean)
    );
  }, [categories, existingServices]);

  /* =========================================
     UPDATE RATE (SINGLE)
  ========================================= */
  const updateRate = async (existing, newRate) => {
    try {
      setUpdatingSingle(existing._id);

      await API.put(`/admin/services/${existing._id}`, {
        rate: newRate,
        lastSyncedRate: newRate,
      });

      toast.success("Rate updated");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update rate");
    } finally {
      setUpdatingSingle(null);
    }
  };

  /* =========================================
     UPDATE ALL (PARALLEL 🔥)
  ========================================= */
  const updateAllRates = async () => {
    if (rateChanges.length === 0) return;

    try {
      setUpdatingAll(true);

      await Promise.all(
        rateChanges.map((r) =>
          API.put(`/admin/services/${r.existing._id}`, {
            rate: r.newRate,
            lastSyncedRate: r.newRate,
          })
        )
      );

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
     UPDATE SELECTED ONLY 🔥 NEW
  ========================================= */
  const updateSelectedRates = async () => {
    const selectedChanges = rateChanges.filter((r) =>
      selectedServices.includes(r.id)
    );

    if (selectedChanges.length === 0) {
      return toast.error("No changed selected services");
    }

    try {
      setUpdatingSelected(true);

      await Promise.all(
        selectedChanges.map((r) =>
          API.put(`/admin/services/${r.existing._id}`, {
            rate: r.newRate,
            lastSyncedRate: r.newRate,
          })
        )
      );

      toast.success("Selected rates updated");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Selected update failed");
    } finally {
      setUpdatingSelected(false);
    }
  };

  /* ========================================= */
  const getStatus = (existing) => {
    if (existing?.deleted) return "Deleted";
    if (existing) return "Imported";
    return "New";
  };

  /* ========================================= */
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

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service.service)
        ? prev.filter((id) => id !== service.service)
        : [...prev, service.service]
    );
  };

  /* ========================================= */
  const importService = async (service) => {
    if (!providerProfile?.name) return toast.error("Provider required");

    try {
      setLoadingImport(service.service);

      await API.post("/provider/import-selected", {
        services: [service],
        provider: providerProfile.name,
      });

      toast.success("Service imported");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Import failed");
    } finally {
      setLoadingImport(null);
    }
  };

  const importSelected = async () => {
    if (!providerProfile?.name) return toast.error("Provider required");
    if (selectedServices.length === 0)
      return toast.error("No services selected");

    const servicesToImport = categories
      .flatMap((cat) => cat.services)
      .filter((s) => selectedServices.includes(s.service));

    try {
      await API.post("/provider/import-selected", {
        services: servicesToImport,
        provider: providerProfile.name,
      });

      toast.success("Selected services imported");
      setSelectedServices([]);
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Bulk import failed");
    }
  };

  const importCategory = async (category) => {
    if (!providerProfile?.name) return toast.error("Provider required");

    const catObj = categories.find((c) => c.category === category);

    try {
      await API.post("/provider/import-category", {
        category,
        services: catObj.services,
        provider: providerProfile.name,
      });

      toast.success("Category imported");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Category import failed");
    }
  };

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
          onClick={updateSelectedRates}
          disabled={updatingSelected}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {updatingSelected
            ? "Updating..."
            : "Update Selected"}
        </button>

        <button
          onClick={() => setShowDescription(!showDescription)}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Toggle Description
        </button>
      </div>

      {/* RATE SUMMARY */}
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
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    Your: {r.oldRate.toFixed(4)}
                  </span>
                  <span>→</span>
                  <span className="font-semibold">
                    Provider: {r.newRate.toFixed(4)}
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
                    disabled={updatingSingle === r.existing._id}
                    onClick={() =>
                      updateRate(r.existing, r.newRate)
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    {updatingSingle === r.existing._id
                      ? "..."
                      : "Update"}
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
          <div className="flex justify-between bg-gray-100 p-3">
            <div className="flex gap-3">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.category)}
                onChange={() => toggleCategory(cat)}
              />
              <span onClick={() => toggleExpand(cat.category)}>
                {cat.category} ({cat.services.length})
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
                const newRate = Number(s.rate);
                const oldRate =
                  existing?.lastSyncedRate || existing?.rate || 0;
                const rateDiff = existing
                  ? newRate - oldRate
                  : 0;

                return (
                  <div key={s.service} className="border p-3 rounded">
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.service)}
                        onChange={() => toggleService(s)}
                      />

                      <span>{s.name}</span>

                      <span>
                        ${newRate.toFixed(4)}
                        {rateDiff !== 0 && (
                          <span className="ml-2 text-xs">
                            ({rateDiff > 0 ? "+" : ""}
                            {rateDiff.toFixed(4)})
                          </span>
                        )}
                      </span>

                      {existing && rateDiff !== 0 && (
                        <button
                          onClick={() =>
                            updateRate(existing, newRate)
                          }
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Update
                        </button>
                      )}

                      {!existing && (
                        <button
                          onClick={() => importService(s)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Import
                        </button>
                      )}
                    </div>
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
