// src/components/reseller/Sidebar.jsx

import {
  FiGrid,
  FiUsers,
  FiShoppingCart,
  FiLogOut,
  FiHome,
  FiLayers,
  FiSliders,
  FiBookOpen,
} from "react-icons/fi";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar({
  brandName,
  mobile,
  close,
  mobileOpen,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Safe logout — guards against AuthContext not yet ready
  const auth = useAuth();

  const logout =
    typeof auth?.logout === "function"
      ? auth.logout
      : () => {};

  // Support both prop naming conventions
  const isOpen = mobile || mobileOpen;

  const handleClose = close || onClose;

  /*
  --------------------------------
  Active Link Style
  --------------------------------
  */
  const active = (path) =>
    location.pathname === path
      ? "bg-orange-100 text-orange-600 font-semibold"
      : "text-gray-700 hover:bg-orange-50 hover:text-orange-500";

  /*
  --------------------------------
  Sidebar Body
  --------------------------------
  */
  const SidebarBody = () => (
    <aside className="w-64 bg-white shadow-xl border-r p-6 flex flex-col h-full">

      {/* BRAND */}

      <h1 className="text-xl font-bold text-orange-500 mb-6">
        {brandName || "Reseller Panel"}
      </h1>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-2 flex-1">

        {/* HOME */}

        <button
          onClick={() => {
            navigate("/home");
            handleClose?.();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-50 text-gray-700"
        >
          <FiHome />
          Home
        </button>

        {/* DASHBOARD */}

        <Link
          to="/reseller/dashboard"
          onClick={handleClose}
          className={`flex items-center gap-2 px-3 py-2 rounded ${active(
            "/reseller/dashboard"
          )}`}
        >
          <FiGrid />
          Dashboard
        </Link>

        {/* USERS */}

        <Link
          to="/reseller/users"
          onClick={handleClose}
          className={`flex items-center gap-2 px-3 py-2 rounded ${active(
            "/reseller/users"
          )}`}
        >
          <FiUsers />
          Users
        </Link>

        {/* ORDERS */}

        <Link
          to="/reseller/orders"
          onClick={handleClose}
          className={`flex items-center gap-2 px-3 py-2 rounded ${active(
            "/reseller/orders"
          )}`}
        >
          <FiShoppingCart />
          Orders
        </Link>

        {/* SERVICES */}

        <Link
          to="/reseller/services"
          onClick={handleClose}
          className={`flex items-center gap-2 px-3 py-2 rounded ${active(
            "/reseller/services"
          )}`}
        >
          <FiLayers />
          Services
        </Link>

        {/* GUIDES */}

        <Link
          to="/reseller/guides"
          onClick={handleClose}
          className={`flex items-center gap-2 px-3 py-2 rounded ${active(
            "/reseller/guides"
          )}`}
        >
          <FiBookOpen />
          Guides
        </Link>

        {/* BRANDING */}

        <Link
          to="/reseller/branding"
          onClick={handleClose}
          className={`flex items-center gap-2 px-3 py-2 rounded ${active(
            "/reseller/branding"
          )}`}
        >
          <FiSliders />
          Branding
        </Link>

        {/* LOGOUT */}

        <button
          onClick={() => {
            logout();
            handleClose?.();
          }}
          className="flex items-center gap-2 text-red-500 mt-6 px-3 py-2 rounded hover:bg-red-50"
        >
          <FiLogOut />
          Logout
        </button>

      </nav>

    </aside>
  );

  return (
    <>

      {/* Desktop Sidebar */}

      <div className="hidden lg:block">
        <SidebarBody />
      </div>

      {/* Mobile Sidebar */}

      {isOpen && (

        <div className="lg:hidden">

          {/* Overlay */}

          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Drawer */}

          <div className="fixed top-0 left-0 z-50 h-full">
            <SidebarBody />
          </div>

        </div>

      )}

    </>
  );
}
