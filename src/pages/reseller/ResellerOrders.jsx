// src/pages/reseller/ResellerOrders.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useServices } from "../../context/ServicesContext";

import UserOrdersFilters from "../../components/orders/UserOrdersFilters";

export default function ResellerOrders() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);

  const { services } = useServices();

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // PAGINATION STATES ✅
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const dashRes = await API.get("/reseller/dashboard");
        setBrandName(dashRes.data.brandName);

        const ordersRes = await API.get("/reseller/orders");
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load reseller orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ===============================
     FILTER LOGIC
  =============================== */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.service?.toLowerCase().includes(search.toLowerCase()) ||
        o.link?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        !status || o.status?.toLowerCase() === status.toLowerCase();

      const date = new Date(o.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const matchDate =
        (!from || date >= from) &&
        (!to || date <= new Date(to.setHours(23, 59, 59)));

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, search, status, fromDate, toDate]);

  /* ===============================
     PAGINATION LOGIC ✅
  =============================== */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, currentPage, ordersPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, fromDate, toDate]);

  /* ===============================
     HELPERS
  =============================== */
  const formatAmount = (val) => Number(val || 0).toFixed(4);

  const formatEmail = (email) => {
    if (!email) return "—";
    return email.replace("@gmail.com", "");
  };

  const shortenLink = (link) => {
    if (!link) return "";
    return link.length > 30 ? link.slice(0, 30) + "..." : link;
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "processing":
        return "bg-blue-100 text-blue-600";
      case "failed":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getServiceMeta = (order) => {
    const match = services.find(
      (s) =>
        s.name === order.service ||
        s.name?.toLowerCase() === order.service?.toLowerCase()
    );

    return {
      serviceId: match?.serviceId || "—",
      category: match?.category || "—",
    };
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
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

          <Link to="/reseller/dashboard">Dashboard</Link>
          <Link to="/reseller/users">Users</Link>
          <Link to="/reseller/orders" className="text-orange-500 font-semibold">
            Orders
          </Link>
          <Link to="/reseller/branding">Branding</Link>

          <button onClick={logout} className="text-red-500 mt-6 flex items-center gap-2">
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <main className="p-4 md:p-6 flex-1 overflow-auto pb-24">
          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Loading orders...
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">

              <h2 className="text-lg md:text-xl font-bold mb-4">
                Reseller Orders ({filteredOrders.length})
              </h2>

              {/* FILTERS */}
              <UserOrdersFilters
                search={search}
                setSearch={setSearch}
                status={status}
                setStatus={setStatus}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
              />

              {/* TABLE */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Charge</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.map((o) => (
                      <tr key={o._id} className="border-b">
                        <td className="px-4 py-3">
                          #{o.customOrderId || o._id.slice(-6)}
                        </td>
                        <td className="px-4 py-3">{o.service}</td>
                        <td className="px-4 py-3">
                          ${formatAmount(o.charge)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS ✅ */}
              <div className="flex items-center justify-between mt-4 flex-wrap gap-2">

                <div>
                  <select
                    value={ordersPerPage}
                    onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span>
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
    }
