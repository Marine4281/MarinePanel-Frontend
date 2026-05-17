// src/components/admin/childpanel/CPDetailOrdersTab.jsx

import { fmt, getStatusStyle } from "./CPDetailHelpers";

export default function CPDetailOrdersTab({ orders, stats, pagination, page, onPageChange }) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">No orders yet</p>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-green-600 font-semibold">
          Total Earnings: ${fmt(stats.totalEarnings)}
        </span>
        <span className="text-xs text-gray-400">
          Revenue: ${fmt(stats.totalRevenue)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-xs">
          <thead className="bg-gray-50 text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Qty</th>
              <th className="px-4 py-2 text-left">Charge</th>
              <th className="px-4 py-2 text-left">Commission</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-bold text-gray-800">
                  #{o.customOrderId || o._id?.slice(-6)}
                </td>
                <td className="px-4 py-2 truncate max-w-[140px] text-gray-700">
                  {o.service}
                </td>
                <td className="px-4 py-2 text-gray-600">{o.quantity}</td>
                <td className="px-4 py-2 font-semibold text-gray-800">
                  ${fmt(o.charge)}
                </td>
                <td className="px-4 py-2 text-green-600 font-semibold">
                  ${fmt(o.childPanelCommission)}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.orderPages > 1 && (
        <Pagination
          page={page}
          pages={pagination.orderPages}
          onPrev={() => onPageChange(page - 1)}
          onNext={() => onPageChange(page + 1)}
        />
      )}
    </>
  );
}

function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between mt-4 text-xs">
      <span className="text-gray-400">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={onPrev}
          className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
        <button disabled={page === pages} onClick={onNext}
          className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
