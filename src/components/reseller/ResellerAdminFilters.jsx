//src/components/reseller/ResellerAdminFilters.jsx
const ResellerAdminFilters = ({ filters, setFilters }) => {
  return (
    <div className="flex gap-2 mb-3 flex-wrap">
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
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
        <option value="partial">Partial</option>
      </select>
    </div>
  );
};

export default ResellerAdminFilters;
