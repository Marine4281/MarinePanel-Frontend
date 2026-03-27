//src/components/reseller/ResellerAdminOrders.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ResellerAdminFilters from "./ResellerAdminFilters";

const formatMoney = (v) => Number(v || 0).toFixed(4);

const ResellerAdminOrders = ({ resellerId }) => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();
      const res = await API.get(
        `/admin/resellers/${resellerId}/orders?${query}`
      );
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, resellerId]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-3">Orders</h2>

      <ResellerAdminFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : !orders.length ? (
        <p className="text-gray-500">No orders found</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Service</th>
              <th>Order ID</th>
              <th>Status</th>
              <th>Charge</th>
              <th>Date</th>
              <th>Link</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td>{o.service}</td>
                <td>{o.orderId}</td>
                <td>{o.status}</td>
                <td>${formatMoney(o.charge)}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td className="truncate max-w-[150px]">{o.link}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ResellerAdminOrders;
