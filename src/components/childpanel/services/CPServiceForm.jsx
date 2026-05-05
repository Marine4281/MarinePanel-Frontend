// src/components/childpanel/services/CPServiceForm.jsx
// Add/Edit modal — mirrors admin form: free service, refill policy, defaults

import { useState, useEffect } from "react";
import { FiX, FiGift, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../../../api/axios";

const REFILL_OPTIONS = [
  { value: "30d",      label: "30 Days" },
  { value: "60d",      label: "60 Days" },
  { value: "90d",      label: "90 Days" },
  { value: "365d",     label: "365 Days" },
  { value: "lifetime", label: "Lifetime" },
  { value: "custom",   label: "Custom Days" },
];

const INITIAL = {
  name: "",
  category: "",
  platform: "",
  rate: "",
  min: "10",
  max: "100000",
  description: "",
  // Free service
  isFree: false,
  freeQuantity: "",
  cooldownHours: "",
  // Refill & cancel
  refillAllowed: false,
  cancelAllowed: false,
  refillPolicy: "30d",
  customRefillDays: "",
  // Defaults
  isDefault: false,
  isDefaultCategoryGlobal: false,
  isDefaultCategoryPlatform: false,
};

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", disabled, step, min: minVal }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      step={step}
      min={minVal}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
    />
  );
}

function CheckRow({ label, checked, onChange, color = "blue" }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`accent-${color}-600 w-4 h-4`}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function CPServiceForm({ service, onClose, onSaved }) {
  const isEdit = Boolean(service);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setForm({
        name:              service.name || "",
        category:          service.category || "",
        platform:          service.platform || "",
        rate:              service.isFree ? "" : (service.rate ?? ""),
        min:               service.min ?? 10,
        max:               service.isFree ? "" : (service.max ?? 100000),
        description:       service.description || "",
        isFree:            service.isFree || false,
        freeQuantity:      service.freeQuantity || "",
        cooldownHours:     service.cooldownHours || "",
        refillAllowed:     service.refillAllowed || false,
        cancelAllowed:     service.cancelAllowed || false,
        refillPolicy:      service.refillPolicy || "30d",
        customRefillDays:  service.customRefillDays || "",
        isDefault:                service.isDefault || false,
        isDefaultCategoryGlobal:  service.isDefaultCategoryGlobal || false,
        isDefaultCategoryPlatform: service.isDefaultCategoryPlatform || false,
      });
    }
  }, [service]);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      // When toggling isFree on, clear rate
      if (k === "isFree" && val) {
        next.rate = "0";
        next.refillAllowed = false;
        next.refillPolicy  = "none";
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.platform) {
      return toast.error("Name, Category and Platform are required");
    }
    if (form.isFree && (!form.freeQuantity || form.cooldownHours === "")) {
      return toast.error("Free service requires quantity and cooldown hours");
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        rate:             form.isFree ? 0 : Number(form.rate),
        min:              form.isFree ? 1 : Number(form.min),
        max:              form.isFree ? Number(form.freeQuantity) : Number(form.max),
        freeQuantity:     Number(form.freeQuantity) || 0,
        cooldownHours:    Number(form.cooldownHours) || 0,
        customRefillDays: form.refillPolicy === "custom" ? Number(form.customRefillDays) : null,
      };

      if (isEdit) {
        const res = await API.put(`/cp/services/${service._id}`, payload);
        toast.success("Service updated");
        onSaved(res.data.service, true);
      } else {
        const res = await API.post("/cp/services", payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Service" : "Add Service"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update this service in your panel" : "Manually add a custom service"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Service Name *">
              <TextInput value={form.name} onChange={set("name")} placeholder="e.g. Instagram Followers HQ" />
            </Field>
            <Field label="Platform *">
              <TextInput value={form.platform} onChange={set("platform")} placeholder="e.g. Instagram" />
            </Field>
            <Field label="Category *" >
              <TextInput value={form.category} onChange={set("category")} placeholder="e.g. Instagram - Followers" />
            </Field>
            <Field label="Description">
              <TextInput value={form.description} onChange={set("description")} placeholder="Shown to end users (optional)" />
            </Field>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Rate ($ per 1k)">
              <TextInput
                type="number" step="0.0001" min={0}
                value={form.rate} onChange={set("rate")}
                placeholder="0.0000"
                disabled={form.isFree}
              />
            </Field>
            <Field label="Min Qty">
              <TextInput type="number" value={form.min} onChange={set("min")} placeholder="10" min={1} disabled={form.isFree} />
            </Field>
            <Field label="Max Qty">
              <TextInput type="number" value={form.max} onChange={set("max")} placeholder="100000" disabled={form.isFree} />
            </Field>
          </div>

          {/* Free Service Toggle */}
          <div className={`border rounded-xl p-4 space-y-3 transition-colors ${form.isFree ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"}`}>
            <CheckRow
              label="🎁 Free Service (no charge to end user)"
              checked={form.isFree}
              onChange={set("isFree")}
              color="yellow"
            />
            {form.isFree && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field label="Free Quantity (max per claim) *"
                  hint="-1 = one time ever, 24 = daily, 168 = weekly">
                  <TextInput type="number" value={form.freeQuantity} onChange={set("freeQuantity")} placeholder="e.g. 100" min={1} />
                </Field>
                <Field label="Cooldown Hours *" hint="-1 = one time ever, 24 = daily">
                  <TextInput type="number" value={form.cooldownHours} onChange={set("cooldownHours")} placeholder="e.g. 24" />
                </Field>
              </div>
            )}
          </div>

          {/* Refill & Cancel */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Order Controls</p>
            <div className="flex flex-wrap gap-5">
              <CheckRow label="Refill Allowed" checked={form.refillAllowed} onChange={set("refillAllowed")} disabled={form.isFree} />
              <CheckRow label="Cancel Allowed" checked={form.cancelAllowed} onChange={set("cancelAllowed")} />
            </div>

            {form.refillAllowed && !form.isFree && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-gray-600">Refill Policy</label>
                <select
                  value={form.refillPolicy}
                  onChange={set("refillPolicy")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {REFILL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {form.refillPolicy === "custom" && (
                  <TextInput
                    type="number"
                    value={form.customRefillDays}
                    onChange={set("customRefillDays")}
                    placeholder="Number of days"
                    min={1}
                  />
                )}
              </div>
            )}
          </div>

          {/* Default Settings */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Default Settings</p>
            <div className="flex flex-wrap gap-5">
              <CheckRow label="Default in Category" checked={form.isDefault} onChange={set("isDefault")} />
              <CheckRow label="Global Default Category" checked={form.isDefaultCategoryGlobal} onChange={set("isDefaultCategoryGlobal")} />
              <CheckRow label="Platform Default Category" checked={form.isDefaultCategoryPlatform} onChange={set("isDefaultCategoryPlatform")} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
