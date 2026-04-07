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

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success("Copied!");
  };

  // ================= SELECT LOGIC =================
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

      toast.success("Selected services hidden");
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

  // ================= RATE LOGIC =================
  const getRateDiff = (s) => {
    if (!s.newRate || s.newRate === s.rate) return null;

    const diff = (s.newRate - s.rate).toFixed(6);

    return {
      value: diff,
      isIncrease: diff > 0,
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      {/* ================= BULK BAR ================= */}
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

      {/* ================= SEARCH ================= */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-xl"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs uppercase">
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
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.map((s) => {
              const diff = getRateDiff(s);

              return (
                <tr key={s._id} className="border-t">

                  {/* CHECKBOX */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s._id)}
                      onChange={() => toggleSelect(s._id)}
                    />
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 flex items-center gap-2">
                    {s.serviceId}
                    <FiCopy
                      className="cursor-pointer"
                      onClick={() => copyToClipboard(s.serviceId)}
                    />
                  </td>

                  <td className="px-4 py-3">{s.name}</td>

                  <td className="px-4 py-3">
                    {s.providerProfileId?.name || "—"}
                  </td>

                  <td className="px-4 py-3">${s.rate}</td>

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

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white ${
                        s.status ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      {s.status ? "Visible" : "Hidden"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 flex gap-2">

                    {diff && (
                      <>
                        <button
                          onClick={() =>
                            API.patch(`/admin/services/${s._id}/accept-rate`)
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            API.patch(`/admin/services/${s._id}/decline-rate`)
                          }
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

      {/* ================= MODAL ================= */}
      {selectedDescription && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <FiX
              className="cursor-pointer float-right"
              onClick={() => setSelectedDescription(null)}
            />
            <p>{selectedDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceTable;
