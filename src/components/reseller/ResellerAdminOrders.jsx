//src/components/reseller/ResellerAdminOrders.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ResellerFilters from "./ResellerFilters";

const ResellerOrders = ({ resellerId }) => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchOrders = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await API.get(
        `/admin/resellers/${resellerId}/orders?${query}`
      );
      setOrders(res.data || []);
    } catch {
      console.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Orders</h2>

      <ResellerFilters filters={filters} setFilters={setFilters} />

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Service</th>
            <th>ID</th>
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
              <td>{o.providerServiceId}</td>
              <td>{o.status}</td>
              <td>${o.charge}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td className="truncate max-w-[150px]">{o.link}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResellerAdminOrders;
