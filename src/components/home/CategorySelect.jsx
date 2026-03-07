import { useState } from "react";
import { FaTiktok, FaInstagram, FaYoutube, FaStar } from "react-icons/fa";

const platformIcons = {
  TikTok: <FaTiktok className="text-black" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  YouTube: <FaYoutube className="text-red-600" />,
};

const CategorySelect = ({ services, category, setCategory }) => {
  const [search, setSearch] = useState("");

  const popularCategories = [
    "TikTok Fast Followers",
    "Instagram Cheapest Likes",
    "Youtube Views",
  ];

  const grouped = {};

  services.forEach((service) => {
    const platform = service.platform || "Other";

    if (!grouped[platform]) grouped[platform] = [];

    grouped[platform].push(service.category);
  });

  return (
    <div className="relative w-full">

      {/* search */}
      <input
        type="text"
        placeholder="Search category..."
        className="w-full p-3 border rounded-xl mb-2"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow max-h-80 overflow-y-auto">

        {/* POPULAR */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 font-semibold text-yellow-500 mb-2">
            <FaStar /> Popular
          </div>

          {popularCategories.map((cat) => (
            <div
              key={cat}
              onClick={() => setCategory(cat)}
              className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              {cat}
            </div>
          ))}
        </div>

        {/* PLATFORM GROUPS */}
        {Object.entries(grouped).map(([platform, cats]) => (
          <div key={platform} className="p-3 border-b">

            <div className="flex items-center gap-2 font-semibold mb-2">
              {platformIcons[platform]}
              {platform}
            </div>

            {cats
              .filter((cat) =>
                cat.toLowerCase().includes(search.toLowerCase())
              )
              .map((cat) => (
                <div
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    category === cat ? "bg-blue-100" : ""
                  }`}
                >
                  {cat}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelect;
