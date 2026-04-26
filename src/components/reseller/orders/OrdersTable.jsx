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

  // Track expanded rows (service/category toggle)
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Shorten service/category (remove extra tags like [Refill...] ᴺᴱᵂ etc.)
  const getShortText = (text) => {
    if (!text) return "—";

    // Remove content inside brackets and trim
    let cleaned = text.split("[")[0].trim();

    // Optional: remove unicode styled tags like ᴺᴱᵂ
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, "").trim();

    return cleaned || text;
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
            const isExpanded = expandedRows[o._id];

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

                {/* Service (Short + Toggle) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>
                      {isExpanded
                        ? o.service || "—"
                        : getShortText(o.service)}
                    </span>
                    {o.service && o.service.length > 20 && (
                      <button
                        onClick={() => toggleRow(o._id)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        {isExpanded ? "←" : "→"}
                      </button>
                    )}
                  </div>
                </td>

                {/* Service ID */}
                <td className="px-4 py-3">{meta.serviceId}</td>

                {/* Category (Short + Toggle) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>
                      {isExpanded
                        ? meta.category
                        : getShortText(meta.category)}
                    </span>
                    {meta.category && meta.category.length > 20 && (
                      <button
                        onClick={() => toggleRow(o._id)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        {isExpanded ? "←" : "→"}
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
