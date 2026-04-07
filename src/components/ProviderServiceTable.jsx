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
        s.providerProfileId === providerProfile?._id
    );
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
  const importService = async (service) => {
    if (!providerProfile?._id) return toast.error("Provider required");

    try {
      setLoadingImport(service.service);

      await API.post("/admin/services/import", {
        name: service.name,
        category: service.category,
        rate: service.rate,
        min: service.min,
        max: service.max,
        providerServiceId: service.service,
        providerProfileId: providerProfile._id,
        platform: service.platform || "General",
        description: service.description || "",
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
    if (!providerProfile?._id) return toast.error("Provider required");
    if (selectedServices.length === 0) return toast.error("No services selected");

    const servicesToImport = categories
      .flatMap((cat) => cat.services)
      .filter((s) => selectedServices.includes(s.service));

    try {
      await API.post("/provider/import-selected", {
        services: servicesToImport,
        providerProfileId: providerProfile._id,
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
    if (!providerProfile?._id) return toast.error("Provider required");

    const catObj = categories.find((c) => c.category === category);

    if (!catObj || catObj.services.length === 0) {
      return toast.error("No services found in this category");
    }

    try {
      await API.post("/provider/import-category", {
        category,
        services: catObj.services,
        providerProfileId: providerProfile._id,
      });

      toast.success("Category imported");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Category import failed");
    }
  };

  /* =========================================
     UPDATE RATE
  ========================================= */
  const updateRate = async (existing, newRate) => {
    try {
      await API.put(`/admin/services/${existing._id}`, { rate: newRate });
      toast.success("Rate updated");
      loadExistingServices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update rate");
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

      {/* CATEGORIES */}
      {categories.map((cat) => (
        <div key={cat.category} className="border rounded mb-4">
          {/* CATEGORY HEADER */}
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

          {/* SERVICES */}
          {expandedCategories[cat.category] && (
            <div className="p-3 space-y-2">
              {cat.services.map((s) => {
                const existing = findExisting(s.service);

                const newRate = Number(s.rate);
                const oldRate = existing?.lastSyncedRate || existing?.rate || 0;
                const rateDiff = existing ? newRate - oldRate : 0;
                const status = getStatus(existing);

                return (
                  <div
                    key={s.service}
                    className="border p-3 rounded flex flex-col gap-2"
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
                        ${newRate.toFixed(4)}
                        {existing && rateDiff !== 0 && (
                          <span
                            className={`ml-2 text-xs ${
                              rateDiff > 0 ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {rateDiff > 0 ? "+" : ""}
                            {rateDiff.toFixed(4)}
                          </span>
                        )}
                      </span>

                      {/* STATUS */}
                      <span
                        className={`text-xs font-semibold ${
                          status === "Imported"
                            ? "text-green-600"
                            : status === "Deleted"
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {status}
                      </span>

                      {/* ACTION */}
                      {!existing && (
                        <button
                          onClick={() => importService(s)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          {loadingImport === s.service ? "..." : "Import"}
                        </button>
                      )}

                      {existing && rateDiff !== 0 && (
                        <button
                          onClick={() => updateRate(existing, newRate)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Update
                        </button>
                      )}

                      {existing && rateDiff === 0 && (
                        <span className="text-gray-400 text-xs">✓</span>
                      )}
                    </div>

                    {/* EXTRA INFO */}
                    <div className="text-xs text-gray-500 flex gap-4">
                      <span>Min: {s.min}</span>
                      <span>Max: {s.max}</span>
                    </div>

                    {/* DESCRIPTION */}
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
