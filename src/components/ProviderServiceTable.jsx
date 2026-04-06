// src/components/ProviderServiceTable.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderServiceTable = ({
  services,
  providerProfileId,
  showDescription = false,
}) => {
  const [existingServices, setExistingServices] = useState([]);
  const [loadingImport, setLoadingImport] = useState(null);
  const [viewDescription, setViewDescription] = useState(null);

  /* =========================================
  LOAD EXISTING SERVICES
  ========================================= */
  const loadExistingServices = async () => {
    try {
      const { data } = await API.get("/admin/services");
      setExistingServices(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadExistingServices();
  }, []);

  /* =========================================
  OPTIMIZED LOOKUP MAP (O(1))
  ========================================= */
  const existingMap = useMemo(() => {
    const map = new Map();

    for (const s of existingServices) {
      if (!s.providerServiceId || !s.providerProfileId?._id) continue;

      const key = `${s.providerServiceId}_${s.providerProfileId._id}`;
      map.set(key, s);
    }

    return map;
  }, [existingServices]);

  const findExisting = (providerServiceId) => {
    return existingMap.get(
      `${providerServiceId}_${providerProfileId}`
    );
  };

  /* =========================================
  IMPORT SERVICE
  ========================================= */
  const importService = async (service) => {
    try {
      setLoadingImport(service.service);

      await API.post("/admin/services/import", {
        name: service.name,
        category: service.category,
        rate: service.rate,
        min: service.min,
        max: service.max,
        providerServiceId: service.service,
        providerProfileId,
        platform: service.platform || "General",
        description: service.description || "",
      });

      toast.success("Imported successfully");
      loadExistingServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setLoadingImport(null);
    }
  };

  /* =========================================
  UPDATE RATE
  ========================================= */
  const updateRate = async (existing, newRate) => {
    try {
      await API.put(`/admin/services/${existing._id}`, {
        rate: newRate,
      });

      toast.success("Rate updated");
      loadExistingServices();
    } catch {
      toast.error("Failed to update rate");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Category</th>

              {showDescription && (
                <th className="p-3 text-left">Description</th>
              )}

              <th className="p-3 text-left">Rate</th>
              <th className="p-3 text-left">Min</th>
              <th className="p-3 text-left">Max</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {services.map((s) => {
              const existing = findExisting(s.service);

              const newRate = Number(s.rate || 0);
              const oldRate =
                existing?.lastSyncedRate ??
                existing?.rate ??
                0;

              const rateDiff = existing ? newRate - oldRate : 0;

              const isDeleted = s.deleted;
              const isImported = !!existing;

              return (
                <tr
                  key={s.service}
                  className={`border-t hover:bg-gray-50 ${
                    isDeleted ? "opacity-50 line-through" : ""
                  }`}
                >
                  <td className="p-3">{s.service}</td>

                  <td className="p-3 font-medium">{s.name}</td>

                  <td className="p-3">{s.category}</td>

                  {/* DESCRIPTION */}
                  {showDescription && (
                    <td className="p-3 text-xs text-gray-500">
                      {s.description?.slice(0, 50)}
                    </td>
                  )}

                  {/* RATE */}
                  <td className="p-3 font-medium">
                    ${newRate.toFixed(4)}

                    {isImported && rateDiff !== 0 && (
                      <span
                        className={`ml-2 text-xs font-bold ${
                          rateDiff > 0
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      >
                        {rateDiff > 0 ? "+" : ""}
                        {rateDiff.toFixed(4)}
                      </span>
                    )}
                  </td>

                  <td className="p-3">{s.min}</td>
                  <td className="p-3">{s.max}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    {isDeleted ? (
                      <span className="text-red-500 font-semibold">
                        Deleted
                      </span>
                    ) : isImported ? (
                      <span className="text-green-600 font-semibold">
                        Imported
                      </span>
                    ) : (
                      <span className="text-gray-400">New</span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="p-3 flex gap-2 flex-wrap">

                    {/* VIEW DESCRIPTION */}
                    {s.description && (
                      <button
                        onClick={() => setViewDescription(s)}
                        className="bg-gray-200 px-2 py-1 rounded text-xs"
                      >
                        View
                      </button>
                    )}

                    {!isImported && !isDeleted && (
                      <button
                        onClick={() => importService(s)}
                        disabled={loadingImport === s.service}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        {loadingImport === s.service
                          ? "Importing..."
                          : "Import"}
                      </button>
                    )}

                    {isImported && rateDiff !== 0 && !isDeleted && (
                      <button
                        onClick={() =>
                          updateRate(existing, newRate)
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Update Rate
                      </button>
                    )}

                    {isImported && rateDiff === 0 && (
                      <span className="text-gray-400 text-xs">
                        Up to date
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= DESCRIPTION MODAL ================= */}
      {viewDescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px]">
            <h2 className="text-lg font-bold mb-3">
              {viewDescription.name}
            </h2>

            <p className="text-sm text-gray-700 whitespace-pre-line">
              {viewDescription.description || "No description"}
            </p>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewDescription(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderServiceTable;
