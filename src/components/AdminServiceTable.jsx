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
  const [selectedService, setSelectedService] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // ✅ NEW

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
    navigator.clipboard.writeText(String(text || "No Description"));
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

  // ================= BULK =================
  const bulkToggle = async () => {
    try {
      setUpdating(true);

      await Promise.all(
        selectedIds.map((id) =>
          API.patch(`/admin/services/${id}/toggle`)
        )
      );

      toast.success("Selected services updated");
      window.location.reload();
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setUpdating(false);
    }
  };

  const bulkDelete = async () => {
    if (!deleteTarget) return;

    try {
      setUpdating(true);

      if (Array.isArray(deleteTarget)) {
        await Promise.all(
          deleteTarget.map((id) =>
            API.delete(`/admin/services/${id}`)
          )
        );
      } else {
        await API.delete(`/admin/services/${deleteTarget}`);
      }

      toast.success("Deleted successfully");
      window.location.reload();
    } catch {
      toast.error("Delete failed");
    } finally {
      setUpdating(false);
      setDeleteTarget(null);
    }
  };

  // ================= RATE =================
  const getRateDiff = (s) => {
    if (!s.newRate || s.newRate === s.rate) return null;

    const diff = (s.newRate - s.rate).toFixed(6);
    return { value: diff, isIncrease: diff > 0 };
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

      {/* BULK BAR */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-blue-50 border p-3 rounded-lg">
          <span>{selectedIds.length} selected</span>
          <div className="flex gap-3">
            <button onClick={bulkToggle} className="bg-yellow-500 text-white px-3 py-1 rounded">
              Toggle
            </button>
            <button
              onClick={() => setDeleteTarget(selectedIds)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table className="w-full text-sm">
        <tbody>
          {groupedServices.map(([category, items]) => (
            <>
              <tr key={category} className="bg-gray-200">
                <td>
                  <input
                    type="checkbox"
                    onChange={() => toggleSelectCategory(items)}
                    checked={items.every((i) =>
                      selectedIds.includes(i._id)
                    )}
                  />
                </td>
                <td colSpan="10">{category}</td>
              </tr>

              {items.map((s) => (
                <tr key={s._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s._id)}
                      onChange={() => toggleSelect(s._id)}
                    />
                  </td>

                  <td>{s.name}</td>

                  <td>
                    <button
                      onClick={() => setSelectedService(s)}
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                    >
                      View
                    </button>
                  </td>

                  <td>
                    <button
                      onClick={() => setDeleteTarget(s._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>

      {/* ✅ DESCRIPTION MODAL */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] relative">

            <FiX
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setSelectedService(null)}
            />

            <h3 className="font-bold mb-3">{selectedService.name}</h3>

            <div className="bg-gray-100 p-3 rounded text-sm mb-4">
              {selectedService.description || "No Description"}
            </div>

            <button
              onClick={() =>
                copyToClipboard(selectedService.description)
              }
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              <FiCopy size={14} /> Copy
            </button>

          </div>
        </div>
      )}

      {/* ✅ DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] text-center">

            <h3 className="text-lg font-bold mb-2 text-red-600">
              Confirm Delete
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={bulkDelete}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceTable;
