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
          placeholder="Search by Service ID, Provider ID, Category, Name or Rate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase text-gray-600 text-xs">
            <tr>
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
            {filteredServices.map((s) => {
              const diff = getRateDiff(s);

              return (
                <tr key={s._id} className="hover:bg-gray-50">

                  {/* SYSTEM ID */}
                  <td className="px-4 py-3 text-xs flex items-center gap-2 whitespace-nowrap">
                    <span>{s.serviceId || s._id?.slice(-6)}</span>
                    <button
                      onClick={() =>
                        copyToClipboard(s.serviceId || s._id?.slice(-6))
                      }
                      className="text-gray-500 hover:text-black"
                    >
                      <FiCopy size={14} />
                    </button>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.platform}
                  </td>

                  {/* CATEGORY */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.category}
                    {s.isDefaultCategoryGlobal && " (Global Default)"}
                    {s.isDefaultCategoryPlatform && " (Platform Default)"}
                  </td>

                  {/* SERVICE NAME */}
                  <td className="px-4 py-3 max-w-[300px] break-words">
                    {s.name
                      ?.replace(/\n/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}{" "}
                    {s.isDefault && "(Service Default)"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.provider}
                  </td>

                  {/* PROVIDER ID */}
                  <td className="px-4 py-3 flex items-center gap-2 whitespace-nowrap">
                    {s.providerServiceId}
                    <button
                      onClick={() => copyToClipboard(s.providerServiceId)}
                      className="text-gray-500 hover:text-black"
                    >
                      <FiCopy size={14} />
                    </button>
                  </td>

                  {/* RATE */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.isFree ? "FREE" : `$${s.rate}`}
                  </td>

                  {/* CHANGE */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {diff && (
                      <span
                        className={`font-bold ${
                          diff.isIncrease
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {diff.isIncrease ? "+" : ""}
                        {diff.value}
                      </span>
                    )}
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedDescription(s.description)}
                      className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-black"
                    >
                      View
                    </button>
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
                  <td className="px-4 py-3 flex flex-wrap gap-2 whitespace-nowrap">

                    {diff && (
                      <>
                        <button
                          onClick={() => acceptRate(s._id)}
                          disabled={updating}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => declineRate(s._id)}
                          disabled={updating}
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
                      className={`px-2 py-1 rounded text-xs text-white ${
                        s.status ? "bg-yellow-500" : "bg-green-600"
                      }`}
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
          </tbody>
        </table>
      </div>

      {/* ================= DESCRIPTION MODAL ================= */}
      {selectedDescription !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[550px] max-w-[95%] shadow-2xl relative">

            <button
              onClick={() => setSelectedDescription(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-6 text-center">
              Service Description
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line max-h-[300px] overflow-y-auto">
              {selectedDescription || "No description provided"}
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => copyToClipboard(selectedDescription)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
              >
                <FiCopy />
                Copy
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminServiceTable;
