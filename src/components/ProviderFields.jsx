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
        <span className="truncate text-sm">
          {selectedProvider ? selectedProvider.name : "Select Provider"}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
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
                <p className="text-xs text-gray-400 truncate max-w-[160px]">
                  {p.apiUrl}
                </p>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleView(p)}
                  className="px-3 py-1 text-xs font-medium border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {/* ADD NEW */}
          <div
            onClick={() => handleSelect("new")}
            className="p-3 text-center text-blue-600 cursor-pointer hover:bg-gray-50 text-sm font-medium"
          >
            + Add New Provider
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
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">

            {/* HEADER */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editMode ? "Edit Provider" : "Provider Details"}
              </h3>
              <p className="text-sm text-gray-500">
                {editMode
                  ? "Update provider details"
                  : "View provider information"}
              </p>
            </div>

            {/* FIELDS */}
            <div className="space-y-4">

              {/* NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Provider Name
                </label>
                <input
                  value={editMode ? editData.name : viewProvider.name}
                  disabled={!editMode}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                />
              </div>

              {/* API URL */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  API URL
                </label>
                <input
                  value={editMode ? editData.apiUrl : viewProvider.apiUrl}
                  disabled={!editMode}
                  onChange={(e) =>
                    setEditData({ ...editData, apiUrl: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                />
              </div>

              {/* API KEY */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  API Key
                </label>
                <input
                  value={editMode ? editData.apiKey : viewProvider.apiKey}
                  disabled={!editMode}
                  onChange={(e) =>
                    setEditData({ ...editData, apiKey: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setViewProvider(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
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
