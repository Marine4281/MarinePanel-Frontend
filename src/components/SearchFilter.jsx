import countryList from "react-select-country-list";

const AdminStatsFilters = ({ country, setCountry, dateRange, setDateRange, onApply }) => {
  const countries = countryList().getData();

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-6 flex flex-col md:flex-row gap-4">

      {/* Country */}  
      <select  
        className="p-3 border rounded-xl w-full md:w-56"  
        value={country}  
        onChange={(e) => setCountry(e.target.value)}  
      >  
        <option value="All">All Countries</option>  
        {countries.map((c) => (  
          <option key={c.value} value={c.label}>  
            {c.label}  
          </option>  
        ))}  
      </select>  

      {/* Date */}  
      <select  
        className="p-3 border rounded-xl w-full md:w-56"  
        value={dateRange}  
        onChange={(e) => setDateRange(e.target.value)}  
      >  
        <option value="all">All Days</option>       {/* All orders */}
        <option value="today">Today</option>  
        <option value="yesterday">Yesterday</option>  
        <option value="7days">Last 7 Days</option>  
        <option value="30days">Last 30 Days</option>  
        <option value="year">This Year</option>     {/* This year */}
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