import { useEffect, useState } from "react";

const OrdersFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onSearch,
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  /* 🔥 DEBOUNCE */
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(localSearch);
      onSearch(); // trigger fetch
    }, 500); // 500ms debounce

    return () => clearTimeout(delay);
  }, [localSearch]);

  /* 🔥 AUTO FETCH ON FILTER CHANGE */
  useEffect(() => {
    onSearch();
  }, [status, fromDate, toDate]);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search Service / ID / Custom ID / Email / Rate"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="px-4 py-2 w-80 border rounded-lg"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-4 py-2 border rounded-lg"
      >
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>

      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="px-3 py-2 border rounded-lg"
      />

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="px-3 py-2 border rounded-lg"
      />
    </div>
  );
};

export default OrdersFilters;
