// src/components/ProviderServiceTable.jsx
import { useState, useMemo, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderServiceTable = ({ services, providerProfileId }) => {
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(null);

  const safeServices = Array.isArray(services) ? services : [];

  /* LOAD SAVED */
  useEffect(() => {
    if (!providerProfileId) return;

    API.get("/provider/services/saved", {
      params: { providerProfileId },
    })
      .then((res) => setSaved(res.data || []))
      .catch(() => setSaved([]));
  }, [providerProfileId]);

  const savedMap = useMemo(() => {
    const map = new Map();
    saved.forEach((s) =>
      map.set(String(s.providerServiceId), s)
    );
    return map;
  }, [saved]);

  const toggle = (id) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
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

      toast.success("Imported");
      setSelected({});
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(null);
    }
  };

  if (!safeServices.length) {
    return (
      <div className="bg-white p-6 rounded-xl text-center text-gray-500">
        No services
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-gray-700">
          Services ({safeServices.length})
        </h3>

        <button
          onClick={importSelected}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          {loading === "bulk" ? "Importing..." : "Import Selected"}
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Rate</th>
              <th className="p-3 text-left">Min</th>
              <th className="p-3 text-left">Max</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {safeServices.map((s) => {
              const id = String(s.service);
              const existing = savedMap.get(id);

              return (
                <tr
                  key={id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={!!selected[id]}
                      onChange={() => toggle(id)}
                    />
                  </td>

                  <td className="p-3">{id}</td>

                  <td className="p-3 font-medium text-gray-800">
                    {s.name}
                  </td>

                  <td className="p-3">
                    ${Number(s.rate || 0).toFixed(4)}
                  </td>

                  <td className="p-3">{s.min}</td>
                  <td className="p-3">{s.max}</td>

                  <td className="p-3">
                    <span
                      className={`text-xs font-semibold ${
                        existing
                          ? existing.deleted
                            ? "text-red-500"
                            : "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {existing
                        ? existing.deleted
                          ? "Deleted"
                          : "Imported"
                        : "New"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderServiceTable;
