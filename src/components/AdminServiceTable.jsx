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

  // ================= SORT BY CATEGORY (NO HEADER ROWS) =================
  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      const catA = a.category || "";
      const catB = b.category || "";
      return catA.localeCompare(catB);
    });
  }, [filteredServices]);

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
    if (selectedIds.length === filteredServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map((s) => s._id));
    }
  };

  // ================= BULK ACTIONS =================
  const bulkHide = async () => {
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
        selectedIds.map((id) =>
          API.delete(`/admin/services/${id}`)
        )
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

  // ================= API ACTIONS =================
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
        <div className="mb-4 flex justify-between items-center bg-yellow-50 border border-yellow-300 p-3 rounded-lg">
          <span className="text-sm font-medium">
            {changedServices.length} services have updated rates
          </span>
          <button
            onClick={acceptAll}
            disabled={updating}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            Accept All
          </button>
        </div>
      )}

      {/* BULK BAR */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>

          <div className="flex gap-3">
            <button
              onClick={bulkHide}
              disabled={updating}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
            >
              Hide
            </button>

            <button
              onClick={bulkDelete}
              disabled={updating}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Service ID, Provider ID, Category, Name or Rate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Provider ID</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {sortedServices.map((s) => {
              const diff = getRateDiff(s);

              return (
                <tr key={s._id} className="hover:bg-gray-50">

                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s._id)}
                      onChange={() => toggleSelect(s._id)}
                    />
                  </td>

                  <td className="px-4 py-3 text-xs flex items-center gap-2 whitespace-nowrap">
                    <span>{s.serviceId || s._id?.slice(-6)}</span>
                    <button
                      onClick={() =>
                        copyToClipboard(s.serviceId || s._id?.slice(-6))
                      }
                    >
                      <FiCopy size={14} />
                    </button>
                  </td>

                  <td className="px-4 py-3">{s.platform}</td>

                  <td className="px-4 py-3">
                    {s.category}
                    {s.isDefaultCategoryGlobal && " (Global Default)"}
                    {s.isDefaultCategoryPlatform && " (Platform Default)"}
                  </td>

                  <td className="px-4 py-3">
                    {s.name} {s.isDefault && "(Service Default)"}
                  </td>

                  <td className="px-4 py-3">{s.provider}</td>

                  <td className="px-4 py-3 flex items-center gap-2">
                    {s.providerServiceId}
                    <button
                      onClick={() => copyToClipboard(s.providerServiceId)}
                    >
                      <FiCopy size={14} />
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    {s.isFree ? "FREE" : `$${s.rate}`}
                  </td>

                  <td className="px-4 py-3">
                    {diff && (
                      <span
                        className={`font-bold ${
                          diff.isIncrease ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {diff.isIncrease ? "+" : ""}
                        {diff.value}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedDescription(s.description)}
                      className="bg-gray-800 text-white px-3 py-1 rounded text-xs"
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

                  <td className="px-4 py-3 flex flex-wrap gap-2">

                    {diff && (
                      <>
                        <button
                          onClick={() => acceptRate(s._id)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => declineRate(s._id)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Decline
                        </button>
                      </>
                    )}

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
                      Toggle
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
          </tbody>
        </table>
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
