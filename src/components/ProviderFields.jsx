import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderFields = ({
  form,
  handleChange,
  providers,
  isAddingNewProvider,
}) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [viewProvider, setViewProvider] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProvider = providers.find(
    (p) => p._id === form.providerProfileId
  );

  /* ================= SELECT ================= */
  const handleSelect = (id) => {
    handleChange({
      target: { name: "providerProfileId", value: id },
    });
    setShowDropdown(false);
  };

  /* ================= VIEW ================= */
  const handleView = (provider) => {
    setViewProvider(provider);
    setEditMode(false);
  };

  /* ================= EDIT ================= */
  const handleEdit = (provider) => {
    setViewProvider(provider);
    setEditMode(true);
    setEditData(provider);
  };

  const handleSaveEdit = async () => {
    try {
      await API.put(`/provider/profiles/${viewProvider._id}`, editData);
      toast.success("Provider updated");
      setViewProvider(null);
      window.location.reload(); // or refetch providers if you prefer
    } catch (err) {
      toast.error("Failed to update provider");
    }
  };

  return (
    <div className="relative col-span-1 md:col-span-2">
      {/* ================= SELECT BOX ================= */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-3 border rounded-lg bg-white cursor-pointer flex justify-between items-center"
      >
        <span>
          {selectedProvider
            ? selectedProvider.name
            : "Select Provider"}
        </span>
        <span>▼</span>
      </div>

      {/* ================= DROPDOWN ================= */}
      {showDropdown && (
        <div className="absolute z-50 w-full bg-white border rounded-xl shadow-lg mt-2 max-h-80 overflow-y-auto">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border-b outline-none"
          />

          {/* LIST */}
          {filteredProviders.map((p) => (
            <div
              key={p._id}
              className="p-3 hover:bg-gray-50 border-b flex justify-between items-center"
            >
              <div
                className="cursor-pointer flex-1"
                onClick={() => handleSelect(p._id)}
              >
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {p.apiUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(p)}
                  className="text-blue-500 text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(p)}
                  className="text-green-600 text-xs"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {/* ADD NEW */}
          <div
            onClick={() => handleSelect("new")}
            className="p-3 text-center text-blue-600 cursor-pointer hover:bg-gray-50"
          >
            ➕ Add New Provider
          </div>
        </div>
      )}

      {/* ================= NEW PROVIDER ================= */}
      {isAddingNewProvider && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <input
            name="newProviderName"
            placeholder="New Provider Name"
            value={form.newProviderName}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />
          <input
            name="providerApiUrl"
            placeholder="API URL"
            value={form.providerApiUrl}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />
          <input
            name="providerApiKey"
            placeholder="API Key"
            value={form.providerApiKey}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />
        </div>
      )}

      {/* ================= MODAL ================= */}
      {viewProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">
              {editMode ? "Edit Provider" : "Provider Details"}
            </h3>

            <input
              value={
                editMode ? editData.name : viewProvider.name
              }
              disabled={!editMode}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />

            <input
              value={
                editMode ? editData.apiUrl : viewProvider.apiUrl
              }
              disabled={!editMode}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  apiUrl: e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg"
            />

            <input
              value={
                editMode ? editData.apiKey : viewProvider.apiKey
              }
              disabled={!editMode}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  apiKey: e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setViewProvider(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>

              {editMode && (
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderFields;
