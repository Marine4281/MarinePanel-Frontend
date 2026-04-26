const OrdersCards = ({ orders, helpers }) => {
  const { formatAmount, formatEmail, shortenLink, getStatusStyle, getServiceMeta } = helpers;

  return (
    <div className="md:hidden space-y-4">
      {orders.map((o) => {
        const progress = Math.min(
          ((o.quantityDelivered || 0) / (o.quantity || 1)) * 100,
          100
        );
        const meta = getServiceMeta(o);

        return (
          <div key={o._id} className="bg-gray-50 p-4 rounded-xl shadow-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-bold">
                #{o.customOrderId || o._id.slice(-6)}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(o.status)}`}>
                {o.status}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              ID: {meta.serviceId} • {meta.category}
            </p>

            <p className="text-sm">{o.service}</p>

            <p className="text-xs text-gray-500">
              {formatEmail(o.userId?.email)}
            </p>

            <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">
              {shortenLink(o.link)}
            </a>

            <div>
              <div className="text-xs">
                {o.quantityDelivered || 0}/{o.quantity}
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div className="h-2 bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Charge: ${formatAmount(o.charge)}</span>
              <span className="text-orange-500">
                Commission: ${formatAmount(o.resellerCommission)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersCards;
