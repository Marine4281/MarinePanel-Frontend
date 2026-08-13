// src/hooks/useActiveNotification.js
import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";

export function useActiveNotification() {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotification = useCallback(() => {
    setLoading(true);
    API.get("/notifications/active")
      .then(({ data }) => setNotification(data.notification || null))
      .catch(() => setNotification(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  const dismiss = useCallback(async () => {
    if (!notification) return;
    try {
      await API.post(`/notifications/${notification._id}/dismiss`);
    } catch (err) {
      console.error("Failed to record dismissal:", err);
    } finally {
      setNotification(null);
    }
  }, [notification]);

  return { notification, loading, dismiss };
}
