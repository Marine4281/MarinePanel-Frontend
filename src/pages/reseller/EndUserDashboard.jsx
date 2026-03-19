import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function EndUserDashboard() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [branding, setBranding] = useState({
    brandName: "MarinePanel",
    logo: null,
    themeColor: "#ff6b00",
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dashboard/public");
      setUserData(res.data.user);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reseller branding
  const fetchBranding = async () => {
    try {
      const res = await API.get("/end-user/branding");
      setBranding(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load branding");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchBranding();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6" style={{ color: branding.themeColor }}>
      {/* Header */}
      <div className="flex items-center mb-6">
        {branding.logo && <img src={branding.logo} alt="Logo" className="h-10 mr-3" />}
        <h1 className="text-2xl font-bold">{branding.brandName}</h1>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Wallet Balance:</strong> ${userData.balance.toFixed(2)}</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="px-3 py-2">{o._id}</td>
                  <td className="px-3 py-2">{o.serviceName}</td>
                  <td className="px-3 py-2">${o.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">{o.status}</td>
                  <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
      }
