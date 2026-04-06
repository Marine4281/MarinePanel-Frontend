// src/components/ProviderServiceTable.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderServiceTable = ({ services, providerProfileId }) => {
  const [savedServices, setSavedServices] = useState([]);
  const [loading, setLoading] = useState(null);

  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedServices, setSelectedServices] = useState({});
  const [viewDescription, setViewDescription] = useState(null);

  /* =========================================
  LOAD SAVED SERVICES
  ========================================= */
  const loadSaved = async () => {
    try {
      const { data } = await API.get("/provider/services/saved", {
        params: { providerProfileId },
      });
      setSavedServices(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (providerProfileId) loadSaved();
  }, [providerProfileId]);

  /* =========================================
  MAP SAVED (O1 lookup)
  ========================================= */
  const savedMap = useMemo(() => {
    const map = new Map();
    for (const s of savedServices) {
      map.set(String(s.providerServiceId), s);
    }
    return map;
  }, [savedServices]);

  /* =========================================
  GROUP BY CATEGORY
  ========================================= */
  const grouped = useMemo(() => {
    const map = {};

    for (const s of services) {
      const cat = s.category || "Uncategorized";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    }

    return map;
  }, [services]);

  /* =========================================
  TOGGLE CATEGORY
  ========================================= */
  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  /* =========================================
  SELECT SERVICE
  ========================================= */
  const toggleService = (id) => {
    setSelectedServices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCategorySelection = (catServices) => {
    const updated = { ...selectedServices };

    const allSelected = catServices.every((s) => updated[s.service]);

    for (const s of catServices) {
      updated[s.service] = !allSelected;
    }

    setSelectedServices(updated);
  };

  /* =========================================
  IMPORT SELECTED
  ========================================= */
  const importSelected = async () => {
    const selected = Object.keys(selectedServices).filter(
      (k) => selectedServices[k]
    );

    if (!selected.length) return toast.error("No services selected");

    try {
      setLoading("bulk");

      await API.post("/provider/import-selected", {
        providerProfileId,
        serviceIds: selected,
      });

      toast.success("Imported selected services");
      loadSaved();
    } catch {
      toast.error("Import failed");
    } finally {
      setLoading(null);
    }
  };

  /* =========================================
  IMPORT CATEGORY
  ========================================= */
  const importCategory = async (category) => {
    try {
      setLoading(category);

      await API.post("/provider/import-category", {
        providerProfileId,
        category,
      });

      toast.success(`Imported ${category}`);
      loadSaved();
    } catch {
      toast.error("Category import failed");
    } finally {
      setLoading(null);
    }
  };

  /* =========================================
  TOGGLE / DELETE
  ========================================= */
  const toggleStatus = async (id) => {
    await API.patch(`/provider/services/${id}/toggle`);
    loadSaved();
  };

  const deleteService = async (id) => {
    await API.delete(`/provider/services/${id}`);
    loadSaved();
  };

  return (
    <>
      {/* BULK ACTION */}
      <div className="flex justify-between mb-4">
        <button
          onClick={importSelected}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          {loading === "bulk" ? "Importing..." : "Import Selected"}
        </button>
      </div>

      {/* CATEGORY BLOCKS */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, catServices]) => {
          return (
            <div
              key={category}
              className="border rounded-xl overflow-hidden shadow-sm"
            >
              {/* CATEGORY HEADER */}
              <div className="bg-gray-100 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="font-semibold"
                  >
                    {expandedCategories[category] ? "▼" : "▶"} {category}
                  </button>

                  <button
                    onClick={() => toggleCategorySelection(catServices)}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                  >
                    Select All
                  </button>
                </div>

                <button
                  onClick={() => importCategory(category)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                >
                  {loading === category
                    ? "Importing..."
                    : "Import Category"}
                </button>
              </div>

              {/* SERVICES */}
              {expandedCategories[category] && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="p-2"></th>
                        <th>ID</th>
                        <th>Service</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {catServices.map((s) => {
                        const saved = savedMap.get(
                          String(s.service)
                        );

                        const status = saved
                          ? saved.deleted
                            ? "Deleted"
                            : "Imported"
                          : "New";

                        return (
                          <tr
                            key={s.service}
                            className="border-t hover:bg-gray-50"
                          >
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={!!selectedServices[s.service]}
                                onChange={() =>
                                  toggleService(s.service)
                                }
                              />
                            </td>

                            <td>{s.service}</td>
                            <td>{s.name}</td>
                            <td>${Number(s.rate).toFixed(4)}</td>

                            <td>
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
                            </td>

                            <td className="flex gap-2 p-2 flex-wrap">
                              {s.description && (
                                <button
                                  onClick={() =>
                                    setViewDescription(s)
                                  }
                                  className="text-xs bg-gray-200 px-2 py-1 rounded"
                                >
                                  View
                                </button>
                              )}

                              {saved && (
                                <>
                                  <button
                                    onClick={() =>
                                      toggleStatus(saved._id)
                                    }
                                    className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                                  >
                                    Toggle
                                  </button>

                                  <button
                                    onClick={() =>
                                      deleteService(saved._id)
                                    }
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESCRIPTION MODAL */}
      {viewDescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[500px]">
            <h2 className="font-bold mb-2">
              {viewDescription.name}
            </h2>
            <p className="text-sm text-gray-700">
              {viewDescription.description}
            </p>

            <div className="text-right mt-4">
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
