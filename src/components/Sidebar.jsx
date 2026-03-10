import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const links = [
  { name: "Dashboard", icon: "fa-solid fa-chart-line", path: "/admin", exact: true },
  { name: "Users", icon: "fa-solid fa-users", path: "/admin/users" },
  { name: "Orders", icon: "fa-solid fa-cart-shopping", path: "/admin/orders" },
  { name: "Services", icon: "fa-solid fa-layer-group", path: "/admin/services" },

  // ✅ NEW PAGE
  { name: "Provider Sync", icon: "fa-solid fa-arrows-rotate", path: "/admin/provider-sync" },

  { name: "User Orders", icon: "fa-solid fa-clipboard-list", path: "/admin/user-orders" },
  { name: "Payments", icon: "fa-solid fa-credit-card", path: "/admin/payment-methods" },
  { name: "Settings", icon: "fa-solid fa-gear", path: "/admin/settings" },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-56"
      } min-h-screen bg-gray-900 text-gray-300 shadow-2xl flex flex-col transition-all duration-300`}
    >
      {/* LOGO SECTION */}
      <div className="px-6 py-6 border-b border-gray-800 flex justify-between items-center">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Marine<span className="text-orange-500">Panel</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 mt-4 space-y-1 px-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.exact}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-orange-500 rounded-r-lg"></span>
                )}

                <i className={`${link.icon} text-sm w-5`}></i>

                {!isCollapsed && (
                  <span className="text-sm font-medium">{link.name}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* PROFILE SECTION */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
            A
          </div>

          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Admin</p>
              <NavLink
                to="/admin/profile"
                className="text-xs text-gray-400 hover:text-white"
              >
                View Profile
              </NavLink>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded-lg transition-all duration-200"
          >
            Logout
          </button>
        )}
      </div>

      {/* FOOTER */}
      {!isCollapsed && (
        <div className="px-6 py-3 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} MarinePanel
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
