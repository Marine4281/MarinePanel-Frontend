// src/components/reseller/ResellerAdminOrders.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ResellerFilters from "./ResellerAdminFilters";

const StatusBadge = ({ status }) => {
  const base = "px-2 py-1 text-xs rounded-full font-medium";

  const styles = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`${base} ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

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
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const formatMoney = (num) => `$${Number(num || 0).toFixed(4)}`;
  const formatDate = (date) =>
    new Date(date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-white border rounded-2xl shadow-sm">

      {/* FILTERS */}
      <div className="p-4 border-b">
        <ResellerFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Charge</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {o.service}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {o.providerServiceId}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>

                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {formatMoney(o.charge)}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(o.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResellerAdminOrders;
