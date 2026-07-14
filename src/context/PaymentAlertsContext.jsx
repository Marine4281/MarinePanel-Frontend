import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const PaymentAlertsContext = createContext();

export const PaymentAlertsProvider = ({ children }) => {
  const { user } = useAuth();

  const [adminPaymentUnread, setAdminPaymentUnread] = useState(0);
  const [cpPaymentUnread, setCpPaymentUnread] = useState(0);

  const isAdmin   = user?.isAdmin;
  const isCpOwner = user?.isChildPanel;

  const fetchAdminPaymentUnread = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await API.get("/admin/payments/unread-count");
      setAdminPaymentUnread(res.data.count || 0);
    } catch {}
  }, [isAdmin]);

  const fetchCpPaymentUnread = useCallback(async () => {
    if (!isCpOwner) return;
    try {
      const res = await API.get("/cp/payments/unread-count");
      setCpPaymentUnread(res.data.count || 0);
    } catch {}
  }, [isCpOwner]);

  useEffect(() => {
    fetchAdminPaymentUnread();
    fetchCpPaymentUnread();
    const iv = setInterval(() => {
      fetchAdminPaymentUnread();
      fetchCpPaymentUnread();
    }, 8000);
    return () => clearInterval(iv);
  }, [fetchAdminPaymentUnread, fetchCpPaymentUnread]);

  const fmt = (n) => (n > 99 ? "99+" : String(n));

  return (
    <PaymentAlertsContext.Provider value={{
      adminPaymentUnread, cpPaymentUnread, fmt,
      refreshAdminPayments: fetchAdminPaymentUnread,
      refreshCpPayments: fetchCpPaymentUnread,
    }}>
      {children}
    </PaymentAlertsContext.Provider>
  );
};

export const usePaymentAlerts = () => useContext(PaymentAlertsContext);
