const OrdersTable = ({ orders, helpers }) => {
  const { formatAmount, formatEmail, shortenLink, getStatusStyle, getServiceMeta } = helpers;

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

            return (
              <tr key={o._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold">
                  #{o.customOrderId || o._id.slice(-6)}
                </td>
                <td className="px-4 py-3">
                  {formatEmail(o.userId?.email)}
                </td>
                <td className="px-4 py-3">{o.service}</td>
                <td className="px-4 py-3">{meta.serviceId}</td>
                <td className="px-4 py-3">{meta.category}</td>
                <td className="px-4 py-3">
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {shortenLink(o.link)}
                  </a>
                </td>
                <td className="px-4 py-3">
                  {o.quantityDelivered || 0}/{o.quantity}
                  <div className="w-full bg-gray-200 h-2 mt-1 rounded">
                    <div className="h-2 bg-orange-500" style={{ width: `${progress}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3">${formatAmount(o.charge)}</td>
                <td className="px-4 py-3 text-orange-500">
                  ${formatAmount(o.resellerCommission)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(o.status)}`}>
                    {o.status}
                  </span>
                </td>
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
