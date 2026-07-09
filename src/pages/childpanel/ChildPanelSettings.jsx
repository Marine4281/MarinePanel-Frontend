// src/pages/childpanel/ChildPanelSettings.jsx

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import BrandingTab  from "../../components/childpanel/settings/BrandingTab";
import SupportTab   from "../../components/childpanel/settings/SupportTab";
import DomainTab    from "../../components/childpanel/settings/DomainTab";
import FeesTab      from "../../components/childpanel/settings/FeesTab";
import GatewayTab   from "../../components/childpanel/settings/GatewayTab";
import TemplatesTab from "../../components/childpanel/settings/TemplatesTab";
import SeoTab       from "../../components/childpanel/settings/SeoTab";
import LandingTab   from "../../components/childpanel/settings/LandingTab";
import BillingTab   from "../../components/childpanel/settings/BillingTab";
import CurrencyTab from "../../components/childpanel/settings/CurrencyTab";

import {
  FiGlobe, FiDollarSign, FiCreditCard,
  FiMessageCircle, FiImage, FiLayout, FiSearch, FiCalendar, FaCoins,
} from "react-icons/fi";

const TABS = [
  { key: "branding",  label: "Branding",    icon: <FiImage size={14} /> },
  { key: "support",   label: "Support",     icon: <FiMessageCircle size={14} /> },
  { key: "domain",    label: "Domain",      icon: <FiGlobe size={14} /> },
  { key: "fees",      label: "Fees",        icon: <FiDollarSign size={14} /> },
  { key: "billing",   label: "Billing",     icon: <FiCalendar size={14} /> },
  { key: "gateway",   label: "Gateway",     icon: <FiCreditCard size={14} /> },
  { key: "currency", label: "Currency", icon: <FaCoins /> },
  { key: "templates", label: "Templates",   icon: <FiLayout size={14} /> },
  { key: "landing",   label: "Landing Page",icon: <FiGlobe size={14} /> },
  { key: "seo",       label: "SEO",         icon: <FiSearch size={14} /> },
];

const SEO_DEFAULTS = {
  title: "", description: "", keywords: "",
  twitterCard: "summary_large_image", canonical: "",
};

export default function ChildPanelSettings() {
  const { updateUser } = useAuth();
  const { refetch: refetchBranding } = useChildPanel();
  const [activeTab, setActiveTab] = useState("branding");
  const [settings,  setSettings]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  // SEO state lives here so it survives tab switches
  const [cpSeo,     setCpSeo]     = useState(SEO_DEFAULTS);
  const [cpOgImage, setCpOgImage] = useState("");
  const [cpFavicon, setCpFavicon] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, seoRes] = await Promise.all([
          API.get("/cp/settings"),
          API.get("/seo/cp"),
        ]);
        setSettings(settingsRes.data);

        const s = seoRes.data?.seo || {};
        setCpSeo({
          title:       s.title       || "",
          description: s.description || "",
          keywords:    s.keywords    || "",
          twitterCard: s.twitterCard || "summary_large_image",
          canonical:   s.canonical   || "",
        });
        setCpOgImage(s.ogImage  || "");
        setCpFavicon(s.favicon  || "");
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaved = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (updateUser && (patch.brandName || patch.themeColor || patch.logo)) {
      updateUser({
        childPanelBrandName:  patch.brandName,
        childPanelThemeColor: patch.themeColor,
        childPanelLogo:       patch.logo,
      });
    }
  };

  if (loading) {
    return (
      <ChildPanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ChildPanelLayout>
    );
  }

  return (
    <ChildPanelLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your panel branding, domain, fees, gateway, and templates
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === t.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {activeTab === "branding"  && <BrandingTab  settings={settings} onSaved={handleSaved} />}
          {activeTab === "support"   && <SupportTab   settings={settings} onSaved={handleSaved} />}
          {activeTab === "domain"    && <DomainTab    settings={settings} onSaved={handleSaved} />}
          {activeTab === "fees"      && <FeesTab      settings={settings} onSaved={handleSaved} />}
          {activeTab === "billing"   && <BillingTab   settings={settings} onSaved={handleSaved} />}
          {activeTab === "gateway"   && <GatewayTab   settings={settings} onSaved={handleSaved} />}
          {activeTab === "currency" && <CurrencyTab />}
          {activeTab === "templates" && <TemplatesTab settings={settings} onSaved={handleSaved} />}
          {activeTab === "landing"   && (
            <LandingTab
              settings={settings}
              onSaved={handleSaved}
              refetch={refetchBranding}
            />
          )}
          {activeTab === "seo" && (
            <SeoTab
              cpSeo={cpSeo}         setCpSeo={setCpSeo}
              cpOgImage={cpOgImage} setCpOgImage={setCpOgImage}
              cpFavicon={cpFavicon} setCpFavicon={setCpFavicon}
            />
          )}
        </div>
      </div>
    </ChildPanelLayout>
  );
}
