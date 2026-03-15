// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // You can show a spinner or blank page while checking user
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
