import { io } from "socket.io-client";

let socket;

export const connectSocket = (authContext, servicesContext) => {
  if (socket) return socket;

  socket = io("https://marinepanel-backend.onrender.com", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("⚡ Global socket connected:", socket.id);
  });

  /* =========================
     SERVICES UPDATE
  ========================= */

  socket.on("servicesUpdated", () => {
    console.log("🔄 Services updated (global)");
    servicesContext?.refreshServices?.();
  });

  /* =========================
     WALLET UPDATE
  ========================= */

  socket.on("walletUpdated", () => {
    console.log("💰 Wallet updated");
    authContext?.refreshUser?.();
  });

  /* =========================
     ORDER UPDATE
  ========================= */

  socket.on("orderUpdated", () => {
    console.log("📦 Orders updated");
    window.dispatchEvent(new Event("ordersUpdated"));
  });

  /* =========================
     NOTIFICATIONS
  ========================= */

  socket.on("notification", (msg) => {
    console.log("🔔 Notification:", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
