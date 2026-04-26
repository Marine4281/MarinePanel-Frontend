import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiCopy, FiUsers, FiShoppingCart, FiCreditCard, FiDollarSign } from "react-icons/fi";

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
    <div className="flex min-h-screen bg-gray-100">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
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

      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center bg-white p-4 shadow">
          <button onClick={() => setMenuOpen(true)}>
            <FiMenu />
          </button>
          <h1 className="font-bold text-orange-500">Dashboard</h1>
          <FiLogOut />
        </header>

        <main className="p-4 md:p-6">

          {/* Link */}
          {!loading && dashboardData?.domain && (
            <div className="bg-white p-4 md:p-5 rounded-xl shadow mb-6">
              <h2 className="font-semibold mb-2">Your Reseller Link</h2>
              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="text-sm truncate">
                  https://{dashboardData.domain}
                </span>
                <button onClick={copyLink}>
                  <FiCopy />
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
            <StatCard title="Users" value={dashboardData?.users} icon={<FiUsers />} />
            <StatCard title="Orders" value={dashboardData?.orders} icon={<FiShoppingCart />} />
            <StatCard title="Revenue" value={`$${dashboardData?.revenue || 0}`} icon={<FiCreditCard />} />
            <StatCard title="Earnings" value={`$${dashboardData?.earnings || 0}`} icon={<FiDollarSign />} />
            <StatCard title="Wallet" value={`$${dashboardData?.wallet || 0}`} icon={<FiCreditCard />} />
          </div>

          {/* Tables */}
          <Table title="Reseller Users" data={users} type="users" />
          <Table title="Reseller Orders" data={orders} type="orders" />

        </main>
      </div>
    </div>
  );
          }
