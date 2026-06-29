// AdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
import Table from "../components/Table";
import SearchFilter from "../components/SearchFilter";
import API from "../api/axios";

const ORDERS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [filterRevenue, setFilterRevenue] = useState("total");
  const [country, setCountry] = useState("All"); // ISO-2 code, e.g. "KE", or "All"
  const [dateRange, setDateRange] = useState("today");

  // ------------------------------
  // Fetch users once
  // ------------------------------
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  // ------------------------------
  // Fetch paginated orders — admin user-orders route (excludes CP
  // end-user-only orders, same endpoint AdminUserOrders.jsx uses)
  // ------------------------------
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/admin/user-orders", {
        params: { country, page: ordersPage, limit: ORDERS_PER_PAGE },
      });
      setOrders(data.orders || []);
      setOrdersTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  }, [country, ordersPage]);

  // ------------------------------
  // Fetch stats when filter changes
  // ------------------------------
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get("/admin/stats", {
        params: { revenue: filterRevenue, country, dateRange },
      });
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, [filterRevenue, country, dateRange]);

  // ------------------------------
  // Real-time wallet updates
  // ------------------------------
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
    });

    socket.on("wallet:update", ({ userId, balance, transactions }) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, balance, transactions } : u
        )
      );
      fetchStats();
    });

    socket.on("order:update", () => {
      fetchOrders();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => socket.disconnect();
  }, [fetchStats, fetchOrders]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ------------------------------
  // Apply filters: reset to page 1, then re-pull orders + stats
  // ------------------------------
  const handleApplyFilters = () => {
    setOrdersPage(1); // fetchOrders effect re-fires since ordersPage changed
    fetchStats();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <Topbar />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <StatsCard title="Total Users" value={stats.totalUsers} color="orange" />
          <StatsCard title="Total Orders" value={stats.totalOrders} color="blue" />
          <StatsCard
            title="Revenue"
            value={`$${Number(stats.totalRevenue || 0).toFixed(4)}`}
            color="green"
          />
        </div>

        <div className="mt-6">
          <SearchFilter
            users={users}
            orders={orders}
            filterRevenue={filterRevenue}
            setFilterRevenue={setFilterRevenue}
            country={country}
            setCountry={setCountry}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onApply={handleApplyFilters}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          <Table data={orders} type="orders" />

          {ordersTotalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                disabled={ordersPage <= 1}
                className="px-4 py-2 bg-white border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {ordersPage} of {ordersTotalPages}
              </span>
              <button
                onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                disabled={ordersPage >= ordersTotalPages}
                className="px-4 py-2 bg-white border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Users</h3>
          <Table data={users} type="users" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
