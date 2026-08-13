// src/components/admin/NotificationManager/NotificationManager.jsx
import { useState, useEffect, useCallback } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import NotificationForm from "./NotificationForm";
import NotificationHistoryTable from "./NotificationHistoryTable";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [editing, setEditing] = useState(null); // null = not editing, "new" = create mode, object = edit mode
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/notifications");
      setNotifications(data);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editing && editing !== "new") {
        await API.put(`/admin/notifications/${editing._id}`, payload);
        toast.success("Notification updated");
      } else {
        await API.post("/admin/notifications", payload);
        toast.success("Notification created");
      }
      setEditing(null);
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save notification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification? This cannot be undone.")) return;
    try {
      await API.delete(`/admin/notifications/${id}`);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Site Notification</h3>
        {!editing && (
          <button
            onClick={() => setEditing("new")}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white"
          >
            + New Notification
          </button>
        )}
      </div>

      {editing && (
        <NotificationForm
          initial={editing === "new" ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <NotificationHistoryTable
          notifications={notifications}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default NotificationManager;
