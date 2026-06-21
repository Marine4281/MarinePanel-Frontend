// src/pages/LandingPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReseller }    from "../context/ResellerContext";
import { useChildPanel }  from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import PanelLandingPage  from "./landing/PanelLandingPage";

const LandingPage = () => {
  const navigate = useNavigate();
  const { reseller }    = useReseller();
  const { childPanel }  = useChildPanel();
  const { domainType }  = useCachedServices();

  // Platform domain — redirect to login (unchanged behaviour)
  useEffect(() => {
    if (domainType === "platform") {
      navigate("/login", { replace: true });
    }
  }, [domainType, navigate]);

  // ── Unknown domain ──────────────────────────────────────────────
  if (domainType === "unknown") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", background:"#0f172a", color:"#f1f5f9", textAlign:"center", padding:"2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Panel Not Found</h1>
        <p style={{ color:"#94a3b8", maxWidth:400 }}>
          This domain is not registered on MarinePanel. If you are the panel owner, please contact platform support.
        </p>
      </div>
    );
  }

  // ── Unreachable ─────────────────────────────────────────────────
  if (domainType === "unreachable") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", background:"#0f172a", color:"#f1f5f9", textAlign:"center", padding:"2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>⚠️</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Service Unavailable</h1>
        <p style={{ color:"#94a3b8", maxWidth:400, marginBottom:"1.5rem" }}>
          We could not reach the server. Please wait a moment and refresh.
        </p>
        <button onClick={() => window.location.reload()}
          style={{ padding:"0.6rem 1.5rem", background:"#f97316", color:"#fff",
            border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  // Prevent flash while redirect fires for platform domains
  if (domainType === "platform") return null;

  // ── Child Panel landing ─────────────────────────────────────────
  if (domainType === "childPanel" && childPanel) {
    return (
      <PanelLandingPage
        brandName={childPanel.brandName}
        themeColor={childPanel.themeColor}
        logo={childPanel.logo}
        landingTemplate={childPanel.landingTemplate || "default"}
      />
    );
  }

  // ── Reseller landing ────────────────────────────────────────────
  if (domainType === "reseller" && reseller) {
    return (
      <PanelLandingPage
        brandName={reseller.brandName}
        themeColor={reseller.themeColor}
        logo={reseller.logo}
        landingTemplate={reseller.landingTemplate || "default"}
      />
    );
  }

  // Loading / transitioning — render nothing
  return null;
};

export default LandingPage;
