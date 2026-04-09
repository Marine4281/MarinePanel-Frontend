import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="mb-6">
      <div className="relative w-full md:w-1/2">
        
        {/* 🔍 Icon */}
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        {/* INPUT */}
        <input
          type="text"
          placeholder="Search by ID, name, category, rate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ❌ Clear Button */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
