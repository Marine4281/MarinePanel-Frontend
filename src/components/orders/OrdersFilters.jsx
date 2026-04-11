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
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search ID / Custom ID / Email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 w-72 border rounded-lg"
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

      <button
        onClick={onSearch}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        Filter
      </button>
    </div>
  );
};

export default OrdersFilters;
