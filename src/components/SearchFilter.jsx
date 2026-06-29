import Select from "react-select";
import countryList from "react-select-country-list";

const AdminStatsFilters = ({ country, setCountry, dateRange, setDateRange, onApply }) => {
  // react-select-country-list maps ISO 3166-1 alpha-2 codes (value) to
  // English country names (label) — value matches the countryCode stored
  // on the User model, so filtering here lines up with what's in the DB.
  const countryOptions = [
    { value: "All", label: "All Countries" },
    ...countryList()
      .getData()
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const selectedOption =
    countryOptions.find((c) => c.value === country) || countryOptions[0];

  // Same flag style already used for users' country in AdminUsers.jsx
  // (flagcdn.com, keyed by lowercase ISO-2 code).
  const formatOptionLabel = (option) => {
    if (option.value === "All") {
      return <span>{option.label}</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <img
          src={`https://flagcdn.com/24x18/${option.value.toLowerCase()}.png`}
          alt={option.label}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-6 flex flex-col md:flex-row gap-4">

      {/* Country — searchable, with flags */}
      <div className="w-full md:w-64">
        <Select
          options={countryOptions}
          value={selectedOption}
          onChange={(selected) => setCountry(selected?.value || "All")}
          formatOptionLabel={formatOptionLabel}
          isSearchable
          placeholder="Search country..."
          classNamePrefix="country-select"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              padding: "2px",
              borderColor: "#e5e7eb",
            }),
          }}
        />
      </div>

      {/* Date */}
      <select
        className="p-3 border rounded-xl w-full md:w-56"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
      >
        <option value="all">All Days</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="year">This Year</option>
      </select>

      <button
        onClick={onApply}
        className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default AdminStatsFilters;
