// src/templates/aurora/AuroraNotificationBanner.jsx
import { useActiveNotification } from "../../hooks/useActiveNotification";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiBell, FiX } from "react-icons/fi";

export default function AuroraNotificationBanner() {
  const { notification, dismiss } = useActiveNotification();
  const { childPanel } = useChildPanel();
  const brand = { color: childPanel?.themeColor || "#a78bfa" };

  if (!notification) return null;

  return (
    <div className="w-full mb-4">
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${brand.color}22`, color: brand.color }}>
            <FiBell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">{notification.title}</h3>
            <p className="mt-1 text-xs whitespace-pre-line" style={{ color: "rgba(255,255,255,0.55)" }}>{notification.message}</p>
          </div>
          <button onClick={dismiss} aria-label="Dismiss notification" className="flex-shrink-0 ml-1 text-gray-500 hover:text-white transition">
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
