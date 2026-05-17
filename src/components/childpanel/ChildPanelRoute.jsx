// src/components/childpanel/ChildPanelRoute.jsx

import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ChildPanelRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.isChildPanel) return <Navigate to="/home" replace />;

  // Panel suspended by admin
  if (!user.childPanelIsActive) {
    const reason = user.childPanelSuspendReason || "Your child panel has been suspended.";
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Panel Suspended</h2>
          <p className="text-gray-500 text-sm mb-4">{reason}</p>
          <p className="text-xs text-gray-400">Please contact support to resolve this issue.</p>
          <a
            href="/home"
            className="mt-5 inline-block px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Subscription expired
  if (user.childPanelNextBilledAt && new Date() > new Date(user.childPanelNextBilledAt)) {
    const expiredDate = new Date(user.childPanelNextBilledAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Subscription Expired</h2>
          <p className="text-gray-500 text-sm mb-1">
            Your panel subscription expired on{" "}
            <span className="font-semibold text-red-500">{expiredDate}</span>.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Contact the platform admin to renew your plan and restore access.
          </p>
          <a
            href="/home"
            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
