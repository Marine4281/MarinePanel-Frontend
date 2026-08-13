// src/components/admin/NotificationManager/NotificationForm.jsx
import { useState, useEffect } from "react";

const AUDIENCE_OPTIONS = [
  { value: "platform", label: "Main Platform Users" },
  { value: "reseller", label: "Resellers' End Users" },
  { value: "cp", label: "Child Panel End Users" },
  { value: "all", label: "All Users" },
];

const NotificationForm = ({ initial, onSubmit, onCancel, saving }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [message, setMessage] = useState(initial?.message || "");
  const [audience, setAudience] = useState(initial?.audience || "platform");
  const [limitType, setLimitType] = useState(initial?.limitType || "dismissCount");
  const [limitValue, setLimitValue] = useState(initial?.limitValue ?? 3);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  useEffect(() => {
    setTitle(initial?.title || "");
    setMessage(initial?.message || "");
    setAudience(initial?.audience || "platform");
    setLimitType(initial?.limitType || "dismissCount");
    setLimitValue(initial?.limitValue ?? 3);
    setIsActive(initial?.isActive ?? true);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, message, audience, limitType, limitValue: Number(limitValue), isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl shadow border">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="e.g. Scheduled Maintenance Notice"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Type the message users will see..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          {AUDIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display until</label>
          <select
            value={limitType}
            onChange={(e) => setLimitType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="dismissCount">User cancels it N times</option>
            <option value="days">N days pass</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {limitType === "days" ? "Days" : "Cancel count"}
          </label>
          <input
            type="number"
            min={1}
            value={limitValue}
            onChange={(e) => setLimitValue(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active (visible to users now)
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : initial ? "Update Notification" : "Create Notification"}
        </button>
      </div>
    </form>
  );
};

export default NotificationForm;
