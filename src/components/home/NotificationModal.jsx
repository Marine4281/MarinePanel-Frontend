// src/components/home/NotificationModal.jsx
import { useActiveNotification } from "../../hooks/useActiveNotification";

const NotificationModal = () => {
  const { notification, dismiss } = useActiveNotification();

  if (!notification) return null;

  return (
    <div className="w-full mb-4">
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
            🔔
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              {notification.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 whitespace-pre-line">
              {notification.message}
            </p>
          </div>

          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
