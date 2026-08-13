// src/components/home/NotificationModal.jsx
import { useActiveNotification } from "../../hooks/useActiveNotification";

const NotificationModal = () => {
  const { notification, dismiss } = useActiveNotification();

  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
            🔔
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {notification.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
              {notification.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={dismiss}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
