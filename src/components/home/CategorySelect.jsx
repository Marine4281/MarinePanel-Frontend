const CategorySelect = ({ category, setCategory, filteredCategories }) => {
  return (
    <div className="mb-4">
      <label className="font-semibold block mb-1">Category</label>
      <select
        className="p-3 w-[90%] rounded-xl shadow"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>
        {filteredCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;
