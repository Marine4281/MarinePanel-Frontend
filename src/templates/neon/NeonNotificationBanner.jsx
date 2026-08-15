// src/templates/neon/NeonNotificationBanner.jsx
import { useActiveNotification } from "../../hooks/useActiveNotification";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiBell, FiX } from "react-icons/fi";

export default function NeonNotificationBanner() {
  const { notification, dismiss } = useActiveNotification();
  const { childPanel } = useChildPanel();
  const neon = childPanel?.themeColor || "#00ff88";

  if (!notification) return null;

  return (
    <div className="w-full mb-5">
      <div className="relative rounded-2xl p-4 sm:p-5" style={{ background: "#1b1b2a", border: `1px solid ${neon}33` }}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${neon}14`, color: neon, boxShadow: `0 0 12px ${neon}25` }}>
            <FiBell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-black" style={{ color: "#c4c4e0" }}>{notification.title}</h3>
            <p className="mt-1 text-xs sm:text-sm whitespace-pre-line" style={{ color: "#8888a8" }}>{notification.message}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="flex-shrink-0 ml-2 transition"
            style={{ color: "#5c5c82" }}
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
