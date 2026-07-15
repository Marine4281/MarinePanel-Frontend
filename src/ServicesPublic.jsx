// src/pages/ServicesPublic.jsx
//
// Bare public services/pricing page — no login required.
// Linked from the login-first landing page's hidden menu.
// Brand-aware (name + color swap by domain type), reuses PublicServicesTable.

import { useEffect } from "react";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import PublicServicesTable from "./PublicServicesTable";

export default function ServicesPublic() {
  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  const brand =
    domainType === "childPanel" && childPanel
      ? { name: childPanel.brandName || "Panel", color: childPanel.themeColor || "#f97316" }
      : domainType === "reseller" && reseller
      ? { name: reseller.brandName || "Panel", color: reseller.themeColor || "#f97316" }
      : { name: "MarinePanel", color: "#f97316" };

  useEffect(() => {
    document.title = `Services & Pricing — ${brand.name}`;
  }, [brand.name]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="px-6 py-10 text-white" style={{ backgroundColor: brand.color }}>
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
          Pricing
        </p>
        <h1 className="text-2xl font-extrabold mb-1">Services & Pricing</h1>
        <p className="text-xs opacity-60">
          {brand.name} · Browse rates before you sign up
        </p>
      </div>

      {/* Table */}
      <div className="px-4 py-8 pb-16">
        <PublicServicesTable themeColor={brand.color} />
      </div>
    </div>
  );
}
