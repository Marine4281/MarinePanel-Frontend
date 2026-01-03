import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", icon: "fa-solid fa-chart-line", path: "/admin" },
  { name: "Users", icon: "fa-solid fa-users", path: "/admin/users" },
  { name: "Orders", icon: "fa-solid fa-cart-shopping", path: "/admin/orders" },
  { name: "Services", icon: "fa-solid fa-layer-group", path: "/admin/services" },
  { name: "Categories", icon: "fa-solid fa-box", path: "/admin/categories" },
  { name: "Settings", icon: "fa-solid fa-gear", path: "/admin/settings" },
  { name: "Payments", icon: "fa-solid fa-credit-card", path: "/admin/payment-methods" }, 
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-500">Marine Admin</h1>
      </div>

      <nav className="mt-6">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 hover:bg-orange-100 text-gray-700 ${
                isActive ? "bg-orange-100 font-semibold" : ""
              }`
            }
          >
            <i className={`${link.icon} w-6`}></i>
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;