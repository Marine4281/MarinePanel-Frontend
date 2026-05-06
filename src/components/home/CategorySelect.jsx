// src/components/home/CategorySelect.jsx
import { useState, useMemo, useEffect } from "react";
import {
  FaTiktok,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTelegram,
} from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import API from "../../api/axios";

const icons = {
  TikTok: <FaTiktok className="text-black text-lg" />,
  Instagram: <FaInstagram className="text-pink-500 text-lg" />,
  YouTube: <FaYoutube className="text-red-600 text-lg" />,
  Facebook: <FaFacebook className="text-blue-600 text-lg" />,
  Telegram: <FaTelegram className="text-blue-500 text-lg" />,
};

const platformBg = {
  TikTok: "bg-gray-100",
  Instagram: "bg-pink-50",
  YouTube: "bg-red-50",
  Facebook: "bg-blue-50",
  Telegram: "bg-blue-50",
};

const CategorySelect = ({ services, category, setCategory, selectedPlatform }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryMeta, setCategoryMeta] = useState([]);

  useEffect(() => {
    API.get("/category-meta")
      .then((res) => setCategoryMeta(res.data || []))
      .catch(() => setCategoryMeta([]));
  }, []);

  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => {
      m[`${c.platform}::${c.category}`] = c;
    });
    return m;
  }, [categoryMeta]);

  const grouped = useMemo(() => {
    const groups = {};
    services.forEach((s) => {
      if (selectedPlatform !== "All" && s.platform !== selectedPlatform) return;
      if (!groups[s.platform]) groups[s.platform] = new Set();
      groups[s.platform].add(s.category);
    });

    const sorted = {};
    Object.entries(groups).forEach(([platform, catSet]) => {
      sorted[platform] = [...catSet].sort((a, b) => {
        const orderA = metaMap[`${platform}::${a}`]?.sortOrder ?? 999;
        const orderB = metaMap[`${platform}::${b}`]?.sortOrder ?? 999;
        return orderA - orderB;
      });
    });
    return sorted;
  }, [services, selectedPlatform, metaMap]);

  const isFeatured = (platform, cat) =>
    metaMap[`${platform}::${cat}`]?.isFeatured ?? false;

  const selectedPlatformForCategory = Object.keys(grouped).find((p) =>
    grouped[p]?.includes(category)
  );

  return (
    <div className="relative w-[95%] mb-5">
      <label className="font-semibold block mb-2 text-gray-700">Category</label>

      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-md cursor-pointer hover:border-green-500 transition"
      >
        <span className="text-gray-700 font-medium flex items-center gap-2">
          {category ? (
            <>
              {selectedPlatformForCategory &&
                isFeatured(selectedPlatformForCategory, category) && (
                  <span className="animate-pulse text-yellow-400"
                    style={{ filter: "drop-shadow(0 0 6px rgba(250,204,21,0.9))" }}>
                    ⭐
                  </span>
                )}
              {category}
            </>
          ) : (
            "Select category"
          )}
        </span>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute w-full bg-white shadow-2xl rounded-2xl mt-2 max-h-96 overflow-y-auto z-50 border">
          <input
            type="text"
            placeholder="Search category..."
            className="w-full p-3 border-b outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {Object.entries(grouped).map(([platform, cats]) => (
            <div key={platform} className={`${platformBg[platform] || "bg-gray-50"} p-3`}>
              <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
                {icons[platform] || null}
                {platform}
              </div>

              {cats
                .filter((c) => c.toLowerCase().includes(search.toLowerCase()))
                .map((cat) => {
                  const featured = isFeatured(platform, cat);
                  return (
                    <div
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`p-2 rounded-lg cursor-pointer text-sm hover:bg-gray-200 flex items-center gap-2 ${
                        category === cat ? "bg-green-100 font-medium" : ""
                      }`}
                    >
                      {featured && (
                        <span
                          className="text-yellow-400 text-base leading-none animate-pulse"
                          style={{ filter: "drop-shadow(0 0 5px rgba(250,204,21,0.95)) drop-shadow(0 0 10px rgba(250,204,21,0.6))" }}
                        >
                          ⭐
                        </span>
                      )}
                      {cat}
                    </div>
                  );
                })}
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <div className="p-4 text-center text-sm text-gray-400">No categories found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
