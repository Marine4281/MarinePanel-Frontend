import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft, FiGrid, FiUsers, FiShoppingCart,
  FiLayers, FiSliders, FiLogOut, FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { to: "/reseller/dashboard", label: "Dashboard", icon: <FiGrid /> },
  { to: "/reseller/users",     label: "Users",     icon: <FiUsers /> },
  { to: "/reseller/orders",    label: "Orders",    icon: <FiShoppingCart /> },
  { to: "/reseller/services",  label: "Services",  icon: <FiLayers /> },
  { to: "/reseller/branding",  label: "Branding",  icon: <FiSliders /> },
];

export default function Sidebar({ brandName, mobileOpen, onClose }) {
  const auth     = useAuth();
  const logout   = typeof auth?.logout === "function" ? auth.logout : () => {};
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleBack = () => {
    navigate("/home");
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  const Content = () => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-orange-400 uppercase tracking-widest font-semibold">Reseller</p>
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate max-w-[160px]">
            {brandName || "Panel"}
          </h1>
        </div>
        {mobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Back */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition mb-4 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">
          <FiArrowLeft size={15} />
        </span>
        Back to Home
      </button>

      <div className="border-t border-gray-100 mb-4" />

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive(to)
                ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
              }
            `}
          >
            <span className={`text-base ${isActive(to) ? "text-white" : "text-orange-400"}`}>
              {icon}
            </span>
            {label}
            {isActive(to) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
            )}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition w-full"
        >
          <FiLogOut size={15} />
          Logout
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm p-6 sticky top-0">
        <Content />
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="lg:hidden fixed top-0 left-0 z-50 w-72 h-full bg-white shadow-2xl p-6 flex flex-col">
            <Content />
          </aside>
        </>
      )}
    </>
  );
}
