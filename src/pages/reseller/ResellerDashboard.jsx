// src/pages/reseller/ResellerDashboard.jsx

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiMenu,
  FiLogOut,
  FiCopy,
  FiUsers,
  FiShoppingCart,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";

import Sidebar from "../../components/reseller/Sidebar";
import StatCard from "../../components/reseller/StatCard";
import Table from "../../components/reseller/Table";

export default function ResellerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const copyLink = () => {
    if (!dashboardData?.domain) return;
    navigator.clipboard.writeText(`https://${dashboardData.domain}`);
    toast.success("Reseller link copied");
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, usersRes, ordersRes] = await Promise.all([
          API.get("/reseller/dashboard"),
          API.get("/reseller/users"),
          API.get("/reseller/orders"),
        ]);

        setDashboardData(dashRes.data);
        setUsers(usersRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex min-h-screen w-full max-w-full bg-gray-100 overflow-x-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 flex-shrink-0">
        <Sidebar brandName={dashboardData?.brandName} />
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <Sidebar
          brandName={dashboardData?.brandName}
          mobile
          close={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">

        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center bg-white p-4 shadow w-full">
          <button onClick={() => setMenuOpen(true)}>
            <FiMenu size={20} />
          </button>
          <h1 className="font-bold text-orange-500">Dashboard</h1>
          <FiLogOut size={20} />
        </header>

        <main className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">

          {/* Link */}
          {!loading && dashboardData?.domain && (
            <div className="bg-white p-4 md:p-5 rounded-xl shadow mb-6 w-full max-w-full">
              <h2 className="font-semibold mb-2">Your Reseller Link</h2>

              <div className="flex items-center justify-between gap-2 bg-gray-100 p-3 rounded-lg w-full overflow-hidden">
                <span className="text-sm truncate">
                  https://{dashboardData.domain}
                </span>

                <button
                  onClick={copyLink}
                  className="flex-shrink-0"
                >
                  <FiCopy />
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 w-full">
            <StatCard title="Users" value={dashboardData?.users} icon={<FiUsers />} />
            <StatCard title="Orders" value={dashboardData?.orders} icon={<FiShoppingCart />} />
            <StatCard title="Revenue" value={`$${dashboardData?.revenue || 0}`} icon={<FiCreditCard />} />
            <StatCard title="Earnings" value={`$${dashboardData?.earnings || 0}`} icon={<FiDollarSign />} />
            <StatCard title="Wallet" value={`$${dashboardData?.wallet || 0}`} icon={<FiCreditCard />} />
          </div>

          {/* Tables */}
          <div className="space-y-6 w-full max-w-full">
            
            <div className="w-full overflow-x-auto">
              <Table title="Reseller Users" data={users} type="users" />
            </div>

            <div className="w-full overflow-x-auto">
              <Table title="Reseller Orders" data={orders} type="orders" />
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
