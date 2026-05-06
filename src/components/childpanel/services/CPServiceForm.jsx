// src/components/childpanel/services/CPServiceForm.jsx
// Add/Edit modal — full provider fields + all admin-level service controls

import { useState, useEffect } from "react";
import { FiX, FiGift, FiRefreshCw, FiChevronDown, FiEye, FiEdit2 } from "react-icons/fi";
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
  // Provider
  providerProfileId: "",   // "" = manual/none, "new" = adding new
  providerServiceId: "",
  newProviderName: "",
  newProviderApiUrl: "",
  newProviderApiKey: "",
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

function CheckRow({ label, checked, onChange, color = "blue", disabled }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        className={`accent-${color}-600 w-4 h-4`}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ── Provider Selector (mirrors admin ProviderFields) ──
function CPProviderFields({ form, set, providers, onProviderCreated }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch]             = useState("");
  const [viewProvider, setViewProvider] = useState(null);
  const [editMode, setEditMode]         = useState(false);
  const [editData, setEditData]         = useState({});
  const [saving, setSaving]             = useState(false);

  const isAddingNew   = form.providerProfileId === "new";
  const selectedProv  = providers.find((p) => p._id === form.providerProfileId);
  const filtered      = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id) => {
    set("providerProfileId")(id === form.providerProfileId ? "" : id);
    setShowDropdown(false);
  };

  const handleCreateProvider = async () => {
    if (!form.newProviderName || !form.newProviderApiUrl || !form.newProviderApiKey) {
      return toast.error("All provider fields are required");
    }
    setSaving(true);
    try {
      const res = await API.post("/cp/providers/profiles", {
        name:   form.newProviderName,
        apiUrl: form.newProviderApiUrl,
        apiKey: form.newProviderApiKey,
      });
      toast.success("Provider connected");
      const newProv = res.data.provider;
      onProviderCreated(newProv);
      set("providerProfileId")(newProv._id);
      set("newProviderName")("");
      set("newProviderApiUrl")("");
      set("newProviderApiKey")("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect provider");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData.name || !editData.apiUrl || !editData.apiKey) {
      return toast.error("All fields are required");
    }
    setSaving(true);
    try {
      await API.put(`/cp/providers/profiles/${viewProvider._id}`, editData);
      toast.success("Provider updated");
      setViewProvider(null);
      setEditMode(false);
      setEditData({});
    } catch {
      toast.error("Failed to update provider");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ── Selector ── */}
      <Field label="Provider">
        <div className="relative">
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-400 transition"
          >
            <span className={selectedProv ? "text-gray-800" : "text-gray-400"}>
              {selectedProv ? selectedProv.name : "Manual / No provider"}
            </span>
            <FiChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </div>

          {showDropdown && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {/* Search */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Manual option */}
              <div
                onClick={() => { set("providerProfileId")(""); setShowDropdown(false); }}
                className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 border-b ${!form.providerProfileId || form.providerProfileId === "new" ? "" : "font-medium"}`}
              >
                <span className="text-gray-500">Manual / No provider</span>
              </div>

              {/* Provider list */}
              {filtered.map((p) => (
                <div
                  key={p._id}
                  className={`px-3 py-2.5 border-b flex items-center justify-between hover:bg-gray-50 ${form.providerProfileId === p._id ? "bg-blue-50" : ""}`}
                >
                  <div className="cursor-pointer flex-1" onClick={() => handleSelect(p._id)}>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{p.apiUrl}</p>
                  </div>
                  <div className="flex gap-1.5 ml-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setViewProvider(p); setEditMode(false); setShowDropdown(false); }}
                      className="px-2 py-1 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition">
                      View
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setViewProvider(p); setEditMode(true); setEditData({ ...p }); setShowDropdown(false); }}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition">
                      Edit
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new */}
              <div
                onClick={() => { set("providerProfileId")("new"); setShowDropdown(false); }}
                className="px-3 py-2.5 text-center text-blue-600 text-sm font-medium cursor-pointer hover:bg-blue-50"
              >
                + Connect New Provider
              </div>
            </div>
          )}
        </div>
      </Field>

      {/* ── New Provider Form ── */}
      {isAddingNew && (
        <div className="mt-3 border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Connect New Provider</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <TextInput value={form.newProviderName}    onChange={(e) => set("newProviderName")(e.target.value)}    placeholder="Provider Name" />
            <TextInput value={form.newProviderApiUrl}  onChange={(e) => set("newProviderApiUrl")(e.target.value)}  placeholder="API URL" />
            <TextInput value={form.newProviderApiKey}  onChange={(e) => set("newProviderApiKey")(e.target.value)}  placeholder="API Key" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => set("providerProfileId")("")}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            <button type="button" onClick={handleCreateProvider} disabled={saving}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Saving..." : "Save Provider"}
            </button>
          </div>
        </div>
      )}

      {/* ── Provider Service ID (when provider selected) ── */}
      {selectedProv && (
        <div className="mt-3">
          <Field label="Provider Service ID" hint="The service ID as listed in your provider's API">
            <TextInput
              value={form.providerServiceId}
              onChange={(e) => set("providerServiceId")(e.target.value)}
              placeholder="e.g. 123"
            />
          </Field>
        </div>
      )}

      {/* ── View/Edit Modal ── */}
      {viewProvider && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{editMode ? "Edit Provider" : "Provider Details"}</h3>
              <p className="text-xs text-gray-400">{editMode ? "Update provider credentials" : "Read-only view"}</p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Provider Name", key: "name",   placeholder: "Provider name" },
                { label: "API URL",       key: "apiUrl", placeholder: "https://provider.com/api/v2" },
                { label: "API Key",       key: "apiKey", placeholder: "Your API key" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                  <input
                    value={editMode ? editData[key] : viewProvider[key]}
                    disabled={!editMode}
                    onChange={(e) => setEditData((d) => ({ ...d, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setViewProvider(null); setEditMode(false); setEditData({}); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
                Close
              </button>
              {!editMode && (
                <button type="button" onClick={() => { setEditMode(true); setEditData({ ...viewProvider }); }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                  Edit
                </button>
              )}
              {editMode && (
                <button type="button" onClick={handleSaveEdit} disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN FORM ──
export default function CPServiceForm({ service, onClose, onSaved }) {
  const isEdit = Boolean(service);
  const [form, setForm]       = useState(INITIAL);
  const [saving, setSaving]   = useState(false);
  const [providers, setProviders] = useState([]);

  // Load CP providers
  useEffect(() => {
    API.get("/cp/providers/profiles")
      .then((r) => setProviders(r.data || []))
      .catch(() => {});
  }, []);

  // Populate form when editing
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
        providerProfileId: service.providerProfileId || "",
        providerServiceId: service.providerServiceId || "",
        newProviderName:   "",
        newProviderApiUrl: "",
        newProviderApiKey: "",
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

  // Generic setter — works for both text inputs and checkboxes
  const set = (k) => (valOrEvent) => {
    const val = (valOrEvent && typeof valOrEvent === "object" && "target" in valOrEvent)
      ? (valOrEvent.target.type === "checkbox" ? valOrEvent.target.checked : valOrEvent.target.value)
      : valOrEvent;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (k === "isFree" && val) {
        next.rate = "0";
        next.refillAllowed = false;
        next.refillPolicy  = "none";
      }
      return next;
    });
  };

  const handleProviderCreated = (newProv) => {
    setProviders((prev) => [newProv, ...prev]);
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
        name:             form.name,
        category:         form.category,
        platform:         form.platform,
        description:      form.description,
        rate:             form.isFree ? 0 : Number(form.rate),
        min:              form.isFree ? 1 : Number(form.min),
        max:              form.isFree ? Number(form.freeQuantity) : Number(form.max),
        isFree:           form.isFree,
        freeQuantity:     Number(form.freeQuantity) || 0,
        cooldownHours:    Number(form.cooldownHours) || 0,
        refillAllowed:    form.refillAllowed,
        cancelAllowed:    form.cancelAllowed,
        refillPolicy:     form.refillPolicy,
        customRefillDays: form.refillPolicy === "custom" ? Number(form.customRefillDays) : null,
        isDefault:                form.isDefault,
        isDefaultCategoryGlobal:  form.isDefaultCategoryGlobal,
        isDefaultCategoryPlatform: form.isDefaultCategoryPlatform,
        // Provider fields — sent even if manual (backend handles it)
        providerProfileId: form.providerProfileId && form.providerProfileId !== "new"
          ? form.providerProfileId : null,
        providerServiceId: form.providerServiceId || "",
      };

      let res;
      if (isEdit) {
        res = await API.put(`/cp/services/${service._id}`, payload);
        toast.success("Service updated");
        onSaved(res.data.service, true);
      } else {
        res = await API.post("/cp/services", payload);
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
            <Field label="Platform *">
              <TextInput value={form.platform} onChange={set("platform")} placeholder="e.g. Instagram" />
            </Field>
            <Field label="Category *">
              <TextInput value={form.category} onChange={set("category")} placeholder="e.g. Instagram - Followers" />
            </Field>
            <Field label="Service Name *">
              <TextInput value={form.name} onChange={set("name")} placeholder="e.g. Instagram Followers HQ" />
            </Field>
            <Field label="Description">
              <TextInput value={form.description} onChange={set("description")} placeholder="Shown to end users (optional)" />
            </Field>
          </div>

          {/* Provider Fields */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Provider</p>
            <CPProviderFields
              form={form}
              set={set}
              providers={providers}
              onProviderCreated={handleProviderCreated}
            />
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

          {/* Free Service */}
          <div className={`border rounded-xl p-4 space-y-3 transition-colors ${form.isFree ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"}`}>
            <CheckRow
              label="🎁 Free Service (no charge to end user)"
              checked={form.isFree}
              onChange={set("isFree")}
              color="yellow"
            />
            {form.isFree && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field label="Free Quantity (max per claim) *" hint="e.g. 100 = user gets 100 for free">
                  <TextInput type="number" value={form.freeQuantity} onChange={set("freeQuantity")} placeholder="e.g. 100" min={1} />
                </Field>
                <Field label="Cooldown Hours *" hint="-1 = one time ever, 24 = daily, 168 = weekly">
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
              <CheckRow label="Default in Category"         checked={form.isDefault}                onChange={set("isDefault")} />
              <CheckRow label="Global Default Category"     checked={form.isDefaultCategoryGlobal}  onChange={set("isDefaultCategoryGlobal")} />
              <CheckRow label="Platform Default Category"   checked={form.isDefaultCategoryPlatform} onChange={set("isDefaultCategoryPlatform")} />
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
