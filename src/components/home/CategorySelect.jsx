import { useState, useMemo } from "react";
import {
  FaTiktok,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTelegram,
} from "react-icons/fa";

const icons = {
  TikTok: <FaTiktok className="text-black" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  YouTube: <FaYoutube className="text-red-600" />,
  Facebook: <FaFacebook className="text-blue-600" />,
  Telegram: <FaTelegram className="text-blue-500" />,
};

const platformBg = {
  TikTok: "bg-gray-100",
  Instagram: "bg-pink-50",
  YouTube: "bg-red-50",
  Facebook: "bg-blue-50",
  Telegram: "bg-blue-50",
};

const CategorySelect = ({ services, category, setCategory }) => {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const groups = {};

    services.forEach((s) => {
      if (!groups[s.platform]) groups[s.platform] = new Set();
      groups[s.platform].add(s.category);
    });

    return groups;
  }, [services]);

  return (
    <div className="relative w-[90%] mb-4">

      <label className="font-semibold block mb-1">Category</label>

      {/* SELECT BOX */}
      <div
        onClick={() => setOpen(!open)}
        className="p-3 bg-white border rounded-xl shadow cursor-pointer"
      >
        {category || "Select category"}
      </div>

      {open && (
        <div className="absolute w-full bg-white shadow-xl rounded-xl mt-2 max-h-80 overflow-y-auto z-50">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search category..."
            className="w-full p-3 border-b outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* PLATFORM GROUPS */}
          {Object.entries(grouped).map(([platform, cats]) => (

            <div key={platform} className={`${platformBg[platform]} p-2`}>

              {/* PLATFORM HEADER */}
              <div className="flex items-center gap-2 font-semibold mb-2">
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
                    className={`p-2 rounded-lg cursor-pointer hover:bg-gray-200 ${
                      category === cat ? "bg-blue-100" : ""
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
