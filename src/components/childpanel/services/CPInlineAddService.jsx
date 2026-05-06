// src/components/childpanel/services/CPInlineAddService.jsx
// Always-visible quick-add form at the top of the services list.
// Mirrors admin panel's top-of-page service form.

import { useState, useEffect } from "react";
import { FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";
import API from "../../../api/axios";
import toast from "react-hot-toast";

const EMPTY = {
  platform: "",
  category: "",
  name: "",
  rate: "",
  min: "10",
  max: "100000",
  description: "",
  providerProfileId: "",
  providerServiceId: "",
  isFree: false,
  freeQuantity: "",
  cooldownHours: "",
  refillAllowed: false,
  cancelAllowed: false,
  isDefault: false,
};

export default function CPInlineAddService({ onAdded }) {
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    if (open) {
      API.get("/cp/providers/profiles")
        .then((r) => setProviders(r.data || []))
        .catch(() => {});
    }
  }, [open]);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (k === "isFree" && val) { next.rate = "0"; next.refillAllowed = false; }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.platform) {
      return toast.error("Platform, Category and Name are required");
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        rate:         form.isFree ? 0 : Number(form.rate),
        min:          form.isFree ? 1 : Number(form.min),
        max:          form.isFree ? Number(form.freeQuantity) : Number(form.max),
        freeQuantity: Number(form.freeQuantity) || 0,
        cooldownHours: Number(form.cooldownHours) || 0,
        providerProfileId: form.providerProfileId || null,
      };
      const res = await API.post("/cp/services", payload);
      toast.success("Service added");
      onAdded(res.data.service);
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-blue-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-blue-50 transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
            <FiPlus size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Quick Add Service</span>
          <span className="text-xs text-gray-400">— manually add a new service to your catalog</span>
        </div>
        {open ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-blue-100 px-5 py-4 bg-blue-50/30 space-y-4">
          {/* Row 1: core fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              placeholder="Platform *"
              value={form.platform}
              onChange={set("platform")}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="Category *"
              value={form.category}
              onChange={set("category")}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="Service Name *"
              value={form.name}
              onChange={set("name")}
              className="col-span-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Row 2: provider + pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <select
              value={form.providerProfileId}
              onChange={set("providerProfileId")}
              className="col-span-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Manual (no provider)</option>
              {providers.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <input
              placeholder="Provider ID"
              value={form.providerServiceId}
              onChange={set("providerServiceId")}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number" step="0.0001"
              placeholder="Rate / 1k"
              value={form.rate}
              onChange={set("rate")}
              disabled={form.isFree}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={set("description")}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Row 3: min/max + checkboxes + submit */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number" placeholder="Min"
              value={form.min} onChange={set("min")} disabled={form.isFree}
              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
            />
            <input
              type="number" placeholder="Max"
              value={form.max} onChange={set("max")} disabled={form.isFree}
              className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
            />
            {[
              ["isFree",         "🎁 Free"],
              ["refillAllowed",  "Refill"],
              ["cancelAllowed",  "Cancel"],
              ["isDefault",      "Default"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={set(key)}
                  className="accent-blue-600"
                />
                {label}
              </label>
            ))}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="ml-auto flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
            >
              <FiPlus size={14} />
              {saving ? "Adding..." : "Add Service"}
            </button>
          </div>

          {/* Free service extra fields */}
          {form.isFree && (
            <div className="flex gap-3 pt-1">
              <input
                type="number" placeholder="Free Quantity"
                value={form.freeQuantity} onChange={set("freeQuantity")}
                className="w-40 px-3 py-2 text-sm border border-yellow-300 bg-yellow-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="number" placeholder="Cooldown Hours"
                value={form.cooldownHours} onChange={set("cooldownHours")}
                className="w-40 px-3 py-2 text-sm border border-yellow-300 bg-yellow-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
