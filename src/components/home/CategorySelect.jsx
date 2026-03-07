import { useState, useMemo } from "react";
import {
  FaTiktok,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTelegram,
} from "react-icons/fa";
import { ChevronDown } from "lucide-react";

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

  const grouped = useMemo(() => {

    const groups = {};

    services.forEach((s) => {

      // 🔴 THIS FIXES YOUR PROBLEM
      if (selectedPlatform !== "All" && s.platform !== selectedPlatform) {
        return;
      }

      if (!groups[s.platform]) groups[s.platform] = new Set();
      groups[s.platform].add(s.category);

    });

    return groups;

  }, [services, selectedPlatform]);

  return (
    <div className="relative w-[95%] mb-5">

      <label className="font-semibold block mb-2 text-gray-700">
        Category
      </label>

      {/* SELECT BOX */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-md cursor-pointer hover:border-green-500 transition"
      >
        <span className="text-gray-700 font-medium">
          {category || "Select category"}
        </span>

        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute w-full bg-white shadow-2xl rounded-2xl mt-2 max-h-96 overflow-y-auto z-50 border">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search category..."
            className="w-full p-3 border-b outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* PLATFORM GROUPS */}
          {Object.entries(grouped).map(([platform, cats]) => (

            <div key={platform} className={`${platformBg[platform]} p-3`}>

              <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
                {icons[platform]}
                {platform}
              </div>

              {[...cats]
                .filter((c) =>
                  c.toLowerCase().includes(search.toLowerCase())
                )
                .map((cat) => (

                  <div
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setOpen(false);
                    }}
                    className={`p-2 rounded-lg cursor-pointer text-sm hover:bg-gray-200 ${
                      category === cat ? "bg-green-100 font-medium" : ""
                    }`}
                  >
                    {cat}
                  </div>

                ))}

            </div>

          ))}

        </div>
      )}
    </div>
  );
};

export default CategorySelect;
