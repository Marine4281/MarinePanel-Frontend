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

/* ================= Skeleton Components ================= */

const CardSkeleton = () => (
  <div className="bg-white rounded-lg p-5 shadow animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white p-4 rounded shadow animate-pulse">
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
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="font-bold text-orange-500 mb-2">Your Reseller Link</h2>
              <div className="flex justify-between bg-gray-100 p-3 rounded">
                <span>https://{dashboardData.domain}</span>
                <button onClick={copyLink}><FiCopy /></button>
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
                <Stat title="Revenue" value={`$${dashboardData?.totalRevenue || 0}`} icon={<FiCreditCard />} />
                <Stat title="Earnings" value={`$${dashboardData?.earnings || 0}`} icon={<FiDollarSign />} />
                <Stat title="Wallet" value={`$${dashboardData?.wallet || 0}`} icon={<FiCreditCard />} />
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

/* ================= Reusable Components ================= */

const Stat = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded shadow border-l-4 border-orange-500 flex justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-orange-500">{value}</p>
    </div>
    <div className="text-2xl text-orange-500">{icon}</div>
  </div>
);

const Table = ({ title, data, type }) => (
  <div className="bg-white p-4 rounded shadow mb-6 overflow-x-auto">
    <h2 className="font-bold text-orange-500 mb-4">{title}</h2>

    {data.length === 0 ? (
      <p className="text-gray-500">No data</p>
    ) : (
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            {type === "users" ? (
              <>
                <th>Name</th>
                <th>Email</th>
                <th>Date</th>
              </>
            ) : (
              <>
                <th>ID</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Date</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border-b">
              {type === "users" ? (
                <>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </>
              ) : (
                <>
                  <td>{item._id.slice(-6)}</td>
                  <td>${item.charge}</td>
                  <td>${item.resellerCommission || 0}</td>
                  <td>{item.status}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
