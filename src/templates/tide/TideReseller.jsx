// src/templates/tide/TideReseller.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import TideLayout from "./TideLayout";
import {
  FiLayers, FiUserCheck, FiCode, FiArrowRight,
} from "react-icons/fi";

export default function TideReseller() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel" };

  // Child-panel end users never get the "Create Child Panel" option —
  // that's a main-platform-only capability. Tide only ever renders
  // on a child panel domain, so it's always hidden here.
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
    <TideLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Reseller Tools</h2>
          <p className="text-xs text-gray-400 mt-1">
            Everything you need to resell {brand.name} services or plug into our API.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.link}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: `${brand.color}14`, color: brand.color }}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-gray-900 text-sm">{item.title}</h3>
                    <FiArrowRight
                      size={12}
                      className="text-gray-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                      style={{ color: brand.color }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link
            to="/terms"
            className="text-xs text-gray-400 hover:underline underline-offset-4"
            style={{ "--tw-text-opacity": 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = brand.color)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </TideLayout>
  );
}
