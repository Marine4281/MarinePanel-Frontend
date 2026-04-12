// src/components/orders/AdminUserOrdersFilters.jsx

import { useEffect, useState } from "react";

const AdminUserOrdersFilters = ({
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
  const [quickFilter, setQuickFilter] = useState("");

  /* ✅ KEEP INPUT IN SYNC (important when parent updates search) */
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  /* ✅ PROPER DEBOUNCE (FIXED) */
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(localSearch); // only update search
    }, 500);

    return () => clearTimeout(delay);
  }, [localSearch, setSearch]);

  /* ✅ TRIGGER FETCH AFTER SEARCH IS UPDATED */
  useEffect(() => {
    onSearch();
  }, [search, status, fromDate, toDate]);

  /* ✅ QUICK DATE FILTER HANDLER */
  const handleQuickFilter = (value) => {
    setQuickFilter(value);

    const now = new Date();
    let start = "";
    let end = new Date().toISOString().split("T")[0];

    if (value === "today") {
      start = end;
    }

    if (value === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      start = y.toISOString().split("T")[0];
      end = start;
    }

    if (value === "24h") {
      const d = new Date();
      d.setHours(now.getHours() - 24);
      start = d.toISOString().split("T")[0];
    }

    if (value === "7days") {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      start = d.toISOString().split("T")[0];
    }

    if (value === "30days") {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      start = d.toISOString().split("T")[0];
    }

    if (value === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = firstDay.toISOString().split("T")[0];
    }

    if (value === "year") {
      start = `${now.getFullYear()}-01-01`;
    }

    if (value === "") {
      start = "";
      end = "";
    }

    setFromDate(start);
    setToDate(end);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search Service / ID / Custom ID / Email / Rate"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
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
        <option value="partial">Partial</option>
        <option value="failed">Failed</option>
      </select>

      <select
        value={quickFilter}
        onChange={(e) => handleQuickFilter(e.target.value)}
        className="px-4 py-2 border rounded-lg"
      >
        <option value="">Custom</option>
        <option value="24h">Last 24 Hours</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>

      <input
        type="date"
        value={fromDate}
        onChange={(e) => {
          setQuickFilter("");
          setFromDate(e.target.value);
        }}
        className="px-3 py-2 border rounded-lg"
      />

      <input
        type="date"
        value={toDate}
        onChange={(e) => {
          setQuickFilter("");
          setToDate(e.target.value);
        }}
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

export default AdminUserOrdersFilters;
