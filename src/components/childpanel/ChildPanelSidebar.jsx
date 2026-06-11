// src/components/childpanel/ChildPanelSidebar.jsx

import {
  FiGrid,
  FiUsers,
  FiShoppingCart,
  FiServer,
  FiSliders,
  FiLogOut,
  FiHome,
  FiUserCheck,
  FiBookOpen,
  FiCreditCard,
  FiDollarSign,
  FiClipboard,
  FiTag,
  FiShield,
  FiMessageSquare,
  FiGlobe,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSupport } from "../../context/SupportContext";

export default function ChildPanelSidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { cpUnread, fmt } = useSupport();

  const logout = typeof auth?.logout === "function" ? auth.logout : () => {};

  const brandName = auth?.user?.childPanelBrandName || "Child Panel";

  const active = (path) =>
    location.pathname === path
      ? "bg-blue-100 text-blue-600 font-semibold"
      : "text-gray-700 hover:bg-blue-50 hover:text-blue-500";

  const links = [
    { to: "/child-panel/dashboard",        icon: <FiGrid />,          label: "Dashboard" },
    { to: "/child-panel/users",            icon: <FiUsers />,         label: "Users" },
    { to: "/child-panel/orders",           icon: <FiShoppingCart />,  label: "Orders" },

    // Support
    {
      to:    "/child-panel/support",
      icon:  <FiMessageSquare />,
      label: "Support",
      badge: cpUnread,
    },

    // Services
    { to: "/child-panel/services",         icon: <FiServer />,        label: "Services" },

    // Payment Gateways
    {
      to:    "/child-panel/payment-gateways",
      icon:  <FiCreditCard />,
      label: "Payments",
    },

    { to: "/child-panel/resellers",        icon: <FiUserCheck />,     label: "Resellers" },
    { to: "/child-panel/providers",        icon: <FiServer />,        label: "Providers" },
    { to: "/child-panel/wallet",           icon: <FiCreditCard />,    label: "Wallet" },
    { to: "/child-panel/financial",        icon: <FiDollarSign />,    label: "Financial" },
    { to: "/child-panel/categories",       icon: <FiTag />,           label: "Categories" },
    { to: "/child-panel/logs",             icon: <FiShield />,        label: "Staff Actions" },
    { to: "/child-panel/settings",         icon: <FiSliders />,       label: "Settings" },
    {
      to:    "/child-panel/reseller-guides",
      icon:  <FiBookOpen />,
      label: "Reseller Guides",
    },
    { to: "/child-panel/guides",           icon: <FiClipboard />,     label: "Guides" },

    // ✅ Branding
    { to: "/child-panel/branding",         icon: <FiSliders />,       label: "Branding" },

    // ✅ SEO
    { to: "/child-panel/seo",              icon: <FiGlobe />,         label: "SEO" },
  ];

  const SidebarBody = () => (
    <aside className="w-64 bg-white shadow-xl border-r p-6 flex flex-col h-full">
      {/* Brand name */}
      <h1 className="text-xl font-bold text-blue-600 mb-6 truncate">
        {brandName}
      </h1>

      <nav className="flex flex-col gap-1 flex-1">
        {/* Back to main site */}
        <button
          onClick={() => {
            navigate("/home");
            onClose?.();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-gray-500 text-sm mb-2"
        >
          <FiHome /> Back to Home
        </button>

        <div className="border-t mb-2" />

        {links.map(({ to, icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${active(to)}`}
          >
            {icon}

            <span className="flex-1">{label}</span>

            {badge > 0 && (
              <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow animate-pulse">
                {fmt(badge)}
              </span>
            )}
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            onClose?.();
          }}
          className="flex items-center gap-2 text-red-500 mt-6 px-3 py-2 rounded hover:bg-red-50 text-sm"
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:block">
        <SidebarBody />
      </div>

      {/* Mobile — overlay + drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed top-0 left-0 z-50 h-full">
            <SidebarBody />
          </div>
        </div>
      )}
    </>
  );
}
