// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { CachedServicesProvider, useCachedServices } from "./context/CachedServicesContext";
import { Toaster } from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useEffect } from "react";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Services from "./pages/Services";
import Reseller from "./pages/Reseller";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminService from "./pages/AdminService";
import AdminSettings from "./pages/AdminSettings";
import AdminPaymentMethods from "./pages/AdminPaymentMethods";
import AdminOrders from "./pages/AdminOrders";
import AdminUserOrders from "./pages/AdminUserOrders";

import ProviderSync from "./pages/ProviderSync";

import ResellerPanel from "./pages/reseller/ResellerPanel";
import AdminResellerGuides from "./pages/reseller/AdminResellerGuides";
import ResellerActivate from "./pages/reseller/ResellerActivate";
import ResellerDashboard from "./pages/reseller/ResellerDashboard";
import ResellerUsers from "./pages/reseller/ResellerUsers";
import ResellerOrders from "./pages/reseller/ResellerOrders";
import ResellerBranding from "./pages/reseller/ResellerBranding";
import ResellerServices from "./pages/reseller/ResellerServices";
import EndUserDashboard from "./pages/reseller/EndUserDashboard";





import ProtectedRoute from "./components/ProtectedRoute";
import { setupNetworkManager } from "./utils/networkManager";

/* ======================================================
   INTERNAL ROUTES COMPONENT
====================================================== */

function AppRoutes() {
  const authContext = useAuthContext();
  const servicesContext = useCachedServices();

  useEffect(() => {
    const cleanup = setupNetworkManager(authContext, servicesContext);
    return cleanup;
  }, [authContext, servicesContext]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>

        {/* 🌍 PUBLIC ROUTES */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


        {/* 👤 USER ROUTES */}

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

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resellers"
          element={
            <ProtectedRoute>
              <Reseller />
            </ProtectedRoute>
          }
        />


        {/* 🔁 RESELLER PANEL */}

        <Route
          path="/reseller"
          element={
            <ProtectedRoute>
              <Reseller />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reseller-panel"
          element={
            <ProtectedRoute>
              <ResellerPanel />
            </ProtectedRoute>
          }
        />

         <Route
          path="/reseller/activate"
          element={
            <ProtectedRoute>
              <ResellerActivate />
            </ProtectedRoute>
          }
        />

         <Route
         path="/reseller/services"
         element={
           <ProtectedRoute>
             <ResellerServices />
           </ProtectedRoute>
         }
        />
         
         <Route
            path="/reseller/dashboard"
            element ={
               <ProtectedRoute>
                  <ResellerDashboard />
               </ProtectedRoute>
            }
         />

         <Route
            path="/reseller/users"
            element ={
               <ProtectedRoute>
                  <ResellerUsers />
               </ProtectedRoute>
            }
         />

         <Route
          path="/reseller/orders"
          element={
            <ProtectedRoute>
              <ResellerOrders />
            </ProtectedRoute>
          }
        />

         <Route
          path="/reseller/branding"
          element={
            <ProtectedRoute>
              <ResellerBranding />
            </ProtectedRoute>
          }
        />

         <Route
          path="/end-user/dashboard"
          element={
            <ProtectedRoute>
              <EndUserDashboard />
            </ProtectedRoute>
          }
        />

        {/* 👑 ADMIN ROUTES */}

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

        <Route
          path="/admin/provider-sync"
          element={
            <ProtectedRoute adminOnly>
              <ProviderSync />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reseller-guides"
          element={
            <ProtectedRoute adminOnly>
              <AdminResellerGuides />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}


/* ======================================================
   ROOT APP
====================================================== */

export default function App() {
  return (
    <AuthProvider>
      <CachedServicesProvider>
        <AppRoutes />
      </CachedServicesProvider>
    </AuthProvider>
  );
}
