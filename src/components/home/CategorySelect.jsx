import { useState } from "react";

const platformIcons = {
  TikTok: "🎵",
  Instagram: "📸",
  YouTube: "▶️",
};

const CategorySelect = ({
  category,
  setCategory,
  services,
  selectedPlatform,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const grouped = {};

  if (services) {
    services.forEach((service) => {
      const platform = service.platform || "Other";
      const cat = service.category;

      if (selectedPlatform !== "All" && platform !== selectedPlatform) return;

      if (!grouped[platform]) grouped[platform] = new Set();
      grouped[platform].add(cat);
    });
  }

  const filtered = Object.entries(grouped).map(([platform, cats]) => ({
    platform,
    cats: [...cats].filter((c) =>
      c.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  return (
    <div className="mb-4 relative w-[90%]">
      <label className="font-semibold block mb-1">Category</label>

      {/* SELECT BOX */}
      <div
        className="p-3 rounded-xl shadow border cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        {category || "Select category"}
      </div>

      {open && (
        <div className="absolute z-50 w-full bg-white border shadow-xl rounded-xl mt-2 max-h-80 overflow-y-auto">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search category..."
            className="w-full p-2 border-b outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* PLATFORMS */}
          {filtered.map(({ platform, cats }) =>
            cats.length > 0 ? (
              <div key={platform}>

                {/* PLATFORM HEADER */}
                <div className="bg-gray-100 px-3 py-2 font-semibold text-sm sticky top-0">
                  {platformIcons[platform] || "📦"} {platform}
                </div>

                {/* CATEGORIES */}
                {cats.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {cat}
                  </div>
                ))}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
