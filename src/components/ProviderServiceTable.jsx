//src/components/ProviderServiceTable.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderServiceTable = ({ services, providerProfileId }) => {
  const [existingServices, setExistingServices] = useState([]);
  const [loadingImport, setLoadingImport] = useState(null);

  /* =========================================
  LOAD EXISTING SERVICES (FROM YOUR SYSTEM)
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
  CHECK IF SERVICE ALREADY IMPORTED
  ========================================= */
  const findExisting = (providerServiceId) => {
    return existingServices.find(
      (s) =>
        s.providerServiceId === String(providerServiceId) &&
        s.providerProfileId?._id === providerProfileId
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

    } catch (error) {
      toast.error("Failed to update rate");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-left">Category</th>
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

            const newRate = Number(s.rate);
            const oldRate = existing?.lastSyncedRate || existing?.rate || 0;

            const rateDiff = existing ? newRate - oldRate : 0;

            return (
              <tr key={s.service} className="border-t hover:bg-gray-50">

                <td className="p-3">{s.service}</td>

                <td className="p-3">{s.name}</td>

                <td className="p-3">{s.category}</td>

                {/* RATE */}
                <td className="p-3 font-medium">
                  ${newRate.toFixed(4)}

                  {existing && rateDiff !== 0 && (
                    <span
                      className={`ml-2 text-xs font-bold ${
                        rateDiff > 0 ? "text-red-500" : "text-green-600"
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
                  {existing ? (
                    <span className="text-green-600 font-semibold">
                      Imported
                    </span>
                  ) : (
                    <span className="text-gray-400">New</span>
                  )}
                </td>

                {/* ACTION */}
                <td className="p-3 flex gap-2">

                  {!existing && (
                    <button
                      onClick={() => importService(s)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      {loadingImport === s.service
                        ? "Importing..."
                        : "Import"}
                    </button>
                  )}

                  {existing && rateDiff !== 0 && (
                    <button
                      onClick={() => updateRate(existing, newRate)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Update Rate
                    </button>
                  )}

                  {existing && rateDiff === 0 && (
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
  );
};

export default ProviderServiceTable;
