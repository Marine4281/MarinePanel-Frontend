// src/components/reseller/orders/OrdersTable.jsx
import { useState } from "react";

const OrdersTable = ({ orders, helpers }) => {
  const {
    formatAmount,
    formatEmail,
    shortenLink,
    getStatusStyle,
    getServiceMeta,
  } = helpers;

  // Separate toggle states
  const [expandedService, setExpandedService] = useState({});
  const [expandedCategory, setExpandedCategory] = useState({});

  const toggleService = (id) => {
    setExpandedService((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCategory = (id) => {
    setExpandedCategory((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 🔥 Improved short text logic
  const getShortText = (text) => {
    if (!text) return "—";

    let cleaned = text;

    // Remove bracket parts
    cleaned = cleaned.split("[")[0];

    // Split by common separators
    cleaned = cleaned.split("~")[0];
    cleaned = cleaned.split("|")[0];
    cleaned = cleaned.split("-")[0];

    // Remove unicode styled characters
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, "");

    return cleaned.trim() || text;
  };

  return (
    <div className="hidden md:block overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Service ID</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Link</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Charge ($)</th>
            <th className="px-4 py-3">Commission ($)</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => {
            const progress = Math.min(
              ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
              100
            );

            const meta = getServiceMeta(o);
            const isServiceExpanded = expandedService[o._id];
            const isCategoryExpanded = expandedCategory[o._id];

            return (
              <tr key={o._id} className="border-b hover:bg-gray-50">
                {/* Order */}
                <td className="px-4 py-3 font-bold">
                  #{o.customOrderId || o._id.slice(-6)}
                </td>

                {/* User */}
                <td className="px-4 py-3">
                  {formatEmail(o.userId?.email)}
                </td>

                {/* Service */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>
                      {isServiceExpanded
                        ? o.service || "—"
                        : getShortText(o.service)}
                    </span>

                    {o.service && o.service.length > 25 && (
                      <button
                        onClick={() => toggleService(o._id)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        {isServiceExpanded ? "←" : "→"}
                      </button>
                    )}
                  </div>
                </td>

                {/* Service ID */}
                <td className="px-4 py-3">{meta.serviceId}</td>

                {/* Category */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>
                      {isCategoryExpanded
                        ? meta.category
                        : getShortText(meta.category)}
                    </span>

                    {meta.category && meta.category.length > 25 && (
                      <button
                        onClick={() => toggleCategory(o._id)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        {isCategoryExpanded ? "←" : "→"}
                      </button>
                    )}
                  </div>
                </td>

                {/* Link */}
                <td className="px-4 py-3">
                  <a
                    href={o.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {shortenLink(o.link)}
                  </a>
                </td>

                {/* Progress */}
                <td className="px-4 py-3">
                  {o.quantityDelivered || 0}/{o.quantity}
                  <div className="w-full bg-gray-200 h-2 mt-1 rounded">
                    <div
                      className="h-2 bg-orange-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </td>

                {/* Charge */}
                <td className="px-4 py-3">
                  ${formatAmount(o.charge)}
                </td>

                {/* Commission */}
                <td className="px-4 py-3 text-orange-500">
                  ${formatAmount(o.resellerCommission)}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusStyle(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
