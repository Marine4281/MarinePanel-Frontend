// src/templates/registry.js
//
// Central registry for all child panel end-user templates.
// Each template exports a set of page components that replace
// the default pages when a child panel owner has selected that template.
//
// templateId values must match what the backend stores in
// user.childPanelTemplateId (set via PUT /cp/settings/template).
//
// HOW IT WORKS:
//   1. TemplateRouter reads childPanel.templateId from ChildPanelContext
//   2. Looks up the template in this registry
//   3. Renders the correct page component for the current route
//
// ADDING A NEW TEMPLATE:
//   1. Create src/templates/<name>/ folder with page components
//   2. Import and add an entry here
//   3. The TemplateRouter picks it up automatically

// ── Aurora (dark gradient, hamburger ≡ hidden side drawer, no header/footer)
import AuroraLogin    from "./aurora/AuroraLogin";
import AuroraRegister from "./aurora/AuroraRegister";
import AuroraHome     from "./aurora/AuroraHome";
import AuroraWallet   from "./aurora/AuroraWallet";
import AuroraOrders   from "./aurora/AuroraOrders";
import AuroraServices from "./aurora/AuroraServices";
import AuroraProfile  from "./aurora/AuroraProfile";

// ── Pulse (minimal white, floating bottom nav, mobile-first card layout)
import PulseLogin    from "./pulse/PulseLogin";
import PulseRegister from "./pulse/PulseRegister";
import PulseHome     from "./pulse/PulseHome";
import PulseWallet   from "./pulse/PulseWallet";
import PulseOrders   from "./pulse/PulseOrders";
import PulseServices from "./pulse/PulseServices";
import PulseProfile  from "./pulse/PulseProfile";

// ── Neon (cyberpunk dark + neon accents, persistent left sidebar)
import NeonLogin    from "./neon/NeonLogin";
import NeonRegister from "./neon/NeonRegister";
import NeonHome     from "./neon/NeonHome";
import NeonWallet   from "./neon/NeonWallet";
import NeonOrders   from "./neon/NeonOrders";
import NeonServices from "./neon/NeonServices";
import NeonProfile  from "./neon/NeonProfile";

// ── Tide (professional ocean blue, classic top header + footer)
import TideLogin    from "./tide/TideLogin";
import TideRegister from "./tide/TideRegister";
import TideHome     from "./tide/TideHome";
import TideWallet   from "./tide/TideWallet";
import TideOrders   from "./tide/TideOrders";
import TideServices from "./tide/TideServices";
import TideProfile  from "./tide/TideProfile";

// ─────────────────────────────────────────────────────────────
// REGISTRY
// Each entry shape:
// {
//   id: string          — matches user.childPanelTemplateId
//   name: string        — display name in the template picker
//   description: string — short description shown in picker
//   preview: string     — CSS gradient string for picker card
//   style: string       — tag line: "No header/footer", etc.
//   pages: {
//     login, register, home, wallet, orders, services, profile
//   }
// }
// ─────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Dark gradient atmosphere with a hidden slide-in menu. No header or footer.",
    preview: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    accent: "#a78bfa",
    style: "Hidden ≡ Menu · No Header · Dark",
    pages: {
      login:    AuroraLogin,
      register: AuroraRegister,
      home:     AuroraHome,
      wallet:   AuroraWallet,
      orders:   AuroraOrders,
      services: AuroraServices,
      profile:  AuroraProfile,
    },
  },
  {
    id: "pulse",
    name: "Pulse",
    description: "Clean minimal white with a floating bottom navigation bar. Perfect for mobile users.",
    preview: "linear-gradient(135deg, #ffffff, #f0f4ff)",
    accent: "#6366f1",
    style: "Bottom Nav · Minimal · Mobile-First",
    pages: {
      login:    PulseLogin,
      register: PulseRegister,
      home:     PulseHome,
      wallet:   PulseWallet,
      orders:   PulseOrders,
      services: PulseServices,
      profile:  PulseProfile,
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Cyberpunk-inspired dark panel with glowing neon accents and a persistent sidebar.",
    preview: "linear-gradient(135deg, #0d0d0d, #1a1a2e)",
    accent: "#00ff88",
    style: "Sidebar · Dark · Neon Glow",
    pages: {
      login:    NeonLogin,
      register: NeonRegister,
      home:     NeonHome,
      wallet:   NeonWallet,
      orders:   NeonOrders,
      services: NeonServices,
      profile:  NeonProfile,
    },
  },
  {
    id: "tide",
    name: "Tide",
    description: "Professional ocean-blue layout with a classic top header and footer. Clean and trustworthy.",
    preview: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    accent: "#0ea5e9",
    style: "Header + Footer · Professional · Blue",
    pages: {
      login:    TideLogin,
      register: TideRegister,
      home:     TideHome,
      wallet:   TideWallet,
      orders:   TideOrders,
      services: TideServices,
      profile:  TideProfile,
    },
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Returns the full template object by id, or null if not found */
export const getTemplate = (id) =>
  TEMPLATES.find((t) => t.id === id) || null;

/** Returns a specific page component from a template, or null */
export const getTemplatePage = (templateId, page) => {
  const template = getTemplate(templateId);
  return template?.pages?.[page] || null;
};

/** All templates — used by the template picker in Settings */
export const getAllTemplates = () => TEMPLATES;

export default TEMPLATES;
