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
  FiGrid
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResellerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
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
    if (!dashboardData.domain) return;
    const link = `https://${dashboardData.domain}`;
    navigator.clipboard.writeText(link);
    toast.success("Reseller link copied");
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashRes = await API.get("/reseller/dashboard");
        setDashboardData(dashRes.data);

        const usersRes = await API.get("/reseller/users");
        setUsers(usersRes.data);

        const ordersRes = await API.get("/reseller/orders");
        setOrders(ordersRes.data);
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
          {dashboardData.brandName || "Reseller Panel"}
        </h1>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-3 py-2 rounded text-gray-700 hover:text-orange-500 hover:bg-orange-50"
          >
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

          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-500 mt-6 px-3 py-2 rounded hover:bg-red-50"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Navbar */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-orange-500 text-2xl">
            <FiMenu />
          </button>
          <h1 className="text-lg font-bold text-orange-500">Reseller Dashboard</h1>
          <button onClick={logout}><FiLogOut /></button>
        </header>

        {/* Mobile Sidebar */}
        {menuOpen && (
          <aside className="lg:hidden absolute z-50 bg-white shadow-xl w-64 h-full p-6">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 px-3 py-2 rounded text-gray-700 hover:text-orange-500"
              >
                <FiArrowLeft /> Back
              </button>

              <Link className={active("/reseller/dashboard")} to="/reseller/dashboard">Dashboard</Link>
              <Link className={active("/reseller/users")} to="/reseller/users">Users</Link>
              <Link className={active("/reseller/orders")} to="/reseller/orders">Orders</Link>
              <Link className={active("/reseller/services")} to="/reseller/services">Services</Link>
              <Link className={active("/reseller/branding")} to="/reseller/branding">Branding</Link>

              <button onClick={logout} className="text-red-500 mt-4">Logout</button>
            </nav>
          </aside>
        )}

        <main className="p-6 flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading reseller dashboard...</div>
          ) : (
            <>
              {/* Reseller Link */}
              {dashboardData.domain && (
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-bold text-orange-500 mb-2">Your Reseller Link</h2>
                  <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
                    <span className="text-gray-700 break-all">https://{dashboardData.domain}</span>
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                    >
                      <FiCopy /> Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* USERS */}
                <div className="bg-white shadow-lg hover:shadow-xl transition rounded-lg p-5 border-l-4 border-orange-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Users</p>
                      <p className="text-2xl font-bold text-orange-500">{dashboardData.users}</p>
                    </div>
                    <FiUsers className="text-orange-500 text-3xl" />
                  </div>
                </div>

                {/* ORDERS */}
                <div className="bg-white shadow-lg hover:shadow-xl transition rounded-lg p-5 border-l-4 border-orange-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Orders</p>
                      <p className="text-2xl font-bold text-orange-500">{dashboardData.orders}</p>
                    </div>
                    <FiShoppingCart className="text-orange-500 text-3xl" />
                  </div>
                </div>

                {/* REVENUE */}
                <div className="bg-white shadow-lg hover:shadow-xl transition rounded-lg p-5 border-l-4 border-orange-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Revenue</p>
                      <p className="text-2xl font-bold text-orange-500">${dashboardData.revenue}</p>
                    </div>
                    <FiCreditCard className="text-orange-500 text-3xl" />
                  </div>
                </div>

                {/* WALLET */}
                <div className="bg-white shadow-lg hover:shadow-xl transition rounded-lg p-5 border-l-4 border-orange-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Wallet</p>
                      <p className="text-2xl font-bold text-orange-500">${dashboardData.wallet}</p>
                    </div>
                    <FiCreditCard className="text-orange-500 text-3xl" />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
                <h2 className="text-lg font-bold mb-4 text-orange-500">Reseller Users</h2>
                {users.length === 0 ? (
                  <p className="text-gray-500">No users yet</p>
                ) : (
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{u.name}</td>
                          <td className="px-4 py-2">{u.email}</td>
                          <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Orders Table */}
              <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
                <h2 className="text-lg font-bold mb-4 text-orange-500">Reseller Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">No orders yet</p>
                ) : (
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Order ID</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Commission</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{o._id.slice(-6)}</td>
                          <td className="px-4 py-2">${o.amount}</td>
                          <td className="px-4 py-2 text-orange-500">${o.resellerCommission || 0}</td>
                          <td className="px-4 py-2">{o.status}</td>
                          <td className="px-4 py-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
    }
