import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";
import { useCachedServices } from "./CachedServicesContext";

const SupportContext = createContext();

export const SupportProvider = ({ children }) => {
  const { user } = useAuth();
  const { domainType } = useCachedServices();

  const [userUnread,  setUserUnread]  = useState(0);
  const [adminUnread, setAdminUnread] = useState(0);
  const [cpUnread,    setCpUnread]    = useState(0);

  const isAdmin    = user?.isAdmin;
  const isCpOwner  = user?.isChildPanel;

  // Which scope tickets does this user submit to?
  const userScope = domainType === "childPanel" ? "childPanel" : "main";

  const fetchUserUnread = useCallback(async () => {
    if (!user || isAdmin || isCpOwner) return;
    try {
      const res = await API.get(`/support/unread-count?scope=${userScope}`);
      setUserUnread(res.data.count || 0);
    } catch {}
  }, [user, isAdmin, isCpOwner, userScope]);

  const fetchAdminUnread = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await API.get("/support/admin/unread-count");
      setAdminUnread(res.data.count || 0);
    } catch {}
  }, [isAdmin]);

  const fetchCpUnread = useCallback(async () => {
    if (!isCpOwner) return;
    try {
      const res = await API.get("/support/cp/unread-count");
      setCpUnread(res.data.count || 0);
    } catch {}
  }, [isCpOwner]);

  useEffect(() => {
    fetchUserUnread();
    fetchAdminUnread();
    fetchCpUnread();
    const iv = setInterval(() => {
      fetchUserUnread();
      fetchAdminUnread();
      fetchCpUnread();
    }, 8000);
    return () => clearInterval(iv);
  }, [fetchUserUnread, fetchAdminUnread, fetchCpUnread]);

  const fmt = (n) => (n > 99 ? "99+" : String(n));

  return (
    <SupportContext.Provider value={{
      userUnread, adminUnread, cpUnread, fmt,
      userScope,
      refreshUser: fetchUserUnread,
      refreshAdmin: fetchAdminUnread,
      refreshCp: fetchCpUnread,
    }}>
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => useContext(SupportContext);
