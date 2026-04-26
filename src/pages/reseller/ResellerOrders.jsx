import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";

import Sidebar from "../../components/reseller/Sidebar";
import UserOrdersFilters from "../../components/orders/UserOrdersFilters";
import OrdersCards from "../../components/reseller/orders/OrdersCards";
import OrdersTable from "../../components/reseller/orders/OrdersTable";
import OrdersPagination from "../../components/reseller/orders/OrdersPagination";

export default function ResellerOrders() {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [orders, setOrders]               = useState([]);
  const [brandName, setBrandName]         = useState("");
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [status, setStatus]               = useState("");
  const [fromDate, setFromDate]           = useState("");
  const [toDate, setToDate]               = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const dashRes   = await API.get("/reseller/dashboard");
        setBrandName(dashRes.data?.brandName || "Reseller Panel");
        const ordersRes = await API.get("/reseller/orders");
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch {
        toast.error("Failed to load reseller orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
      const to   = toDate   ? new Date(toDate)   : null;

      const matchDate =
        (!from || date >= from) &&
        (!to   || date <= new Date(to.setHours(23, 59, 59)));

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, search, status, fromDate, toDate]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, currentPage, ordersPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, fromDate, toDate]);

  const helpers = {
    formatAmount:   (v) => Number(v || 0).toFixed(4),
    formatEmail:    (e) => (e ? e.replace("@gmail.com", "") : "—"),
    shortenLink:    (l) => (l?.length > 30 ? l.slice(0, 30) + "..." : l),
    getStatusStyle: (s) =>
      s === "completed" ? "bg-green-100 text-green-600"
      : s === "pending" ? "bg-yellow-100 text-yellow-600"
      : "bg-gray-100 text-gray-600",
    getServiceMeta: (o) => ({
      serviceId: o.serviceId || "—",
      category:  o.category  || "—",
    }),
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar brandName={brandName} />
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <Sidebar
          brandName={brandName}
          mobile
          close={() => setMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center bg-white p-4 shadow">
          <button onClick={() => setMenuOpen(true)}>
            <FiMenu />
          </button>
          <h1 className="font-bold text-orange-500">Orders</h1>
          <FiLogOut />
        </header>

        <main className="p-4 md:p-6">
          {loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              Loading orders...
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl shadow">
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
              <OrdersCards  orders={paginatedOrders} helpers={helpers} />
              <OrdersTable  orders={paginatedOrders} helpers={helpers} />
              <OrdersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                ordersPerPage={ordersPerPage}
                setOrdersPerPage={setOrdersPerPage}
              />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
