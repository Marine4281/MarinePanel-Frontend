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

const getPlatformIcon = (icon) => {
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

export default getPlatformIcon;
