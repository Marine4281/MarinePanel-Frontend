// src/components/childpanel/notifications/CpNotificationManager.jsx
import { useState, useEffect, useCallback } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import CpNotificationForm from "./CpNotificationForm";
import CpNotificationHistoryTable from "./CpNotificationHistoryTable";

const CpNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [editing, setEditing] = useState(null); // null = not editing, "new" = create mode, object = edit mode
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/cp/notifications");
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
        await API.put(`/cp/notifications/${editing._id}`, payload);
        toast.success("Notification updated");
      } else {
        await API.post("/cp/notifications", payload);
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
      await API.delete(`/cp/notifications/${id}`);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Panel Notification</h3>
        {!editing && (
          <button
            onClick={() => setEditing("new")}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white"
          >
            + New Notification
          </button>
        )}
      </div>

      {editing && (
        <CpNotificationForm
          initial={editing === "new" ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <CpNotificationHistoryTable
          notifications={notifications}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CpNotificationManager;
