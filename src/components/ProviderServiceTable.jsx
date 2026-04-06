// src/components/ProviderServiceTable.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderServiceTable = ({ services, providerProfileId }) => {
  const [savedServices, setSavedServices] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(null);
  const [viewDescription, setViewDescription] = useState(null);

  /* ================= LOAD SAVED ================= */
  const loadSaved = async () => {
    if (!providerProfileId) return;

    try {
      const { data } = await API.get("/provider/services/saved", {
        params: { providerProfileId },
      });
      setSavedServices(data);
    } catch {}
  };

  useEffect(() => {
    loadSaved();
  }, [providerProfileId]);

  /* ================= MAP ================= */
  const savedMap = useMemo(() => {
    const map = new Map();
    savedServices.forEach((s) =>
      map.set(String(s.providerServiceId), s)
    );
    return map;
  }, [savedServices]);

  /* ================= GROUP ================= */
  const grouped = useMemo(() => {
    const map = {};

    services.forEach((s) => {
      const cat = s.category || "Uncategorized";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });

    return map;
  }, [services]);

  /* ================= INIT COLLAPSE ================= */
  useEffect(() => {
    const initial = {};
    const keys = Object.keys(grouped);

    keys.forEach((cat, i) => {
      initial[cat] = i === 0; // only first open
    });

    setExpanded(initial);
  }, [services]);

  /* ================= ACTIONS ================= */
  const toggleCategory = (cat) => {
    setExpanded((p) => ({ ...p, [cat]: !p[cat] }));
  };

  const toggleService = (id) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  };

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
      toast.error("Failed");
    } finally {
      setLoading(null);
    }
  };

  const importSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return toast.error("Nothing selected");

    try {
      setLoading("bulk");

      await API.post("/provider/import-selected", {
        providerProfileId,
        serviceIds: ids,
      });

      toast.success("Imported selected");
      loadSaved();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* BULK ACTION */}
      <div className="flex justify-end mb-4">
        <button
          onClick={importSelected}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm shadow"
        >
          {loading === "bulk" ? "Importing..." : "Import Selected"}
        </button>
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, list]) => {
          return (
            <div
              key={category}
              className="border rounded-2xl shadow-sm bg-white"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center px-5 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-lg font-semibold"
                  >
                    {expanded[category] ? "−" : "+"}
                  </button>

                  <h2 className="font-bold text-gray-800 text-base">
                    {category}
                  </h2>

                  <span className="text-xs text-gray-500">
                    ({list.length} services)
                  </span>
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

              {/* TABLE */}
              {expanded[category] && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                      <tr>
                        <th className="p-3"></th>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Service</th>
                        <th className="p-3 text-left">Rate</th>
                        <th className="p-3 text-left">Min</th>
                        <th className="p-3 text-left">Max</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {list.map((s) => {
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
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={!!selected[s.service]}
                                onChange={() =>
                                  toggleService(s.service)
                                }
                              />
                            </td>

                            <td className="p-3">{s.service}</td>
                            <td className="p-3">{s.name}</td>
                            <td className="p-3 font-medium">
                              ${Number(s.rate).toFixed(4)}
                            </td>
                            <td className="p-3">{s.min}</td>
                            <td className="p-3">{s.max}</td>

                            <td className="p-3">
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

                            <td className="p-3 flex gap-2">
                              {s.description && (
                                <button
                                  onClick={() =>
                                    setViewDescription(s)
                                  }
                                  className="bg-gray-200 px-2 py-1 text-xs rounded"
                                >
                                  View
                                </button>
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
