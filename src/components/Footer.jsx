// src/components/Footer.jsx
//
// Bottom navigation bar shown to end users on all panel types.
//
// KEY FIXES vs previous version:
//   1. Uses domainType from CachedServicesContext instead of
//      raw hostname string comparison — single source of truth
//      for "main / reseller / childPanel" detection
//   2. Child panel end users get a tailored nav (no Resellers tab,
//      Services tab shown instead) matching their panel's scope
//   3. Theme color falls back correctly across all three panel types:
//      childPanel → childPanel.themeColor
//      reseller   → reseller.themeColor
//      main       → brand default orange
//   4. Active tab highlight uses theme-aware color instead of
//      hardcoded green-300 which clashed on dark themes
//   5. Handles loading state — renders nothing until domainType
//      resolves so there is no tab flash on first paint

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

/* ============================================================
   NAV LINK DEFINITIONS
   Three sets — main platform, reseller domain, child panel domain.
   Keeping them separate is cleaner than mutating one array.
============================================================ */

const MAIN_LINKS = [
  { name: "Home",      icon: "fas fa-home",              path: "/home" },
  { name: "Wallet",    icon: "fas fa-wallet",            path: "/wallet" },
  { name: "Orders",    icon: "fa-solid fa-cart-shopping", path: "/orders" },
  { name: "Resellers", icon: "fas fa-network-wired",     path: "/resellers" },
  { name: "Profile",   icon: "fas fa-user",              path: "/profile" },
];

// Reseller domain end users cannot see the Resellers tab —
// they are end users of a reseller, not resellers themselves.
// Services replaces it so they can browse what the reseller offers.
const RESELLER_LINKS = [
  { name: "Home",     icon: "fas fa-home",               path: "/home" },
  { name: "Wallet",   icon: "fas fa-wallet",             path: "/wallet" },
  { name: "Orders",   icon: "fa-solid fa-cart-shopping", path: "/orders" },
  { name: "Services", icon: "fas fa-list",               path: "/services" },
  { name: "Profile",  icon: "fas fa-user",               path: "/profile" },
];

// Child panel end users: same as reseller — no Resellers tab,
// Services instead. They belong to this child panel's scope only.
const CHILD_PANEL_LINKS = [
  { name: "Home",     icon: "fas fa-home",               path: "/home" },
  { name: "Wallet",   icon: "fas fa-wallet",             path: "/wallet" },
  { name: "Orders",   icon: "fa-solid fa-cart-shopping", path: "/orders" },
  { name: "Services", icon: "fas fa-list",               path: "/services" },
  { name: "Profile",  icon: "fas fa-user",               path: "/profile" },
];

/* ============================================================
   COMPONENT
============================================================ */
const Footer = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { reseller }               = useReseller();
  const { childPanel }             = useChildPanel();
  const { domainType }             = useCachedServices();

  // ── Resolve theme color ──────────────────────────────────
  // Priority: child panel theme → reseller theme → platform default
  const themeColor =
    domainType === "childPanel" && childPanel?.themeColor
      ? childPanel.themeColor
      : reseller?.themeColor || "#f97316";

  // ── Resolve nav links ────────────────────────────────────
  const links =
    domainType === "childPanel" ? CHILD_PANEL_LINKS
    : domainType === "reseller" ? RESELLER_LINKS
    : MAIN_LINKS;

  // ── Active tab style ─────────────────────────────────────
  // Use white with reduced opacity instead of hardcoded green-300
  // so the highlight is always visible regardless of theme color.
  const activeClass   = "text-white opacity-100 scale-110";
  const inactiveClass = "text-white opacity-60";

  // ── Loading guard ─────────────────────────────────────────
  // domainType is null until CachedServicesContext resolves.
  // Return null to avoid a flash of incorrectly-labelled tabs.
  if (!domainType) return null;

  return (
    <nav
      className="fixed bottom-0 w-full z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: themeColor }}
    >
      <div className="flex justify-around items-center text-center px-2 py-2">
        {links.map((link) =>
          link.external ? (
            // External links (e.g. WhatsApp support shortcut if added later)
            <a
              key={link.name}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1 relative transition-transform duration-150 ${inactiveClass}`}
            >
              <i className={`${link.icon} text-lg`} />
              <span className="text-xs">{link.name}</span>

              {link.badge && (
                <span className="absolute -top-1 right-0 bg-green-500 text-white text-[9px] px-1 rounded-full leading-tight">
                  {link.badge}
                </span>
              )}
            </a>
          ) : (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-150 ${
                location.pathname === link.path ? activeClass : inactiveClass
              }`}
            >
              <i className={`${link.icon} text-lg`} />
              <span className="text-xs font-medium">{link.name}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
};

export default Footer;
