export default function Sidebar({ brandName, mobile, close }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const active = (path) =>
    location.pathname === path
      ? "bg-orange-100 text-orange-600 font-semibold"
      : "text-gray-700 hover:bg-orange-50 hover:text-orange-500";

  const handleClose = () => {
    if (typeof close === "function") close();
  };

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
          onClick={() => {
            navigate("/home");
            handleClose();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-50"
        >
          <FiHome /> Home
        </button>

        <Link to="/reseller/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/dashboard")}`} onClick={handleClose}>
          <FiGrid /> Dashboard
        </Link>

        <Link to="/reseller/users" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/users")}`} onClick={handleClose}>
          <FiUsers /> Users
        </Link>

        <Link to="/reseller/orders" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/orders")}`} onClick={handleClose}>
          <FiShoppingCart /> Orders
        </Link>

        <Link to="/reseller/services" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/services")}`} onClick={handleClose}>
          <FiGrid /> Services
        </Link>

        <Link to="/reseller/branding" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/branding")}`} onClick={handleClose}>
          <FiCreditCard /> Branding
        </Link>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 mt-6 px-3 py-2 rounded hover:bg-red-50"
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </aside>
  );
}
