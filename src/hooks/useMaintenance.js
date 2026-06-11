// src/hooks/useMaintenance.js
import { useState, useEffect } from "react";
import API from "../api/axios";

/**
 * Polls the public /api/maintenance/status endpoint.
 * Returns { loading, totalShutdown, noOrders }
 *
 * Pass the current user object if available so the hook
 * can send role + email for server-side exemption checking.
 */
export function useMaintenance(user) {
  const [loading, setLoading] = useState(true);
  const [totalShutdown, setTotalShutdown] = useState({ active: false });
  const [noOrders, setNoOrders] = useState({ active: false });

  useEffect(() => {
    let role = "user";
    if (user?.isAdmin) role = "admin";
    else if (user?.isChildPanel) role = "cpOwner";
    else if (user?.isReseller) role = "reseller";

    const params = new URLSearchParams({ role });
    if (user?.email) params.set("email", user.email);

    API.get(`/maintenance/status?${params.toString()}`)
      .then(({ data }) => {
        setTotalShutdown(data.totalShutdown || { active: false });
        setNoOrders(data.noOrders || { active: false });
      })
      .catch((err) => console.error("Maintenance check failed:", err))
      .finally(() => setLoading(false));
  }, [user?._id]);

  return { loading, totalShutdown, noOrders };
}
