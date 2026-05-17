// src/components/childpanel/orders/CPOrdersFilters.jsx
import { FiSearch, FiX } from "react-icons/fi";

const STATUSES = ["", "pending", "processing", "completed", "partial", "failed", "refunded"];

export default function CPOrdersFilters({ search, setSearch, status, setStatus, onSearch, onClear }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={14}
        />
        <input
          type="text"
          placeholder="Search ID, email, service, link..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}
          </option>
        ))}
      </select>

      <button
        onClick={onSearch}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Search
      </button>

      {(search || status) && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          <FiX size={14} /> Clear
        </button>
      )}
    </div>
  );
}
