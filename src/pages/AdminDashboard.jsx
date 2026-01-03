// AdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client"; // <-- import Socket.IO client
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
import Table from "../components/Table";
import SearchFilter from "../components/SearchFilter";
import API from "../api/axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [filterRevenue, setFilterRevenue] = useState("total");
  const [country, setCountry] = useState("All");
  const [dateRange, setDateRange] = useState("today");

  // ------------------------------
  // Fetch users & orders once
  // ------------------------------
  const fetchUsersAndOrders = useCallback(async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/orders"),
      ]);

      setUsers(usersRes.data);  
      setOrders(ordersRes.data);  
    } catch (err) {  
      console.error("Failed to fetch users/orders", err);  
    }
  }, []);

  // ------------------------------
  // Fetch stats when filter changes
  // ------------------------------
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get(
        `/admin/stats?revenue=${filterRevenue}&country=${country}&dateRange=${dateRange}`
      );
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, [filterRevenue, country, dateRange]);

  // ------------------------------
  // Real-time wallet updates
  // ------------------------------
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL); // <-- backend server URL

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
    });

    socket.on("wallet:update", ({ userId, balance, transactions }) => {
      // Update users array in real-time
      setUsers(prevUsers =>
        prevUsers.map(u => 
          u._id === userId ? { ...u, balance, transactions } : u
        )
      );

      // Optionally, you can refetch stats if needed
      fetchStats();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => socket.disconnect();
  }, [fetchStats]);

  // ------------------------------
  // Initial fetch
  // ------------------------------
  useEffect(() => {
    fetchUsersAndOrders();
  }, [fetchUsersAndOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
            value={`$${stats.totalRevenue}`}  
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
            onApply={fetchStats} // apply filters
          />  
        </div>  

        <div className="mt-6">  
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>  
          <Table data={orders} type="orders" />  
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