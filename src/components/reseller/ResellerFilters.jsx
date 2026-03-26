//src/components/reseller/ResellerFilters.jsx
const ResellerFilters = ({ filters, setFilters }) => {
  return (
    <div className="flex gap-2 mb-3">
      <input
        type="date"
        onChange={(e) =>
          setFilters((f) => ({ ...f, from: e.target.value }))
        }
      />

      <input
        type="date"
        onChange={(e) =>
          setFilters((f) => ({ ...f, to: e.target.value }))
        }
      />

      <select
        onChange={(e) =>
          setFilters((f) => ({ ...f, status: e.target.value }))
        }
      >
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
};

export default ResellerFilters;
