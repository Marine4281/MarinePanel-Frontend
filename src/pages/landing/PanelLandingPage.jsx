// src/pages/landing/PanelLandingPage.jsx
//
// Renders the correct landing template for child panel and reseller domains.
// Called by LandingPage.jsx when domainType === "childPanel" || "reseller".

import DefaultLanding  from "./templates/DefaultLanding";
import DarkProLanding  from "./templates/DarkProLanding";
import MinimalLanding  from "./templates/MinimalLanding";
import VibrantLanding  from "./templates/VibrantLanding";

const TEMPLATES = {
  "default":  DefaultLanding,
  "dark-pro": DarkProLanding,
  "minimal":  MinimalLanding,
  "vibrant":  VibrantLanding,
};

export default function PanelLandingPage({ brandName, themeColor, logo, landingTemplate }) {
  const Template = TEMPLATES[landingTemplate] || DefaultLanding;
  return <Template brandName={brandName} themeColor={themeColor} logo={logo} />;
}
