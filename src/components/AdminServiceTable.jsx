// src/components/AdminServiceTable.jsx
import { useState, useMemo } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../api/axios";

const AdminServiceTable = ({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState("");
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [updating, setUpdating] = useState(false);

  // ================= SEARCH =================
  const filteredServices = useMemo(() => {
    if (!search) return services;

    const q = search.toLowerCase();

    return services.filter((s) =>
      String(s.providerServiceId || "").toLowerCase().includes(q) ||
      String(s.serviceId || "").includes(search) ||
      String(s._id || "").toLowerCase().includes(q) ||
      String(s.category || "").toLowerCase().includes(q) ||
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.rate || "").includes(search)
    );
  }, [search, services]);

  // ================= GROUP =================
  const groupedServices = useMemo(() => {
    return Object.entries(
      filteredServices.reduce((acc, service) => {
        const category = service.category || "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(service);
        return acc;
      }, {})
    );
  }, [filteredServices]);

  // ================= RATE HELPERS =================
  const getProviderRate = (s) => {
    return Number(
      s.newRate ??
      s.lastSyncedRate ??
      s.rate ?? // ✅ FIX: fallback to actual rate
      0
    );
  };

  const getYourRate = (s) => {
    return Number(s.rate ?? 0);
  };

  const getDiffValue = (s) => {
    const providerRate = getProviderRate(s);
    const yourRate = getYourRate(s);
    return providerRate - yourRate;
  };

  const getDiffFormatted = (s) => {
    const diff = getDiffValue(s);
    if (diff === 0) return null;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(4)}`;
  };

  // ================= RATE CHANGES =================
  const rateChanges = useMemo(() => {
    return services
      .map((s) => {
        const providerRate = getProviderRate(s);
        const yourRate = getYourRate(s);

        // ✅ FIX: removed "!providerRate"
        if (providerRate === yourRate) return null;

        return {
          ...s,
          providerRate,
          yourRate,
          diff: providerRate - yourRate,
        };
      })
      .filter(Boolean);
  }, [services]);

  // ================= ACTIONS =================
  const acceptRate = async (id) => {
    try {
      setUpdating(true);

      await API.put(`/admin/services/${id}`, {
        // optional but safer if backend supports it
        // rate: providerRate,
        // lastSyncedRate: providerRate,
      });

      toast.success("Rate synced");
      window.location.reload();
    } catch {
      toast.error("Failed");
    } finally {
      setUpdating(false);
    }
  };

  const updateAllRates = async () => {
    if (rateChanges.length === 0) return;

    try {
      setUpdating(true);

      await Promise.all(
        rateChanges.map((s) =>
          API.put(`/admin/services/${s._id}`, {})
        )
      );

      toast.success("All rates synced");
      window.location.reload();
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setUpdating(false);
    }
  };

  // ================= SELECT =================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map((s) => s._id));
    }
  };

  const toggleSelectCategory = (items) => {
    const ids = items.map((i) => i._id);
    const allSelected = ids.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      {/* 🔥 RATE SUMMARY */}
      {rateChanges.length > 0 && (
        <div className="mb-6 border rounded-xl p-4 bg-yellow-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-yellow-800">
              ⚠ Rate Changes ({rateChanges.length})
            </h2>

            <button
              onClick={updateAllRates}
              disabled={updating}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs"
            >
              {updating ? "Updating..." : "Update All"}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {rateChanges.map((s) => (
              <div
                key={s._id}
                className="flex justify-between bg-white p-2 rounded border text-sm"
              >
                <div>
                  <strong>{s.name}</strong>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="text-gray-500">
                    Your: {s.yourRate.toFixed(4)}
                  </span>
                  <span>→</span>
                  <span className="font-semibold">
                    Provider: {s.providerRate.toFixed(4)}
                  </span>

                  <span
                    className={`text-xs ${
                      s.diff > 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {s.diff > 0 ? "+" : ""}
                    {s.diff.toFixed(4)}
                  </span>

                  <button
                    onClick={() => acceptRate(s._id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                    disabled={updating}
                  >
                    Sync
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-xl"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" onChange={toggleSelectAll} />
              </th>
              <th className="px-4 py-3">System ID</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Provider ID</th>
              <th className="px-4 py-3">Provider Rate</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {groupedServices.map(([category, items]) => (
              <>
                <tr key={category} className="bg-gray-200">
                  <td />
                  <td colSpan="9" className="px-4 py-3 font-bold">
                    📦 {category} ({items.length})
                  </td>
                </tr>

                {items.map((s) => {
                  const providerRate = getProviderRate(s);
                  const diff = getDiffFormatted(s);

                  return (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s._id)}
                          onChange={() => toggleSelect(s._id)}
                        />
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {s.serviceId || s._id?.slice(-6)}
                      </td>

                      <td className="px-4 py-3">{s.platform}</td>
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">{s.provider}</td>
                      <td className="px-4 py-3">{s.providerServiceId}</td>

                      <td className="px-4 py-3">
                        {providerRate.toFixed(4)}
                        {diff && (
                          <span
                            className={`ml-2 text-xs ${
                              diff.startsWith("+")
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            ({diff})
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            setSelectedDescription(
                              s.description || "No description"
                            )
                          }
                          className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
                        >
                          View
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full text-white ${
                            s.status ? "bg-green-500" : "bg-gray-500"
                          }`}
                        >
                          {s.status ? "Visible" : "Hidden"}
                        </span>
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => onEdit(s)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onToggleStatus(s._id)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          {s.status ? "Hide" : "Show"}
                        </button>

                        <button
                          onClick={() => onDelete(s._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedDescription && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px] relative">
            <button
              onClick={() => setSelectedDescription(null)}
              className="absolute top-3 right-3"
            >
              <FiX />
            </button>
            <p>{selectedDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceTable;
