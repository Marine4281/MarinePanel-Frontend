import {
  FaTiktok,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaWhatsapp,
  FaTelegram,
  FaLinkedin,
  FaSnapchat,
  FaSpotify,
  FaGift,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
import { BsGrid } from "react-icons/bs";

const CategoryIcons = ({
  categoriesGrid,
  selectedPlatform,
  setSelectedPlatform,
}) => {
  const renderIcon = (icon) => {
    switch (icon) {
      case "grid":
        return <BsGrid className="text-xl" />;

      case "tiktok":
        return <FaTiktok className="text-xl" />;

      case "instagram":
        return <FaInstagram className="text-xl" />;

      case "youtube":
        return <FaYoutube className="text-xl" />;

      case "facebook":
        return <FaFacebook className="text-xl" />;

      case "whatsapp":
        return <FaWhatsapp className="text-xl" />;

      case "telegram":
        return <FaTelegram className="text-xl" />;

      case "linkedin":
        return <FaLinkedin className="text-xl" />;

      case "snapchat":
        return <FaSnapchat className="text-xl" />;

      case "spotify":
        return <FaSpotify className="text-xl" />;

      case "x-twitter":
        return <FaXTwitter className="text-xl" />;

      case "gift":
        return <FaGift className="text-xl text-yellow-500" />;

      default:
        return null;
    }
  };

  return (
    <>
      <h2 className="bg-gray-100 p-2 rounded-xl font-bold text-lg text-center mb-2">
        Choose a Social Account
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {categoriesGrid.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedPlatform(cat.name)}
            className={`bg-white rounded-2xl p-2 shadow flex items-center gap-2 justify-center ${
              selectedPlatform === cat.name ? "ring-2 ring-green-500" : ""
            }`}
          >
            {renderIcon(cat.icon)}
            <span className="text-sm font-semibold">{cat.name}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default CategoryIcons;
