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
  const [collapsed, setCollapsed] = useState({});
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

  // ================= GROUPING =================
  const groupedServices = useMemo(() => {
    const groups = {};

    filteredServices.forEach((s) => {
      const key = `${s.platform}__${s.category}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          platform: s.platform,
          category: s.category,
          services: [],
        };
      }

      groups[key].services.push(s);
    });

    return Object.values(groups);
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

  // ✅ SELECT PER CATEGORY
  const toggleCategorySelect = (group) => {
    const ids = group.services.map((s) => s._id);

    const allSelected = ids.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
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
        <div className="mb-4 flex justify-between items-center bg-yellow-50 border p-3 rounded-lg">
          <span>{changedServices.length} services have updated rates</span>
          <button onClick={acceptAll} className="bg-green-600 text-white px-4 py-2 rounded">
            Accept All
          </button>
        </div>
      )}

      {/* BULK BAR */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex justify-between bg-blue-50 p-3 rounded-lg">
          <span>{selectedIds.length} selected</span>
          <div className="flex gap-3">
            <button onClick={bulkHide} className="bg-yellow-500 text-white px-3 py-1 rounded">Hide</button>
            <button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full md:w-1/2 p-3 border rounded-xl"
      />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedIds.length === filteredServices.length && filteredServices.length > 0}
                />
              </th>
              <th className="px-4 py-3">System ID</th>
              <th className="px-4 py-3">Platform</th>
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

          <tbody>
            {groupedServices.map((group) => (
              <>
                {/* CATEGORY HEADER */}
                <tr className="bg-blue-50">
                  <td colSpan="11" className="px-4 py-3 font-semibold text-blue-800 flex justify-between items-center">

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setCollapsed((prev) => ({
                            ...prev,
                            [group.key]: !prev[group.key],
                          }))
                        }
                      >
                        {collapsed[group.key] ? <FiChevronRight /> : <FiChevronDown />}
                      </button>

                      <span>
                        {group.platform} → {group.category} ({group.services.length})
                      </span>
                    </div>

                    <button
                      onClick={() => toggleCategorySelect(group)}
                      className="text-xs bg-gray-200 px-2 py-1 rounded"
                    >
                      Select All
                    </button>
                  </td>
                </tr>

                {/* SERVICES */}
                {!collapsed[group.key] &&
                  group.services.map((s) => {
                    const diff = getRateDiff(s);

                    return (
                      <tr key={s._id} className="border-t hover:bg-gray-50">

                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s._id)}
                            onChange={() => toggleSelect(s._id)}
                          />
                        </td>

                        <td className="px-4 py-3 flex gap-2">
                          {s.serviceId || s._id?.slice(-6)}
                          <FiCopy onClick={() => copyToClipboard(s.serviceId)} />
                        </td>

                        <td className="px-4 py-3">{s.platform}</td>

                        <td className="px-4 py-3">
                          {s.name} {s.isDefault && "(Default)"}
                        </td>

                        <td className="px-4 py-3">{s.provider}</td>

                        <td className="px-4 py-3 flex gap-2">
                          {s.providerServiceId}
                          <FiCopy onClick={() => copyToClipboard(s.providerServiceId)} />
                        </td>

                        <td className="px-4 py-3">
                          {s.isFree ? "FREE" : `$${s.rate}`}
                        </td>

                        <td className="px-4 py-3">
                          {diff && (
                            <span className={diff.isIncrease ? "text-red-600" : "text-green-600"}>
                              {diff.isIncrease ? "+" : ""}
                              {diff.value}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedDescription(s.description)}>View</button>
                        </td>

                        <td className="px-4 py-3">
                          {s.status ? "Visible" : "Hidden"}
                        </td>

                        <td className="px-4 py-3 flex gap-2">

                          {diff && (
                            <>
                              <button onClick={() => acceptRate(s._id)}>Accept</button>
                              <button onClick={() => declineRate(s._id)}>Decline</button>
                            </>
                          )}

                          <button onClick={() => onEdit(s)}>Edit</button>
                          <button onClick={() => onToggleStatus(s._id)}>Toggle</button>
                          <button onClick={() => onDelete(s._id)}>Delete</button>

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
