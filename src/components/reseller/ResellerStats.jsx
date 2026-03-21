const ResellerStats = ({ reseller, stats }) => {
  return (
    <div className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>Wallet: ${stats.wallet}</div>
      <div>Orders: {stats.totalOrders}</div>
      <div>Revenue: ${stats.totalRevenue}</div>
      <div>Profit: ${stats.totalProfit}</div>
      <div>Reseller Earned: ${stats.resellerEarnings}</div>
      <div>Provider Cost: ${stats.providerCostTotal}</div>
      <div>Free Orders: {stats.freeOrders}</div>
      <div>Commission: {reseller.resellerCommissionRate || 0}%</div>
    </div>
  );
};

export default ResellerStats;
