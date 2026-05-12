// src/components/wallet/TransactionHistory.jsx
import { useState, useEffect, useRef, useCallback } from "react";

const PAGE_SIZE = 10;

const statusClass = (s) =>
  s === "Completed" ? "text-green-600"
  : s === "Pending"   ? "text-yellow-500"
  : "text-red-500";

const TransactionHistory = ({ transactions }) => {
  const [page,       setPage]       = useState(1);
  const [displayed,  setDisplayed]  = useState([]);
  const [hasMore,    setHasMore]    = useState(false);
  const loaderRef                   = useRef(null);

  // Reset when transactions prop changes (e.g. socket update)
  useEffect(() => {
    const slice = transactions.slice(0, PAGE_SIZE);
    setDisplayed(slice);
    setPage(1);
    setHasMore(transactions.length > PAGE_SIZE);
  }, [transactions]);

  // Load next page
  const loadMore = useCallback(() => {
    const nextPage  = page + 1;
    const nextSlice = transactions.slice(0, nextPage * PAGE_SIZE);
    setDisplayed(nextSlice);
    setPage(nextPage);
    setHasMore(nextSlice.length < transactions.length);
  }, [page, transactions]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, hasMore, loadMore]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Transaction History</h3>
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
          {transactions.length} total
        </span>
      </div>

      <div className="overflow-x-auto">

        {/* Desktop table */}
        <table className="w-full border-collapse hidden sm:table">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>

          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400 text-sm">
                  No transactions yet
                </td>
              </tr>
            )}
            {displayed.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 text-sm text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-sm text-gray-700 font-medium">{tx.type}</td>
                <td className="p-3 text-sm text-gray-500">{tx.method || "—"}</td>
                <td className={`p-3 text-sm font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
                </td>
                <td className={`p-3 text-sm font-semibold ${statusClass(tx.status)}`}>
                  {tx.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {displayed.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">No transactions yet</p>
          )}
          {displayed.map((tx) => (
            <div key={tx._id} className="flex items-center justify-between border rounded-xl p-3 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-700">{tx.type}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(tx.createdAt).toLocaleDateString()} · {tx.method || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
                </p>
                <p className={`text-xs mt-0.5 font-semibold ${statusClass(tx.status)}`}>
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Infinity scroll trigger */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
          </div>
        )}

        {!hasMore && displayed.length > 0 && (
          <p className="text-center text-xs text-gray-300 py-4">
            All {transactions.length} transactions loaded
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
