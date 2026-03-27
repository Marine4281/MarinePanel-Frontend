//src/components/reseller/ResellerAdminStats.jsx
const formatMoney = (v) => Number(v || 0).toFixed(4);

const ResellerAdminStats = ({ reseller, stats }) => {
  return (
    <div className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>Wallet: ${formatMoney(stats.wallet)}</div>
      <div>Orders: {stats.totalOrders}</div>
      <div>Revenue: ${formatMoney(stats.totalRevenue)}</div>
      <div>Profit: ${formatMoney(stats.totalProfit)}</div>
      <div>Earned: ${formatMoney(stats.resellerEarnings)}</div>
      <div>Provider Cost: ${formatMoney(stats.providerCostTotal)}</div>
      <div>Free Orders: {stats.freeOrders}</div>
      <div>Commission: {reseller.resellerCommissionRate || 0}%</div>
    </div>
  );
};

export default ResellerAdminStats;
