// src/components/childpanel/services/import/CPImportAddProviderModal.jsx
import { useState } from "react";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";

export default function CPImportAddProviderModal({ onClose, onAdded }) {
  const [form, setForm]       = useState({ name: "", apiUrl: "", apiKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.apiUrl || !form.apiKey)
      return toast.error("All fields required");
    setLoading(true);
    try {
      const res = await API.post("/cp/providers/profiles", form);
      toast.success("Provider connected");
      onAdded(res.data.provider);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Connect a Provider</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {[
          { label: "Provider Name", key: "name",   placeholder: "e.g. SMMKings",                   type: "text" },
          { label: "API URL",       key: "apiUrl",  placeholder: "https://provider.com/api/v2",     type: "url"  },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
            <input
              type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"} value={form.apiKey} onChange={set("apiKey")}
              placeholder="Secret API key"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="button" onClick={() => setShowKey((s) => !s)}
              className="absolute right-3 top-2.5 text-gray-400">
              {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
