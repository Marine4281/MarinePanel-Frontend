// src/templates/tide/TideNotificationBanner.jsx
import { useActiveNotification } from "../../hooks/useActiveNotification";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiBell, FiX } from "react-icons/fi";

export default function TideNotificationBanner() {
  const { notification, dismiss } = useActiveNotification();
  const { childPanel } = useChildPanel();
  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

  if (!notification) return null;

  return (
    <div className="w-full mb-5">
      <div className="relative rounded-2xl bg-white border shadow-sm p-4 sm:p-5" style={{ borderColor: `${brand.color}33` }}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${brand.color}14`, color: brand.color }}>
            <FiBell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-black text-gray-900">{notification.title}</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 whitespace-pre-line">{notification.message}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="flex-shrink-0 ml-2 text-gray-300 hover:text-gray-500 transition"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
