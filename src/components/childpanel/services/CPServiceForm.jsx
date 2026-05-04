// src/components/childpanel/services/CPServiceForm.jsx
// Modal for adding or editing a CP service (manual add or editing imported).

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../../../api/axios";

const INITIAL = {
  name: "",
  category: "",
  platform: "",
  rate: "",
  min: "10",
  max: "100000",
  description: "",
  refillAllowed: false,
  cancelAllowed: false,
};

export default function CPServiceForm({ service, onClose, onSaved }) {
  const isEdit = Boolean(service);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name || "",
        category: service.category || "",
        platform: service.platform || "",
        rate: service.rate ?? "",
        min: service.min ?? 10,
        max: service.max ?? 100000,
        description: service.description || "",
        refillAllowed: service.refillAllowed ?? false,
        cancelAllowed: service.cancelAllowed ?? false,
      });
    }
  }, [service]);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.platform) {
      return toast.error("Name, Category and Platform are required");
    }
    setSaving(true);
    try {
      if (isEdit) {
        const res = await API.put(`/cp/services/${service._id}`, form);
        toast.success("Service updated");
        onSaved(res.data.service, true);
      } else {
        const res = await API.post("/cp/services", form);
        toast.success("Service added");
        onSaved(res.data.service, false);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Service" : "Add Service Manually"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? "Update the service details below"
                : "Add a custom service to your panel"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: "Service Name *", key: "name", placeholder: "e.g. Instagram Followers HQ" },
            { label: "Category *", key: "category", placeholder: "e.g. Instagram - Followers" },
            { label: "Platform *", key: "platform", placeholder: "e.g. Instagram" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Rate ($) *", key: "rate", placeholder: "0.00" },
              { label: "Min Qty", key: "min", placeholder: "10" },
              { label: "Max Qty", key: "max", placeholder: "100000" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  min={0}
                  step="0.0001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Optional service description for your end users..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: "Refill Allowed", key: "refillAllowed" },
              { label: "Cancel Allowed", key: "cancelAllowed" },
            ].map(({ label, key }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={set(key)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
