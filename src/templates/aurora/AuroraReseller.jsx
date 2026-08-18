// src/templates/aurora/AuroraReseller.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";
import { FiLayers, FiUserCheck, FiCode, FiArrowRight } from "react-icons/fi";

export default function AuroraReseller() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#a78bfa", name: childPanel?.brandName || "Panel" };

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
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-6 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand.color }}>Toolkit</p>
          <h2 className="text-2xl font-black text-white">Reseller Tools</h2>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Everything to resell {brand.name} services or plug into our API.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.link}
                className="group flex items-start gap-4 rounded-2xl p-4 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${brand.color}55`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${brand.color}20`, color: brand.color }}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" style={{ color: brand.color }} />
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link to="/terms" className="text-xs underline-offset-4 hover:underline" style={{ color: "rgba(255,255,255,0.35)" }}>
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </AuroraLayout>
  );
}
