// src/templates/pulse/PulseNotificationBanner.jsx
import { useActiveNotification } from "../../hooks/useActiveNotification";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiBell, FiX } from "react-icons/fi";

export default function PulseNotificationBanner() {
  const { notification, dismiss } = useActiveNotification();
  const { childPanel } = useChildPanel();
  const brand = { color: childPanel?.themeColor || "#6366f1" };

  if (!notification) return null;

  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${brand.color}12`, color: brand.color }}>
            <FiBell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-gray-900">{notification.title}</h3>
            <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">{notification.message}</p>
          </div>
          <button onClick={dismiss} aria-label="Dismiss notification" className="flex-shrink-0 ml-1 text-gray-300 hover:text-gray-500 transition">
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
