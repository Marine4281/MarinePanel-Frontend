//src/components/reseller/ResellerAdminStats.jsx
import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const ResellerStats = ({ reseller, stats, refresh }) => {
  const [commission, setCommission] = useState(reseller.resellerCommissionRate || 0);

  const updateCommission = async () => {
    try {
      await API.put(`/admin/resellers/${reseller._id}/commission`, {
        commission,
      });
      toast.success("Updated");
      refresh();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-4 gap-4">

      <div>Wallet: ${Number(stats.wallet).toFixed(4)}</div>
      <div>Orders: {stats.totalOrders}</div>
      <div>Revenue: ${Number(stats.totalRevenue).toFixed(4)}</div>
      <div>Earnings: ${Number(stats.resellerEarnings).toFixed(4)}</div>
      <div>Free Orders: {stats.freeOrders}</div>

      <div className="col-span-2 flex items-center gap-2">
        <input
          type="number"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          className="border px-2 py-1 w-20"
        />
        <button
          onClick={updateCommission}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Update %
        </button>
      </div>
    </div>
  );
};

export default ResellerStats;
