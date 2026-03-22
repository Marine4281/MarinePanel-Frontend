import { useReseller } from "../context/ResellerContext";

const InfoBanner = () => {
  const { reseller } = useReseller();

  const hostname = window.location.hostname;

  const isMainPanel =
    hostname === "marinepanel.online" ||
    hostname === "www.marinepanel.online";

  // ❌ Hide on reseller domains
  if (!isMainPanel) {
    return null;
  }

  return (
    <div className="bg-white shadow-xl text-sm rounded-xl p-4 mb-4">
      <strong>Marine Panel</strong> is the best and cheapest SMM panel
      currently, trusted by influencers, businesses, agencies, freelancers,
      and resellers. We deliver real engagement, instant results, and
      high-quality SMM services for Facebook, Instagram, YouTube, TikTok,
      Telegram, X/Twitter and more.
    </div>
  );
};

export default InfoBanner;
