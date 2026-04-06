//src/components/AdminServiceTable.jsx
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

  // ================= RATE CHANGE LOGIC =================
  const getRateDiff = (s) => {
    if (!s.newRate || s.newRate === s.rate) return null;

    const diff = (s.newRate - s.rate).toFixed(6);

    return {
      value: diff,
      isIncrease: diff > 0,
    };
  };

  // ================= ACCEPT SINGLE =================
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

  // ================= DECLINE SINGLE =================
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

  // ================= ACCEPT ALL =================
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

      {/* ================= BULK ACTION ================= */}
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
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.map((s) => {
              const diff = getRateDiff(s);

              return (
                <tr key={s._id} className="border-t">

                  <td className="px-4 py-3 flex items-center gap-2">
                    {s.serviceId}
                    <FiCopy
                      className="cursor-pointer"
                      onClick={() => copyToClipboard(s.serviceId)}
                    />
                  </td>

                  <td className="px-4 py-3">{s.name}</td>

                  <td className="px-4 py-3">{s.provider}</td>

                  {/* RATE */}
                  <td className="px-4 py-3">
                    ${s.rate}
                  </td>

                  {/* CHANGE */}
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

                  {/* ACTIONS */}
                  <td className="px-4 py-3 flex gap-2">

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
