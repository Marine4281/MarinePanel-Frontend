// src/components/AdminServiceTable.jsx
import { useState, useMemo } from "react";
import { FiCopy, FiX } from "react-icons/fi";
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

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success("Copied!");
  };

  // ================= RATE HELPERS =================
  const getProviderRate = (s) => {
    return s.newRate ?? s.lastSyncedRate ?? 0;
  };

  const getRateStatus = (s) => {
    const providerRate = getProviderRate(s);
    const yourRate = s.rate || 0;

    if (!providerRate) return "neutral";

    if (providerRate > yourRate) return "loss"; // bad
    if (providerRate < yourRate) return "profit"; // good
    return "same";
  };

  const getRateColor = (status, hasChange) => {
    if (hasChange) return "bg-yellow-50 border-yellow-300";

    switch (status) {
      case "loss":
        return "bg-red-50 border-red-300";
      case "profit":
        return "bg-green-50 border-green-300";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getDiff = (s) => {
    const providerRate = getProviderRate(s);
    const yourRate = s.rate || 0;

    return (yourRate - providerRate).toFixed(6);
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

  // ================= RATE ACTIONS =================
  const acceptRate = async (id) => {
    try {
      setUpdating(true);
      await API.put(`/admin/services/${id}`, {}); // triggers backend update
      toast.success("Rate synced");
      window.location.reload();
    } catch {
      toast.error("Failed");
    } finally {
      setUpdating(false);
    }
  };

  // ================= UI =================
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

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
          <thead className="bg-gray-100 uppercase text-gray-600 text-xs">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === filteredServices.length &&
                    filteredServices.length > 0
                  }
                />
              </th>
              <th className="px-4 py-3">System ID</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Provider ID</th>
              <th className="px-4 py-3">Rates</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {groupedServices.map(([category, items]) => (
              <>
                <tr key={category} className="bg-gray-200">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={() => toggleSelectCategory(items)}
                      checked={items.every((i) =>
                        selectedIds.includes(i._id)
                      )}
                    />
                  </td>
                  <td colSpan="9" className="px-4 py-3 font-bold">
                    📦 {category} ({items.length})
                  </td>
                </tr>

                {items.map((s) => {
                  const providerRate = getProviderRate(s);
                  const status = getRateStatus(s);
                  const hasChange = s.newRate && s.newRate !== s.rate;
                  const diff = getDiff(s);

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

                      {/* 🔥 NEW RATE UI */}
                      <td className="px-4 py-3">
                        <div
                          className={`p-2 rounded-lg border text-xs ${getRateColor(
                            status,
                            hasChange
                          )}`}
                        >
                          <div>
                            <strong>Your:</strong> ${s.rate}
                          </div>
                          <div>
                            <strong>Provider:</strong> ${providerRate}
                          </div>
                          <div className="font-bold">
                            Diff: {diff}
                          </div>

                          {hasChange && (
                            <button
                              onClick={() => acceptRate(s._id)}
                              className="mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Sync
                            </button>
                          )}
                        </div>
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
          <div className="bg-white p-6 rounded-xl w-[400px]">
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
