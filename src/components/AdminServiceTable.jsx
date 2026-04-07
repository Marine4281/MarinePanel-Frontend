// src/components/AdminServiceTable.jsx
import { useState, useMemo } from "react";
import { FiCopy, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
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
  const [openCategories, setOpenCategories] = useState({});

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

  // ================= GROUP BY CATEGORY =================
  const groupedServices = useMemo(() => {
    return Object.values(
      filteredServices.reduce((acc, service) => {
        const key = service.category || "Uncategorized";

        if (!acc[key]) {
          acc[key] = {
            category: key,
            services: [],
          };
        }

        acc[key].services.push(service);
        return acc;
      }, {})
    );
  }, [filteredServices]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success("Copied!");
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
    const allIds = filteredServices.map((s) => s._id);

    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  // ================= BULK ACTIONS =================
  const bulkHide = async () => {
    try {
      setUpdating(true);
      await Promise.all(
        selectedIds.map((id) => API.patch(`/admin/services/${id}/toggle`))
      );
      toast.success("Selected services updated");
      window.location.reload();
    } catch {
      toast.error("Bulk hide failed");
    } finally {
      setUpdating(false);
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm("Delete selected services?")) return;

    try {
      setUpdating(true);
      await Promise.all(
        selectedIds.map((id) => API.delete(`/admin/services/${id}`))
      );
      toast.success("Selected services deleted");
      window.location.reload();
    } catch {
      toast.error("Bulk delete failed");
    } finally {
      setUpdating(false);
    }
  };

  // ================= RATE CHANGE =================
  const getRateDiff = (s) => {
    if (!s.newRate || s.newRate === s.rate) return null;

    const diff = (s.newRate - s.rate).toFixed(6);

    return {
      value: diff,
      isIncrease: diff > 0,
    };
  };

  const acceptRate = async (id) => {
    try {
      setUpdating(true);
      await API.patch(`/admin/services/${id}/accept-rate`);
      toast.success("Rate updated");
      window.location.reload();
    } catch {
      toast.error("Failed to update rate");
    } finally {
      setUpdating(false);
    }
  };

  const declineRate = async (id) => {
    try {
      setUpdating(true);
      await API.patch(`/admin/services/${id}/decline-rate`);
      toast.success("Rate change declined");
      window.location.reload();
    } catch {
      toast.error("Failed to decline");
    } finally {
      setUpdating(false);
    }
  };

  const acceptAll = async () => {
    try {
      setUpdating(true);
      await API.patch(`/admin/services/accept-all-rates`);
      toast.success("All rates updated");
      window.location.reload();
    } catch {
      toast.error("Failed to update all");
    } finally {
      setUpdating(false);
    }
  };

  const changedServices = services.filter(
    (s) => s.newRate && s.newRate !== s.rate
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      {/* RATE BULK */}
      {changedServices.length > 0 && (
        <div className="mb-4 flex justify-between bg-yellow-50 border p-3 rounded-lg">
          <span>{changedServices.length} services have updated rates</span>
          <button
            onClick={acceptAll}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Accept All
          </button>
        </div>
      )}

      {/* BULK BAR */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex justify-between bg-blue-50 border p-3 rounded-lg">
          <span>{selectedIds.length} selected</span>
          <div className="flex gap-3">
            <button onClick={bulkHide} className="bg-yellow-500 text-white px-3 py-1 rounded">
              Hide
            </button>
            <button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1 rounded">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 p-3 border rounded-xl mb-6"
      />

      {/* SELECT ALL */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={toggleSelectAll}
            checked={
              selectedIds.length === filteredServices.length &&
              filteredServices.length > 0
            }
          />
          Select All
        </label>
      </div>

      {/* ================= CATEGORY VIEW ================= */}
      <div className="space-y-4">
        {groupedServices.map((group) => {
          const isOpen = openCategories[group.category];

          return (
            <div key={group.category} className="border rounded-xl">

              {/* CATEGORY HEADER */}
              <div
                onClick={() => toggleCategory(group.category)}
                className="flex justify-between items-center p-4 cursor-pointer bg-gray-100"
              >
                <div className="flex items-center gap-2 font-semibold">
                  {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                  📦 {group.category}
                  <span className="text-sm text-gray-500">
                    ({group.services.length})
                  </span>
                </div>
              </div>

              {/* SERVICES */}
              {isOpen && (
                <div className="divide-y">
                  {group.services.map((s) => {
                    const diff = getRateDiff(s);

                    return (
                      <div key={s._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s._id)}
                            onChange={() => toggleSelect(s._id)}
                          />

                          <div>
                            <div className="font-medium">
                              {s.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {s.serviceId || s._id?.slice(-6)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">

                          <span>{s.platform}</span>

                          <span>
                            {s.isFree ? "FREE" : `$${s.rate}`}
                          </span>

                          {diff && (
                            <span className={diff.isIncrease ? "text-red-500" : "text-green-500"}>
                              {diff.isIncrease ? "+" : ""}
                              {diff.value}
                            </span>
                          )}

                          <button onClick={() => setSelectedDescription(s.description)} className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
                            View
                          </button>

                          <button onClick={() => onEdit(s)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Edit
                          </button>

                          <button onClick={() => onToggleStatus(s._id)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                            Toggle
                          </button>

                          <button onClick={() => onDelete(s._id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selectedDescription && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <FiX onClick={() => setSelectedDescription(null)} />
            <p>{selectedDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceTable;
