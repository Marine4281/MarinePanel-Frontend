// src/App.jsx

import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { CachedServicesProvider, useCachedServices } from "./context/CachedServicesContext";
import { ResellerProvider } from "./context/ResellerContext";
import { ChildPanelProvider } from "./context/ChildPanelContext";
import { ServicesProvider } from "./context/ServicesContext";
import { Toaster } from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useEffect } from "react";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TermsAndConditions from "./pages/TermsAndConditions";
import TermsPublic from "./pages/TermsPublic";


// User pages
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Services from "./pages/Services";
import Reseller from "./pages/Reseller";
import ApiDocsPage from "./pages/ApiDocsPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminService from "./pages/AdminService";
import AdminSettings from "./pages/AdminSettings";
import AdminPaymentMethods from "./pages/AdminPaymentMethods";
import AdminOrders from "./pages/AdminOrders";
import AdminUserOrders from "./pages/AdminUserOrders";
import AdminLogs from "./pages/AdminLogs";
import AdminUserDetails from "./components/AdminUserDetails";
import AdminChildPanels from "./pages/AdminChildPanels";
import AdminChildPanelDetails from "./pages/AdminChildPanelDetails";
import ProviderSync from "./pages/ProviderSync";
import AdminCategoryMeta from "./pages/AdminCategoryMeta";
import Financial from "./pages/Financial";

// Reseller pages
import ResellerPanel from "./pages/reseller/ResellerPanel";
import AdminResellerGuides from "./pages/reseller/AdminResellerGuides";
import ResellerActivate from "./pages/reseller/ResellerActivate";
import ResellerDashboard from "./pages/reseller/ResellerDashboard";
import ResellerUsers from "./pages/reseller/ResellerUsers";
import ResellerOrders from "./pages/reseller/ResellerOrders";
import ResellerBranding from "./pages/reseller/ResellerBranding";
import ResellerServices from "./pages/reseller/ResellerServices";
import EndUserDashboard from "./pages/reseller/EndUserDashboard";
import ResellersAdminList from "./pages/reseller/ResellersAdminList";
import ResellerAdminDetails from "./pages/reseller/ResellerAdminDetails";

// Child panel pages
import ChildPanelRoute from "./components/childpanel/ChildPanelRoute";
import ChildPanelActivate from "./pages/childpanel/ChildPanelActivate";
import ChildPanelDashboard from "./pages/childpanel/ChildPanelDashboard";
import ChildPanelUsers from "./pages/childpanel/ChildPanelUsers";
import ChildPanelOrders from "./pages/childpanel/ChildPanelOrders";
import ChildPanelResellers from "./pages/childpanel/ChildPanelResellers";
import ChildPanelProviders from "./pages/childpanel/ChildPanelProviders";
import ChildPanelSettings from "./pages/childpanel/ChildPanelSettings";
import ChildPanelWallet from "./pages/childpanel/ChildPanelWallet";
import ChildPanelPage from "./pages/childpanel/ChildPanelPage";
import ChildPanelServices from "./pages/childpanel/ChildPanelServices";

// Template router — renders template version of page on child panel domains
import TemplateRouter from "./templates/TemplateRouter";

// Guards + utils
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { setupNetworkManager } from "./utils/networkManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

/* ======================================================
   INTERNAL ROUTES COMPONENT
   Sits inside all providers so it can consume any context
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

        {/* ================================================
            PUBLIC ROUTES
            Login + Register go through TemplateRouter so
            child panel domains show their branded template.
            All other public routes are unchanged.
        ================================================ */}

        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <TemplateRouter
              page="login"
              defaultPage={<Login />}
            />
          }
        />

        <Route
          path="/register"
          element={
            <TemplateRouter
              page="register"
              defaultPage={<Register />}
            />
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/api-access" element={<ApiDocsPage />} />
        <Route path="/terms" element={<ProtectedRoute><TermsAndConditions /></ProtectedRoute>} />
        <Route path="/terms-public" element={<TermsPublic />} />

        {/* ================================================
            USER ROUTES
            Each route is wrapped with TemplateRouter so that
            on a child panel domain the correct template page
            renders instead of the default page.
            ProtectedRoute is preserved as the outer guard.
        ================================================ */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <TemplateRouter
                page="home"
                defaultPage={<Home />}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <TemplateRouter
                page="wallet"
                defaultPage={<Wallet />}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <TemplateRouter
                page="orders"
                defaultPage={<Orders />}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <TemplateRouter
                page="profile"
                defaultPage={<Profile />}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <TemplateRouter
                page="services"
                defaultPage={<Services />}
              />
            </ProtectedRoute>
          }
        />

        {/* Resellers tab — templates don't override this.
            CP end users cannot access child panel activation
            but CAN see resellers (they can become resellers
            under the CP owner). Default page is always used. */}
        <Route
          path="/resellers"
          element={
            <ProtectedRoute>
              <Reseller />
            </ProtectedRoute>
          }
        />

        {/* ================================================
            RESELLER ROUTES — unchanged
        ================================================ */}

        <Route path="/reseller" element={<ProtectedRoute><Reseller /></ProtectedRoute>} />
        <Route path="/reseller-panel" element={<ProtectedRoute><ResellerPanel /></ProtectedRoute>} />
        <Route path="/reseller/activate" element={<ProtectedRoute><ResellerActivate /></ProtectedRoute>} />
        <Route path="/reseller/services" element={<ProtectedRoute><ResellerServices /></ProtectedRoute>} />
        <Route path="/reseller/dashboard" element={<ProtectedRoute><ResellerDashboard /></ProtectedRoute>} />
        <Route path="/reseller/users" element={<ProtectedRoute><ResellerUsers /></ProtectedRoute>} />
        <Route path="/reseller/orders" element={<ProtectedRoute><ResellerOrders /></ProtectedRoute>} />
        <Route path="/reseller/branding" element={<ProtectedRoute><ResellerBranding /></ProtectedRoute>} />
        <Route path="/end-user/dashboard" element={<ProtectedRoute><EndUserDashboard /></ProtectedRoute>} />

        {/* ================================================
            CHILD PANEL ROUTES — unchanged
            These are the CP owner admin routes, not end-user
            routes, so templates do NOT apply here.
        ================================================ */}

        <Route path="/child-panel" element={<ProtectedRoute><ChildPanelPage /></ProtectedRoute>} />
        <Route path="/child-panel/activate" element={<ProtectedRoute><ChildPanelActivate /></ProtectedRoute>} />

        <Route path="/child-panel/dashboard" element={<ChildPanelRoute><ChildPanelDashboard /></ChildPanelRoute>} />
        <Route path="/child-panel/users" element={<ChildPanelRoute><ChildPanelUsers /></ChildPanelRoute>} />
        <Route path="/child-panel/orders" element={<ChildPanelRoute><ChildPanelOrders /></ChildPanelRoute>} />
        <Route path="/child-panel/resellers" element={<ChildPanelRoute><ChildPanelResellers /></ChildPanelRoute>} />
        <Route path="/child-panel/providers" element={<ChildPanelRoute><ChildPanelProviders /></ChildPanelRoute>} />
        <Route path="/child-panel/wallet" element={<ChildPanelRoute><ChildPanelWallet /></ChildPanelRoute>} />
        <Route path="/child-panel/settings" element={<ChildPanelRoute><ChildPanelSettings /></ChildPanelRoute>} />
        <Route path="/child-panel/services" element={<ChildPanelRoute><ChildPanelServices /></ChildPanelRoute>} />

        {/* ================================================
            ADMIN ROUTES — unchanged
        ================================================ */}

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetails /></AdminRoute>} />
        <Route path="/admin/payment-methods" element={<AdminRoute><AdminPaymentMethods /></AdminRoute>} />
        <Route path="/admin/services" element={<AdminRoute><AdminService /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/user-orders" element={<AdminRoute><AdminUserOrders /></AdminRoute>} />
        <Route path="/admin/provider-sync" element={<AdminRoute><ProviderSync /></AdminRoute>} />
        <Route path="/admin/reseller-guides" element={<AdminRoute><AdminResellerGuides /></AdminRoute>} />
        <Route path="/admin/resellers" element={<AdminRoute><ResellersAdminList /></AdminRoute>} />
        <Route path="/admin/resellers/:id" element={<AdminRoute><ResellerAdminDetails /></AdminRoute>} />
        <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
        <Route path="/admin/child-panels" element={<AdminRoute><AdminChildPanels /></AdminRoute>} />
        <Route path="/admin/child-panels/:id" element={<AdminRoute><AdminChildPanelDetails /></AdminRoute>} />
         <Route path="/admin/categories" element={<AdminCategoryMeta />} />
        <Route path="/admin/financial" element={<AdminRoute><Financial /></AdminRoute>} />

      </Routes>
    </>
  );
}

/* ======================================================
   ROOT APP
   Provider order matters:
   AuthProvider       — outermost, everything depends on it
   ResellerProvider   — reads domain, sets reseller branding
   ChildPanelProvider — reads domain, sets cp branding
   CachedServicesProvider — reads domain type, fetches services
   ServicesProvider   — same but for the other services context
====================================================== */

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ResellerProvider>
          <ChildPanelProvider>
            <CachedServicesProvider>
              <ServicesProvider>
                <AppRoutes />
              </ServicesProvider>
            </CachedServicesProvider>
          </ChildPanelProvider>
        </ResellerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
     }
