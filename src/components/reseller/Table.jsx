// src/components/reseller/Table.jsx
import { useState, useMemo } from "react";

const formatAmount = (val) => Number(val || 0).toFixed(4);

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-600";
    case "pending":
      return "bg-yellow-100 text-yellow-600";
    case "failed":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function Table({ title, data, type }) {
  const STEP = 10;
  const INITIAL = 5;

  const [visible, setVisible] = useState(INITIAL);

  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [data]);

  const displayed = sortedData.slice(0, visible);

  const isAtEnd = visible >= data.length;
  const canViewLess = visible > INITIAL;
  

  const handleViewMore = () => {
    setVisible((prev) => Math.min(prev + STEP, data.length));
  };

  const handleViewLess = () => {
    setVisible(INITIAL);
  },

  return (
    <div className="bg-white p-5 rounded-xl shadow-md mb-6 overflow-x-auto">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-500">{data.length} items</span>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No data</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                {type === "users" ? (
                  <>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Wallet ($)</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Commission</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {displayed.map((item) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  {type === "users" ? (
                    <>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">{item.phone || "-"}</td>
                      <td className="px-4 py-3 text-orange-500 font-semibold">
                        ${formatAmount(item.wallet || item.balance)}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        #
                        {item.customOrderId ||
                          item._id?.slice(-6) ||
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        ${formatAmount(item.charge)}
                      </td>
                      <td className="px-4 py-3 text-orange-500 font-semibold">
                        ${formatAmount(item.resellerCommission)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Controls */}
          <div className="flex justify-center gap-3 mt-4">
            {!isAtEnd && (
              <button
                onClick={handleViewMore}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                View More
              </button>
            )}

            {isAtEnd && canViewLess && (
              <button
                onClick={handleViewLess}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                View Less
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
