import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";

import LandingPage from "./pages/LandingPage"; // ✅ ADD THIS

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminService from "./pages/AdminService";
import AdminSettings from "./pages/AdminSettings";
import AdminPaymentMethods from "./pages/AdminPaymentMethods";
import AdminOrders from "./pages/AdminOrders";
import AdminUserOrders from "./pages/AdminUserOrders";

import ProtectedRoute from "./components/ProtectedRoute";

// ✅ NEW: Import network manager
import { setupNetworkManager } from "./utils/networkManager";
import { useEffect } from "react";

export default function App() {
  // ✅ Initialize network manager in useEffect
  useEffect(() => {
    const cleanup = setupNetworkManager(); // handles offline → online refresh
    return cleanup; // cleanup listeners on unmount
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<LandingPage />} /> {/* ✅ CHANGED */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 👤 User Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 👑 Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payment-methods"
          element={
            <ProtectedRoute adminOnly>
              <AdminPaymentMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute adminOnly>
              <AdminService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-orders"
          element={
            <ProtectedRoute adminOnly>
              <AdminUserOrders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
            }
