import { useMemo, useState } from "react";

const platformIcons = {
  TikTok: "🎵",
  Instagram: "📸",
  YouTube: "▶️",
  Facebook: "📘",
  WhatsApp: "💬",
  Telegram: "✈️",
  Spotify: "🎧",
  Snapchat: "👻",
  LinkedIn: "💼",
  "X/Twitter": "🐦",
};

const CategorySelect = ({
  category,
  setCategory,
  filteredCategories,
  services,
  selectedPlatform,
}) => {

  const [search, setSearch] = useState("");

  // Group categories by platform
  const groupedCategories = useMemo(() => {
    const grouped = {};

    if (selectedPlatform === "All" && services) {
      services.forEach((service) => {
        const platform = service.platform || "Other";

        if (!grouped[platform]) {
          grouped[platform] = new Set();
        }

        grouped[platform].add(service.category);
      });
    }

    return grouped;
  }, [services, selectedPlatform]);

  return (
    <div className="mb-4">

      <label className="font-semibold block mb-1">
        Category
      </label>

      {/* 🔎 SEARCH */}
      {selectedPlatform === "All" && (
        <input
          type="text"
          placeholder="Search category..."
          className="p-2 mb-2 w-[90%] rounded-lg border shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* SELECT */}
      <select
        className="p-3 w-[90%] rounded-xl shadow border bg-white"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>

        {/* NORMAL dropdown */}
        {selectedPlatform !== "All" &&
          filteredCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}

        {/* GROUPED dropdown */}
        {selectedPlatform === "All" &&
          Object.entries(groupedCategories).map(([platform, cats]) => {

            const icon = platformIcons[platform] || "📦";

            const filteredCats = [...cats].filter((cat) =>
              cat.toLowerCase().includes(search.toLowerCase())
            );

            if (!filteredCats.length) return null;

            return (
              <optgroup
                key={platform}
                label={`${icon} ${platform}`}
                className="font-bold text-gray-700"
              >
                {filteredCats.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </optgroup>
            );
          })}
      </select>

    </div>
  );
};

export default CategorySelect;
