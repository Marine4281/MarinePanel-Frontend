import {
  FiGrid,
  FiUsers,
  FiShoppingCart,
  FiCreditCard,
  FiLogOut,
  FiHome,
  FiLayers,
  FiSliders,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ brandName, mobile, close, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const active = (path) =>
    location.pathname === path
      ? "bg-orange-100 text-orange-600 font-semibold"
      : "text-gray-700 hover:bg-orange-50 hover:text-orange-500";

  return (
    <aside
      className={`${
        mobile ? "w-64 absolute z-50 h-full" : "w-64"
      } bg-white shadow-xl border-r p-6 flex flex-col`}
    >
      <h1 className="text-xl font-bold text-orange-500 mb-6">
        {brandName || "Reseller Panel"}
      </h1>

      <nav className="flex flex-col gap-2 flex-1">

        <button
          onClick={() => { navigate("/home"); if (close) close(); }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-50 text-gray-700"
        >
          <FiHome /> Home
        </button>

        <Link to="/reseller/dashboard" onClick={close} className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/dashboard")}`}>
          <FiGrid /> Dashboard
        </Link>

        <Link to="/reseller/users" onClick={close} className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/users")}`}>
          <FiUsers /> Users
        </Link>

        <Link to="/reseller/orders" onClick={close} className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/orders")}`}>
          <FiShoppingCart /> Orders
        </Link>

        <Link to="/reseller/services" onClick={close} className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/services")}`}>
          <FiLayers /> Services
        </Link>

        <Link to="/reseller/branding" onClick={close} className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/branding")}`}>
          <FiSliders /> Branding
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-500 mt-6 px-3 py-2 rounded hover:bg-red-50"
          >
            <FiLogOut /> Logout
          </button>
        )}

      </nav>
    </aside>
  );
}
