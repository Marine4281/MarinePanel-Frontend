// src/context/ResellerActivationFeedContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const ResellerActivationFeedContext = createContext();

const baseURL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://marinepanel-backend.onrender.com";

export const ResellerActivationFeedProvider = ({ children }) => {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);

  const isCpOwner = user?.isChildPanel;

  const fetchUnread = useCallback(async () => {
    if (!isCpOwner) return;
    try {
      const res = await API.get("/cp/resellers/activation-feed/unread-count");
      setUnread(res.data.count || 0);
    } catch {}
  }, [isCpOwner]);

  // Polling fallback — same 8s cadence as SupportContext
  useEffect(() => {
    fetchUnread();
    const iv = setInterval(fetchUnread, 8000);
    return () => clearInterval(iv);
  }, [fetchUnread]);

  // Real-time push — bumps the badge instantly when online
  useEffect(() => {
    if (!isCpOwner || !user?._id) return;

    const socket = io(baseURL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join_user_room", user._id);

    socket.on("reseller_activation_event", () => {
      setUnread((n) => n + 1);
    });

    return () => {
      socket.off("reseller_activation_event");
      socket.disconnect();
    };
  }, [isCpOwner, user?._id]);

  const fmt = (n) => (n > 99 ? "99+" : String(n));

  const markSeen = useCallback(async () => {
    setUnread(0);
    try {
      await API.patch("/cp/resellers/activation-feed/mark-seen");
    } catch {}
  }, []);

  return (
    <ResellerActivationFeedContext.Provider value={{ unread, fmt, markSeen, refresh: fetchUnread }}>
      {children}
    </ResellerActivationFeedContext.Provider>
  );
};

export const useResellerActivationFeed = () => useContext(ResellerActivationFeedContext);
