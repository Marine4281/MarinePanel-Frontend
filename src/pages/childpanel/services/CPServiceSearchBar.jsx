// src/components/childpanel/services/CPServiceSearchBar.jsx
import { FiSearch, FiX } from "react-icons/fi";

export default function CPServiceSearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <FiSearch size={14} className="absolute left-3 top-2.5 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, category or ID..."
        className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
