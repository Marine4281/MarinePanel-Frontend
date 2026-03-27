// src/pages/reseller/ResellerDashboard.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiMenu,
  FiLogOut,
  FiArrowLeft,
  FiCopy,
  FiUsers,
  FiShoppingCart,
  FiCreditCard,
  FiDollarSign,
  FiGrid,
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ================= Helpers ================= */

const formatAmount = (val) => Number(val || 0).toFixed(4);

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-600";
    case "pending":
      return "bg-yellow-100 text-yellow-600";
    case "failed":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* ================= Skeleton ================= */

const CardSkeleton = () => (
  <div className="bg-white rounded-xl p-5 shadow animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white p-4 rounded-xl shadow animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-3 bg-gray-100 rounded mb-2"></div>
    ))}
  </div>
);

/* ================= Component ================= */

export default function ResellerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const active = (path) =>
    location.pathname === path
      ? "bg-orange-100 text-orange-600 font-semibold"
      : "text-gray-700 hover:bg-orange-50 hover:text-orange-500";

  const copyLink = () => {
    if (!dashboardData?.domain) return;
    navigator.clipboard.writeText(`https://${dashboardData.domain}`);
    toast.success("Reseller link copied");
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [dashRes, usersRes, ordersRes] = await Promise.all([
          API.get("/reseller/dashboard"),
          API.get("/reseller/users"),
          API.get("/reseller/orders"),
        ]);

        setDashboardData(dashRes.data);
        setUsers(usersRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-xl border-r p-6">
        <h1 className="text-xl font-bold text-orange-500 mb-6">
          {dashboardData?.brandName || "Reseller Panel"}
        </h1>

        <nav className="flex flex-col gap-2">
          <button onClick={() => navigate("/home")} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-50">
            <FiArrowLeft /> Back
          </button>

          <Link to="/reseller/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/dashboard")}`}>
            <FiGrid /> Dashboard
          </Link>

          <Link to="/reseller/users" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/users")}`}>
            <FiUsers /> Users
          </Link>

          <Link to="/reseller/orders" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/orders")}`}>
            <FiShoppingCart /> Orders
          </Link>

          <Link to="/reseller/services" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/services")}`}>
            <FiGrid /> Services
          </Link>

          <Link to="/reseller/branding" className={`flex items-center gap-2 px-3 py-2 rounded ${active("/reseller/branding")}`}>
            <FiCreditCard /> Branding
          </Link>

          <button onClick={logout} className="flex items-center gap-2 text-red-500 mt-6 px-3 py-2 rounded hover:bg-red-50">
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu />
          </button>
          <h1 className="font-bold text-orange-500">Dashboard</h1>
          <button onClick={logout}><FiLogOut /></button>
        </header>

        {/* Mobile Sidebar */}
        {menuOpen && (
          <aside className="lg:hidden absolute z-50 bg-white w-64 h-full p-6 shadow">
            <nav className="flex flex-col gap-2">
              <Link to="/reseller/dashboard">Dashboard</Link>
              <Link to="/reseller/users">Users</Link>
              <Link to="/reseller/orders">Orders</Link>
              <Link to="/reseller/services">Services</Link>
              <Link to="/reseller/branding">Branding</Link>
            </nav>
          </aside>
        )}

        <main className="p-6 flex-1 overflow-auto">

          {/* LINK */}
          {!loading && dashboardData?.domain && (
            <div className="bg-white p-5 rounded-xl shadow mb-6">
              <h2 className="font-semibold text-gray-700 mb-2">Your Reseller Link</h2>
              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="text-sm">https://{dashboardData.domain}</span>
                <button onClick={copyLink} className="text-orange-500 hover:scale-110 transition">
                  <FiCopy />
                </button>
              </div>
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {loading ? (
              [...Array(5)].map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <Stat title="Users" value={dashboardData?.users} icon={<FiUsers />} />
                <Stat title="Orders" value={dashboardData?.orders} icon={<FiShoppingCart />} />
                <Stat title="Revenue" value={`$${formatAmount(dashboardData?.totalRevenue)}`} icon={<FiCreditCard />} />
                <Stat title="Earnings" value={`$${formatAmount(dashboardData?.earnings)}`} icon={<FiDollarSign />} />
                <Stat title="Wallet" value={`$${formatAmount(dashboardData?.wallet)}`} icon={<FiCreditCard />} />
              </>
            )}
          </div>

          {/* USERS */}
          {loading ? <TableSkeleton /> : (
            <Table title="Reseller Users" data={users} type="users" />
          )}

          {/* ORDERS */}
          {loading ? <TableSkeleton /> : (
            <Table title="Reseller Orders" data={orders} type="orders" />
          )}

        </main>
      </div>
    </div>
  );
}

/* ================= Components ================= */

const Stat = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
    <div className="text-2xl text-orange-500">{icon}</div>
  </div>
);

const Table = ({ title, data, type }) => (
  <div className="bg-white p-5 rounded-xl shadow-md mb-6 overflow-x-auto">

    <div className="flex justify-between mb-4">
      <h2 className="font-semibold text-gray-800">{title}</h2>
      <span className="text-sm text-gray-500">{data.length} items</span>
    </div>

    {data.length === 0 ? (
      <p className="text-gray-500 text-center py-6">No data</p>
    ) : (
      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            {type === "users" ? (
              <>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Wallet ($)</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </>
            ) : (
              <>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Commission</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border-t hover:bg-gray-50 transition">

              {type === "users" ? (
                <>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {item.email}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {item.phone || "-"}
                  </td>

                  <td className="px-4 py-3 text-orange-500 font-semibold">
                    ${formatAmount(item.wallet || item.balance)}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 font-medium">
                    #{item._id.slice(-6)}
                  </td>

                  <td className="px-4 py-3">
                    ${formatAmount(item.charge)}
                  </td>

                  <td className="px-4 py-3 text-orange-500 font-semibold">
                    ${formatAmount(item.resellerCommission)}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </>
              )}

            </tr>
          ))}
        </tbody>

      </table>
    )}
  </div>
);
