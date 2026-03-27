// src/pages/reseller/ResellerOrders.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResellerOrders() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const dashRes = await API.get("/reseller/dashboard");
        setBrandName(dashRes.data.brandName);

        const ordersRes = await API.get("/reseller/orders");
        setOrders(ordersRes.data);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load reseller orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Safe formatter (always 5 decimals)
  const formatAmount = (val) => {
    return Number(val || 0).toFixed(5);
  };

  // ✅ Status badge styling
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

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md p-6">

        <h1 className="text-xl font-bold text-orange-500 mb-6">
          {brandName || "Reseller Panel"}
        </h1>

        <nav className="flex flex-col gap-4">

          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
          >
            <FiArrowLeft /> Back
          </button>

          <Link to="/reseller/dashboard" className="font-semibold hover:text-orange-500">
            Dashboard
          </Link>

          <Link to="/reseller/users" className="font-semibold hover:text-orange-500">
            Users
          </Link>

          <Link to="/reseller/orders" className="font-semibold text-orange-500">
            Orders
          </Link>

          <Link to="/reseller/branding" className="font-semibold hover:text-orange-500">
            Branding
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-500 mt-6"
          >
            <FiLogOut /> Logout
          </button>

        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Navbar */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-orange-500 text-2xl"
          >
            <FiMenu />
          </button>

          <h1 className="text-lg font-bold text-orange-500">
            Orders
          </h1>

          <button onClick={logout}>
            <FiLogOut />
          </button>

        </header>

        {/* Mobile Sidebar */}
        {menuOpen && (
          <aside className="lg:hidden absolute z-50 bg-white shadow-md w-64 h-full p-6">

            <nav className="flex flex-col gap-4">

              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
              >
                <FiArrowLeft /> Back
              </button>

              <Link to="/reseller/dashboard">Dashboard</Link>
              <Link to="/reseller/users">Users</Link>
              <Link to="/reseller/orders">Orders</Link>
              <Link to="/reseller/branding">Branding</Link>

              <button onClick={logout} className="text-red-500">
                Logout
              </button>

            </nav>

          </aside>
        )}

        <main className="p-6 flex-1 overflow-auto">

          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Loading reseller orders...
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl p-6">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Reseller Orders
                </h2>

                <span className="text-sm text-gray-500">
                  Total: {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No orders yet
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">

                  <table className="w-full text-sm">

                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Order</th>
                        <th className="px-4 py-3 text-left">Amount ($)</th>
                        <th className="px-4 py-3 text-left">Commission ($)</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o._id}
                          className="border-t hover:bg-gray-50 transition"
                        >

                          <td className="px-4 py-3 font-medium text-gray-700">
                            #{o._id.slice(-6)}
                          </td>

                          <td className="px-4 py-3">
                            {formatAmount(o.amount)}
                          </td>

                          <td className="px-4 py-3 text-orange-500 font-semibold">
                            {formatAmount(o.resellerCommission)}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(o.status)}`}>
                              {o.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
      }
