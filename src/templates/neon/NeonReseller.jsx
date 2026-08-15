// src/templates/neon/NeonReseller.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";
import { FiLayers, FiUserCheck, FiCode, FiArrowRight } from "react-icons/fi";

export default function NeonReseller() {
  const { user } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#00ff88", name: childPanel?.brandName || "Panel" };
  const neon = brand.color;

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
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Toolkit</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>
            Reseller Tools
          </h2>
          <p className="text-xs mt-1" style={{ color: "#6c6c92" }}>
            Everything you need to resell {brand.name} services or plug into our API.
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
                style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${neon}55`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${neon}18`)}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${neon}14`, color: neon, boxShadow: `0 0 14px ${neon}22` }}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm" style={{ color: "#c4c4e0" }}>{item.title}</h3>
                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" style={{ color: neon }} />
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6c6c92" }}>{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link
            to="/terms"
            className="text-xs underline-offset-4 hover:underline"
            style={{ color: "#5c5c82" }}
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </NeonLayout>
  );
}
