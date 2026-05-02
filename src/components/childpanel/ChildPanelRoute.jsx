// src/components/childpanel/ChildPanelRoute.jsx
// Route guard — only lets through authenticated users
// who are child panel owners with an active panel.
// Mirrors ProtectedRoute.jsx but scoped to isChildPanel.

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

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but not a child panel owner
  if (!user.isChildPanel) return <Navigate to="/home" replace />;

  // Panel is suspended
  if (!user.childPanelIsActive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Panel Suspended
          </h2>
          <p className="text-gray-500 text-sm">
            Your child panel has been suspended. Please contact support to
            resolve this.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
