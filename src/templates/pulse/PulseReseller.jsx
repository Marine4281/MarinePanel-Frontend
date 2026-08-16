// src/templates/pulse/PulseReseller.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import PulseLayout from "./PulseLayout";
import { FiLayers, FiUserCheck, FiCode, FiChevronRight } from "react-icons/fi";

export default function PulseReseller() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#6366f1", name: childPanel?.brandName || "Panel" };

  const items = [
    {
      title: "Services",
      description: "Browse every service available to resell, with live rates and limits.",
      icon: FiLayers,
      link: "/services",
    },
    {
      title: "Reseller Panel",
      description: user?.isReseller
        ? "Manage your reseller dashboard, pricing, and orders."
        : "Launch your own panel, set your own prices, and earn on every order.",
      icon: FiUserCheck,
      link: user?.isReseller ? "/reseller/dashboard" : "/reseller-panel",
    },
    {
      title: "API Access",
      description: "Automate orders and integrate your own tools with our API.",
      icon: FiCode,
      link: "/api-access",
    },
  ];

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="pt-1">
          <p className="text-xs text-gray-400 font-semibold">Toolkit</p>
          <h2 className="text-xl font-black text-gray-900">Reseller Tools</h2>
          <p className="text-xs text-gray-400 mt-1">Everything to resell {brand.name} services or plug into our API.</p>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.link}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${brand.color}12`, color: brand.color }}
                >
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
                <FiChevronRight size={15} className="text-gray-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        <div className="text-center pt-1">
          <Link to="/terms" className="text-xs text-gray-400 underline-offset-4 hover:underline">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </PulseLayout>
  );
}
