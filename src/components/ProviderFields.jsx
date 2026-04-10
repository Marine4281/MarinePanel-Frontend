//src/components/ProviderFields.jsx

import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ProviderFields = ({
  form,
  handleChange,
  providers,
  isAddingNewProvider,
  onProviderCreated,   // 🔥 NEW
  onProviderUpdated,   // 🔥 NEW
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

  /* ================= CREATE ================= */
  const handleCreateProvider = async () => {
    try {
      if (
        !form.newProviderName ||
        !form.providerApiUrl ||
        !form.providerApiKey
      ) {
        return toast.error("All fields are required");
      }

      const res = await API.post("/provider/profiles", {
        name: form.newProviderName,
        apiUrl: form.providerApiUrl,
        apiKey: form.providerApiKey,
      });

      const newProvider = res.data.provider;

      toast.success("🎉 Provider created");

      // 🔥 Instant UI update
      onProviderCreated?.(newProvider);

      handleChange({
        target: {
          name: "providerProfileId",
          value: newProvider._id,
        },
      });

      handleChange({ target: { name: "newProviderName", value: "" } });
      handleChange({ target: { name: "providerApiUrl", value: "" } });
      handleChange({ target: { name: "providerApiKey", value: "" } });

    } catch {
      toast.error("Failed to create provider");
    }
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
    setEditData({ ...provider });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editData.name || !editData.apiUrl || !editData.apiKey) {
        return toast.error("All fields are required");
      }

      const res = await API.put(
        `/provider/profiles/${viewProvider._id}`,
        editData
      );

      const updated = res.data.provider;

      toast.success("✅ Provider updated");

      // 🔥 Instant UI update
      onProviderUpdated?.(updated);

      setViewProvider(null);
      setEditMode(false);
      setEditData({});

    } catch {
      toast.error("Failed to update provider");
    }
  };

  return (
    <div className="relative">
      {/* ================= SELECT ================= */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-4 border rounded-xl bg-gradient-to-r from-white to-gray-50 cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md transition"
      >
        <span className="truncate text-sm font-medium text-gray-700">
          {selectedProvider ? selectedProvider.name : "Select Provider"}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {/* ================= DROPDOWN ================= */}
      {showDropdown && (
        <div className="absolute z-50 w-full bg-white border rounded-xl shadow-xl mt-2 max-h-80 overflow-y-auto">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="🔍 Search provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border-b outline-none text-sm focus:ring-2 focus:ring-blue-500"
          />

          {/* LIST */}
          {filteredProviders.map((p) => (
            <div
              key={p._id}
              className={`p-3 border-b flex justify-between items-center transition ${
                selectedProvider?._id === p._id
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => handleSelect(p._id)}
              >
                <p className="font-medium text-sm text-gray-800">
                  {p.name}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-[180px]">
                  {p.apiUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(p)}
                  className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  View
                </button>

                <button
                  onClick={() => handleEdit(p)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {/* ADD NEW */}
          <div
            onClick={() => handleSelect("new")}
            className="p-3 text-center text-blue-600 cursor-pointer hover:bg-blue-50 font-medium"
          >
            + Add New Provider
          </div>
        </div>
      )}

      {/* ================= NEW PROVIDER ================= */}
      {isAddingNewProvider && (
        <div className="mt-5 border rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white space-y-4 shadow-inner">

          <h4 className="text-sm font-semibold text-gray-700">
            ➕ Add New Provider
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="newProviderName"
              placeholder="Provider Name"
              value={form.newProviderName}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="providerApiUrl"
              placeholder="API URL"
              value={form.providerApiUrl}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="providerApiKey"
              placeholder="API Key"
              value={form.providerApiKey}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() =>
                handleChange({
                  target: { name: "providerProfileId", value: "" },
                })
              }
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateProvider}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              💾 Save Provider
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {viewProvider && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">

            <h3 className="text-lg font-bold mb-4">
              {editMode ? "✏️ Edit Provider" : "Provider Details"}
            </h3>

            <div className="space-y-4">
              {["name", "apiUrl", "apiKey"].map((field) => (
                <input
                  key={field}
                  value={
                    editMode
                      ? editData[field]
                      : viewProvider[field]
                  }
                  disabled={!editMode}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      [field]: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setViewProvider(null);
                  setEditMode(false);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>

              {editMode && (
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
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
