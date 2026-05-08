// src/pages/Login.jsx
// Pure router — picks the right login component based on domain type.
// No UI logic lives here.

import { useCachedServices } from "../context/CachedServicesContext";
import ResellerLogin    from "./login/ResellerLogin";
import ChildPanelLogin  from "./login/ChildPanelLogin";
import MainLogin        from "./login/MainLogin";

export default function Login() {
  const { domainType } = useCachedServices();

  // While domainType is still resolving, render nothing (avoids flash)
  if (!domainType) return null;

  if (domainType === "reseller")    return <ResellerLogin />;
  if (domainType === "childPanel")  return <ChildPanelLogin />;
  return <MainLogin />;
}
