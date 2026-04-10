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

  const handleSelect = (id) => {
    handleChange({
      target: { name: "providerProfileId", value: id },
    });
    setShowDropdown(false);
  };

  const handleView = (provider) => {
    setViewProvider(provider);
    setEditMode(false);
  };

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
    } catch {
      toast.error("Failed to update provider");
    }
  };

  return (
    <div className="relative">
      {/* ================= SELECT ================= */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-3 border rounded-lg bg-white cursor-pointer flex justify-between items-center"
      >
        <span className="truncate">
          {selectedProvider ? selectedProvider.name : "Select Provider"}
        </span>
        <span className="text-gray-400 text-sm">▼</span>
      </div>

      {/* ================= DROPDOWN ================= */}
      {showDropdown && (
        <div className="absolute z-50 w-full bg-white border rounded-xl shadow-lg mt-2 max-h-72 overflow-y-auto">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border-b outline-none text-sm"
          />

          {/* LIST */}
          {filteredProviders.map((p) => (
            <div
              key={p._id}
              className="p-3 hover:bg-gray-50 border-b flex justify-between items-center"
            >
              {/* LEFT */}
              <div
                className="cursor-pointer"
                onClick={() => handleSelect(p._id)}
              >
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">
                  {p.apiUrl}
                </p>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleView(p)}
                  className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600"
                  title="View"
                >
                  👁
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="p-1.5 rounded-md hover:bg-green-50 text-green-600"
                  title="Edit"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}

          {/* ADD NEW */}
          <div
            onClick={() => handleSelect("new")}
            className="p-3 text-center text-blue-600 cursor-pointer hover:bg-gray-50 text-sm"
          >
            ➕ Add New Provider
          </div>
        </div>
      )}

      {/* ================= NEW PROVIDER ================= */}
      {isAddingNewProvider && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <input
            name="newProviderName"
            placeholder="Provider Name"
            value={form.newProviderName}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />
          <input
            name="providerApiUrl"
            placeholder="API URL"
            value={form.providerApiUrl}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />
          <input
            name="providerApiKey"
            placeholder="API Key"
            value={form.providerApiKey}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />
        </div>
      )}

      {/* ================= MODAL ================= */}
      {viewProvider && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold">
              {editMode ? "Edit Provider" : "Provider Details"}
            </h3>

            <input
              value={editMode ? editData.name : viewProvider.name}
              disabled={!editMode}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />

            <input
              value={editMode ? editData.apiUrl : viewProvider.apiUrl}
              disabled={!editMode}
              onChange={(e) =>
                setEditData({ ...editData, apiUrl: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />

            <input
              value={editMode ? editData.apiKey : viewProvider.apiKey}
              disabled={!editMode}
              onChange={(e) =>
                setEditData({ ...editData, apiKey: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewProvider(null)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                Close
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"
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
