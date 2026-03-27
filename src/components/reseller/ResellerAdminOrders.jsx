//src/components/reseller/ResellerAdminOrders.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ResellerFilters from "./ResellerAdminFilters";

const ResellerAdminOrders = ({ resellerId }) => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchOrders = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await API.get(`/admin/resellers/${resellerId}/orders?${query}`);
    setOrders(res.data.data);
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <ResellerFilters filters={filters} setFilters={setFilters} />

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Service</th>
            <th>ID</th>
            <th>Status</th>
            <th>Charge</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t">
              <td>{o.service}</td>
              <td>{o.providerServiceId}</td>
              <td>{o.status}</td>
              <td>${Number(o.charge || 0).toFixed(4)}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResellerAdminOrders;
