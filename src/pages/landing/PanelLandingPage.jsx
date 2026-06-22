import DefaultLanding  from "./templates/DefaultLanding";
import DarkProLanding  from "./templates/DarkProLanding";
import MinimalLanding  from "./templates/MinimalLanding";
import VibrantLanding  from "./templates/VibrantLanding";
import SunriseLanding  from "./templates/SunriseLanding";
import BoldLanding     from "./templates/BoldLanding";
import NeonLanding     from "./templates/NeonLanding";

const TEMPLATES = {
  "default":  DefaultLanding,
  "dark-pro": DarkProLanding,
  "minimal":  MinimalLanding,
  "vibrant":  VibrantLanding,
  "sunrise":  SunriseLanding,
  "bold":     BoldLanding,
  "neon":     NeonLanding,
};

export default function PanelLandingPage({ brandName, themeColor, logo, landingTemplate }) {
  const Template = TEMPLATES[landingTemplate] || DefaultLanding;
  return <Template brandName={brandName} themeColor={themeColor} logo={logo} />;
}
