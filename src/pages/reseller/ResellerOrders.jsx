// src/pages/reseller/ResellerOrders.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

import Sidebar from "../../components/reseller/Sidebar";
import UserOrdersFilters from "../../components/orders/UserOrdersFilters";

export default function ResellerOrders() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  const { logout } = useAuth();

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
    const searchLower = search.toLowerCase();

    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o._id?.toLowerCase().includes(searchLower) ||
        o.customOrderId?.toString().toLowerCase().includes(searchLower) ||
        o.service?.toLowerCase().includes(searchLower) ||
        o.link?.toLowerCase().includes(searchLower);

      const matchStatus =
        !status || o.status?.toLowerCase() === status.toLowerCase();

      const date = new Date(o.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const matchDate =
        (!from || date >= from) &&
        (!to || date <= new Date(to?.setHours(23, 59, 59)));

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, search, status, fromDate, toDate]);

  /* ===============================
     PAGINATION LOGIC
  =============================== */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, currentPage, ordersPerPage]);

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

  const getServiceMeta = (order) => ({
    serviceId: order.serviceId || "—",
    category: order.category || "—",
  });

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar brandName={brandName} />
      </div>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <Sidebar
          brandName={brandName}
          mobile
          close={() => setMenuOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* MOBILE HEADER */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">
          <button onClick={() => setMenuOpen(true)}>
            <FiMenu size={22} />
          </button>

          <h1 className="font-bold text-orange-500">Orders</h1>

          <button onClick={logout}>
            <FiLogOut />
          </button>
        </header>

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

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-4">
                {paginatedOrders.map((o) => {
                  const progress = Math.min(
                    ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
                    100
                  );
                  const meta = getServiceMeta(o);

                  return (
                    <div key={o._id} className="bg-gray-50 p-4 rounded-xl shadow-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold">
                          #{o.customOrderId || o._id.slice(-6)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(o.status)}`}>
                          {o.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        ID: {meta.serviceId} • {meta.category}
                      </p>

                      <p className="text-sm">{o.service}</p>

                      <p className="text-xs text-gray-500">
                        {formatEmail(o.userId?.email)}
                      </p>

                      <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">
                        {shortenLink(o.link)}
                      </a>

                      <div>
                        <div className="text-xs">
                          {o.quantityDelivered || 0}/{o.quantity}
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded mt-1">
                          <div className="h-2 bg-blue-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Charge: ${formatAmount(o.charge)}</span>
                        <span className="text-orange-500">
                          Commission: ${formatAmount(o.resellerCommission)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Service ID</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Link</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3">Charge ($)</th>
                      <th className="px-4 py-3">Commission ($)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.map((o) => {
                      const progress = Math.min(
                        ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
                        100
                      );
                      const meta = getServiceMeta(o);

                      return (
                        <tr key={o._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold">
                            #{o.customOrderId || o._id.slice(-6)}
                          </td>
                          <td className="px-4 py-3">
                            {formatEmail(o.userId?.email)}
                          </td>
                          <td className="px-4 py-3">{o.service}</td>
                          <td className="px-4 py-3">{meta.serviceId}</td>
                          <td className="px-4 py-3">{meta.category}</td>
                          <td className="px-4 py-3">
                            <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                              {shortenLink(o.link)}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            {o.quantityDelivered || 0}/{o.quantity}
                            <div className="w-full bg-gray-200 h-2 mt-1 rounded">
                              <div className="h-2 bg-orange-500" style={{ width: `${progress}%` }} />
                            </div>
                          </td>
                          <td className="px-4 py-3">${formatAmount(o.charge)}</td>
                          <td className="px-4 py-3 text-orange-500">
                            ${formatAmount(o.resellerCommission)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(o.status)}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(o.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
                <select
                  value={ordersPerPage}
                  onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                  className="border px-2 py-1 rounded"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
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
