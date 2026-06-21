// src/pages/reseller/ResellerBranding.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useReseller } from "../../context/ResellerContext";
import { resetSeoCache } from "../../hooks/useSEO";

import Sidebar      from "../../components/reseller/Sidebar";
import BrandingCard from "../../components/reseller/branding/BrandingCard";
import SeoCard      from "../../components/reseller/branding/SeoCard";
import LandingCard  from "../../components/reseller/branding/LandingCard";

export default function ResellerBranding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { reseller, setReseller } = useReseller();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  // ── Branding ─────────────────────────────────────────────────────
  const [brandName,              setBrandName]              = useState("");
  const [logo,                   setLogo]                   = useState("");
  const [themeColor,             setThemeColor]             = useState("#16a34a");
  const [supportWhatsapp,        setSupportWhatsapp]        = useState("");
  const [supportTelegram,        setSupportTelegram]        = useState("");
  const [supportWhatsappChannel, setSupportWhatsappChannel] = useState("");

  // ── Domain ───────────────────────────────────────────────────────
  const [domainType,    setDomainType]    = useState("subdomain");
  const [customDomain,  setCustomDomain]  = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);

  // ── SEO ──────────────────────────────────────────────────────────
  const [seoForm, setSeoForm] = useState({
    title: "", description: "", keywords: "",
    twitterCard: "summary_large_image", canonical: "",
  });
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [uploading,  setUploading]  = useState("");
  const [seoSaving,  setSeoSaving]  = useState(false);

  // ── Landing ──────────────────────────────────────────────────────
  const [landingTemplate, setLandingTemplate] = useState("default");

  // Keep CSS var in sync with themeColor picker
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  // ── Initial fetch ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [brandRes, seoRes] = await Promise.all([
          API.get("/branding/dashboard", { withCredentials: true }),
          API.get("/seo/reseller",       { withCredentials: true }).catch(() => null),
        ]);

        const data = brandRes.data;

        setReseller((prev) => ({
          ...prev,
          brandName:      data.brandName,
          logo:           data.logo,
          themeColor:     data.themeColor,
          domain:         data.domain,
          domainType:     data.domainType || "subdomain",
          platformDomain: data.platformDomain || "marinepanel.online",
          support: {
            whatsapp:        data.supportWhatsapp || "",
            telegram:        data.supportTelegram || "",
            whatsappChannel: data.supportWhatsappChannel || "",
          },
        }));

        setBrandName(data.brandName);
        setLogo(data.logo);
        setThemeColor(data.themeColor);
        setSupportWhatsapp(data.supportWhatsapp || "");
        setSupportTelegram(data.supportTelegram || "");
        setSupportWhatsappChannel(data.supportWhatsappChannel || "");
        setDomainType(data.domainType || "subdomain");
        setCustomDomain(data.domainType === "custom" ? data.domain : "");
        setLandingTemplate(data.landingTemplate || "default");

        document.documentElement.style.setProperty("--theme-color", data.themeColor);
        document.title = data.brandName;

        if (seoRes?.data) {
          const s = seoRes.data.seo || {};
          setSeoForm({
            title:       s.title       || "",
            description: s.description || "",
            keywords:    s.keywords    || "",
            twitterCard: s.twitterCard || "summary_large_image",
            canonical:   s.canonical   || "",
          });
          setOgImageUrl(s.ogImage  || "");
          setFaviconUrl(s.favicon  || "");
        }
      } catch (err) {
        console.error("Failed to load branding:", err);
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [setReseller]);

  // ── Handlers ─────────────────────────────────────────────────────
  const saveBranding = async () => {
    setSaving(true);
    try {
      await API.patch("/branding", {
        brandName, logo, themeColor,
        supportWhatsapp, supportTelegram, supportWhatsappChannel,
      }, { withCredentials: true });

      setReseller((prev) => ({
        ...prev,
        brandName, logo, themeColor,
        support: {
          whatsapp:        supportWhatsapp,
          telegram:        supportTelegram,
          whatsappChannel: supportWhatsappChannel,
        },
      }));

      document.documentElement.style.setProperty("--theme-color", themeColor);
      document.title = brandName;
      resetSeoCache();
      toast.success("Branding updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const switchDomain = async () => {
    setSwitchLoading(true);
    try {
      const res = await API.post(
        "/reseller/switch-domain",
        { domainType, customDomain },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setReseller((prev) => ({
        ...prev,
        domain:     res.data.domain,
        domainType: res.data.domainType,
      }));
      if (domainType === "custom") setCustomDomain(res.data.domain);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to switch domain");
    } finally {
      setSwitchLoading(false);
    }
  };

  const saveSeo = async () => {
    setSeoSaving(true);
    try {
      await API.patch("/seo/reseller", seoForm, { withCredentials: true });
      resetSeoCache();
      toast.success("SEO settings saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save SEO settings");
    } finally {
      setSeoSaving(false);
    }
  };

  const uploadSeoImage = async (file, type) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(type);
      const res = await API.post(`/seo/reseller/seo-image?type=${type}`, fd, { withCredentials: true });
      if (type === "ogImage") setOgImageUrl(res.data.url);
      if (type === "favicon") setFaviconUrl(res.data.url);
      resetSeoCache();
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading("");
    }
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading("logo");
      const res = await API.post("/seo/reseller/logo", fd, { withCredentials: true });
      setLogo(res.data.url);
      setReseller((prev) => ({ ...prev, logo: res.data.url }));
      resetSeoCache();
      toast.success("Logo uploaded");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploading("");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">Loading branding...</div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar brandName={reseller?.brandName} />
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <Sidebar
          brandName={reseller?.brandName}
          mobile
          close={() => setMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">
          <button onClick={() => setMenuOpen(true)} className="text-orange-500 text-2xl">
            <FiMenu />
          </button>
          <h1 className="text-lg font-bold text-orange-500">Branding & SEO</h1>
          <FiLogOut />
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-xl">
          <BrandingCard
            brandName={brandName}              setBrandName={setBrandName}
            logo={logo}                        setLogo={setLogo}
            themeColor={themeColor}            setThemeColor={setThemeColor}
            supportWhatsapp={supportWhatsapp}  setSupportWhatsapp={setSupportWhatsapp}
            supportTelegram={supportTelegram}  setSupportTelegram={setSupportTelegram}
            supportWhatsappChannel={supportWhatsappChannel}
            setSupportWhatsappChannel={setSupportWhatsappChannel}
            domainType={domainType}            setDomainType={setDomainType}
            customDomain={customDomain}        setCustomDomain={setCustomDomain}
            reseller={reseller}
            uploading={uploading}              uploadLogo={uploadLogo}
            switchLoading={switchLoading}      switchDomain={switchDomain}
            saving={saving}                    saveBranding={saveBranding}
          />

          <SeoCard
            seoForm={seoForm}           setSeoForm={setSeoForm}
            ogImageUrl={ogImageUrl}     faviconUrl={faviconUrl}
            uploading={uploading}       uploadSeoImage={uploadSeoImage}
            seoSaving={seoSaving}       saveSeo={saveSeo}
          />

          <LandingCard
            initialTemplate={landingTemplate}
            themeColor={themeColor}
          />
        </main>
      </div>
    </div>
  );
}
