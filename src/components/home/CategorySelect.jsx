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
      const platform = service.platform || "Other";
      const cat = service.category;

      if (!groupedCategories[platform]) {
        groupedCategories[platform] = new Set();
      }

      groupedCategories[platform].add(cat);
    });
  }

  return (
    <div className="mb-4">
      <label className="font-semibold block mb-1">Category</label>

      <select
        className="p-3 w-[90%] rounded-xl shadow border border-gray-200 focus:outline-none"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>

        {/* NORMAL dropdown when platform is selected */}
        {selectedPlatform !== "All" &&
          filteredCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}

        {/* GROUPED dropdown when All */}
        {selectedPlatform === "All" &&
          Object.entries(groupedCategories)
            .sort(([a], [b]) => a.localeCompare(b)) // sort platforms
            .map(([platform, cats]) => (
              <optgroup
                key={platform}
                label={`▼ ${platform}`}
                className="font-bold text-blue-600"
              >
                {[...cats]
                  .sort((a, b) => a.localeCompare(b)) // sort categories
                  .map((cat) => (
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
