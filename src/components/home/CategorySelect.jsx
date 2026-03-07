const CategorySelect = ({
  category,
  setCategory,
  filteredCategories,
  services,
  selectedPlatform,
}) => {

  // Group categories by platform
  const groupedCategories = {};

  if (selectedPlatform === "All" && services) {
    services.forEach((service) => {
      if (!groupedCategories[service.platform]) {
        groupedCategories[service.platform] = new Set();
      }
      groupedCategories[service.platform].add(service.category);
    });
  }

  return (
    <div className="mb-4">
      <label className="font-semibold block mb-1">Category</label>

      <select
        className="p-3 w-[90%] rounded-xl shadow"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>

        {/* NORMAL dropdown when not All */}
        {selectedPlatform !== "All" &&
          filteredCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}

        {/* GROUPED dropdown when All */}
        {selectedPlatform === "All" &&
          Object.entries(groupedCategories).map(([platform, cats]) => (
            <optgroup key={platform} label={platform}>
              {[...cats].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
};

export default CategorySelect;
