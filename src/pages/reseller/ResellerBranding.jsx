// src/pages/reseller/ResellerBranding.jsx
import { useEffect, useRef, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiGlobe, FiImage } from "react-icons/fi";
import { useReseller } from "../../context/ResellerContext";
import { resetSeoCache } from "../../hooks/useSEO";

import Sidebar from "../../components/reseller/Sidebar";

export default function ResellerBranding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { reseller, setReseller } = useReseller();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // ── Branding fields ──────────────────────────────────────────────
  const [brandName, setBrandName]   = useState("");
  const [logo, setLogo]             = useState("");
  const [themeColor, setThemeColor] = useState("#16a34a");

  // ── Support fields ───────────────────────────────────────────────
  const [supportWhatsapp, setSupportWhatsapp]               = useState("");
  const [supportTelegram, setSupportTelegram]               = useState("");
  const [supportWhatsappChannel, setSupportWhatsappChannel] = useState("");

  // ── Domain fields ────────────────────────────────────────────────
  const [domainType, setDomainType]         = useState("subdomain");
  const [customDomain, setCustomDomain]     = useState("");
  const [switchLoading, setSwitchLoading]   = useState(false);

  // ── SEO fields ───────────────────────────────────────────────────
  const [seoForm, setSeoForm] = useState({
    title:       "",
    description: "",
    keywords:    "",
    twitterCard: "summary_large_image",
    canonical:   "",
  });
  const [ogImageUrl, setOgImageUrl]  = useState("");
  const [faviconUrl, setFaviconUrl]  = useState("");
  const [uploading, setUploading]    = useState("");
  const [seoSaving, setSeoSaving]    = useState(false);
  const ogRef  = useRef();
  const favRef = useRef();

  // ── Theme color CSS var ─────────────────────────────────────────
  useEffect(() => {
    if (reseller?.themeColor) {
      document.documentElement.style.setProperty("--theme-color", reseller.themeColor);
    }
  }, [reseller]);

  // ── Fetch branding + SEO ────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [brandRes, seoRes] = await Promise.all([
          API.get("/branding/dashboard",  { withCredentials: true }),
          API.get("/seo/reseller",        { withCredentials: true }).catch(() => null),
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

        document.documentElement.style.setProperty("--theme-color", data.themeColor);
        document.title = data.brandName;

        // SEO
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

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  // ── Save branding ────────────────────────────────────────────────
  const saveBranding = async () => {
    try {
      setSaving(true);
      await API.patch("/branding", {
        brandName,
        logo,
        themeColor,
        supportWhatsapp,
        supportTelegram,
        supportWhatsappChannel,
      }, { withCredentials: true });

      setReseller((prev) => ({
        ...prev,
        brandName,
        logo,
        themeColor,
        support: {
          whatsapp:        supportWhatsapp || "",
          telegram:        supportTelegram || "",
          whatsappChannel: supportWhatsappChannel || "",
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

  // ── Switch domain ────────────────────────────────────────────────
  const switchDomain = async () => {
    try {
      setSwitchLoading(true);
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
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to switch domain");
    } finally {
      setSwitchLoading(false);
    }
  };

  // ── Save SEO ─────────────────────────────────────────────────────
  const saveSeo = async () => {
    try {
      setSeoSaving(true);
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

  // ── Upload SEO image (og/favicon) ────────────────────────────────
  const uploadSeoImage = async (file, type) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(type);
      const res = await API.post(`/seo/reseller/seo-image?type=${type}`, fd, {
        headers:         { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
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

  // ── Upload logo via Cloudinary ───────────────────────────────────
  const uploadLogo = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading("logo");
      const res = await API.post("/seo/reseller/logo", fd, {
        headers:         { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
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

  const logoRef = useRef();

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading branding...
      </div>
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

          {/* ═══════════════════════════════════════════════
              BRANDING CARD
          ════════════════════════════════════════════════ */}
          <div className="bg-white shadow rounded-lg p-6">

            <h2 className="text-lg font-semibold mb-4">Brand Settings</h2>

            {/* Preview */}
            <div
              className="flex items-center gap-4 mb-6 p-4 rounded"
              style={{ backgroundColor: themeColor }}
            >
              {logo && (
                <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded" />
              )}
              <h2 className="text-white text-lg font-bold">
                {brandName || "Reseller"}
              </h2>
            </div>

            {/* Brand Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            {/* Logo */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Logo</label>
              <div className="flex items-center gap-3">
                {logo && (
                  <img src={logo} alt="Logo Preview" className="h-12 rounded object-contain bg-gray-100 p-1" />
                )}
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadLogo(e.target.files?.[0])}
                />
                <button
                  onClick={() => logoRef.current?.click()}
                  disabled={uploading === "logo"}
                  className="flex items-center gap-2 text-sm px-3 py-2 border rounded-lg hover:border-orange-400 hover:text-orange-500 transition disabled:opacity-50"
                >
                  <FiImage />
                  {uploading === "logo" ? "Uploading..." : "Upload Logo"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Or paste a URL:
              </p>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full border rounded p-2 mt-1 text-sm"
              />
            </div>

            {/* Theme Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Theme Color</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-10 w-16 p-0 border-0 rounded"
              />
            </div>

            {/* Domain Settings */}
            <div className="mb-6 border-t pt-6">
              <h3 className="text-md font-semibold mb-4">Domain Settings</h3>

              <div className="grid gap-4">
                <div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      value="subdomain"
                      checked={domainType === "subdomain"}
                      onChange={() => setDomainType("subdomain")}
                      className="form-radio"
                    />
                    <span>Use subdomain</span>
                  </label>
                  {domainType === "subdomain" && (
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>
                        {reseller?.brandName?.toLowerCase()?.replace(/\s+/g, "")}.
                        {reseller?.platformDomain || "marinepanel.online"}
                      </strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      value="custom"
                      checked={domainType === "custom"}
                      onChange={() => setDomainType("custom")}
                      className="form-radio"
                    />
                    <span>Use custom domain</span>
                  </label>
                  {domainType === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter your custom domain (example.com)"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="border p-3 rounded-lg w-full mt-2"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={switchDomain}
                disabled={switchLoading}
                className={`mt-3 px-4 py-2 rounded text-white ${
                  switchLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {switchLoading ? "Switching..." : "Switch Domain"}
              </button>
            </div>

            {/* Support */}
            <div className="border-t pt-6">
              <h3 className="text-md font-semibold mb-4">Support Configuration</h3>

              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="WhatsApp (number or wa.me link)"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="border p-3 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Telegram (@username or link)"
                  value={supportTelegram}
                  onChange={(e) => setSupportTelegram(e.target.value)}
                  className="border p-3 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="WhatsApp Channel / Group link"
                  value={supportWhatsappChannel}
                  onChange={(e) => setSupportWhatsappChannel(e.target.value)}
                  className="border p-3 rounded-lg"
                />
              </div>

              <p className="text-xs text-gray-400 mt-3">
                These links will be shown ONLY to your users.
              </p>
            </div>

            <button
              onClick={saveBranding}
              disabled={saving}
              className={`mt-6 px-4 py-2 rounded text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {saving ? "Saving..." : "Save Branding"}
            </button>

          </div>

          {/* ═══════════════════════════════════════════════
              SEO CARD
          ════════════════════════════════════════════════ */}
          <div className="bg-white shadow rounded-lg p-6">

            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <FiGlobe className="text-orange-500" />
              SEO Settings
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Controls how your panel appears in Google and when shared on social media.
            </p>

            {/* SEO Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* OG Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image <span className="text-gray-400 font-normal">(1200×630)</span>
                </label>
                {ogImageUrl && (
                  <img
                    src={ogImageUrl}
                    alt="OG"
                    className="h-14 mb-2 rounded object-contain bg-gray-100 p-1"
                  />
                )}
                <input
                  ref={ogRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadSeoImage(e.target.files?.[0], "ogImage")}
                />
                <button
                  onClick={() => ogRef.current?.click()}
                  disabled={uploading === "ogImage"}
                  className="flex items-center gap-2 text-sm px-3 py-2 border rounded-lg hover:border-orange-400 hover:text-orange-500 transition disabled:opacity-50"
                >
                  <FiImage />
                  {uploading === "ogImage" ? "Uploading..." : "Upload OG Image"}
                </button>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                {faviconUrl && (
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="h-14 mb-2 rounded object-contain bg-gray-100 p-1"
                  />
                )}
                <input
                  ref={favRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadSeoImage(e.target.files?.[0], "favicon")}
                />
                <button
                  onClick={() => favRef.current?.click()}
                  disabled={uploading === "favicon"}
                  className="flex items-center gap-2 text-sm px-3 py-2 border rounded-lg hover:border-orange-400 hover:text-orange-500 transition disabled:opacity-50"
                >
                  <FiImage />
                  {uploading === "favicon" ? "Uploading..." : "Upload Favicon"}
                </button>
              </div>

            </div>

            {/* SEO Text Fields */}
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={seoForm.title}
                  onChange={(e) => setSeoForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="My SMM Panel – Fast & Cheap"
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
                <p className="text-xs text-gray-400 mt-1">Shown in browser tab & search results</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={seoForm.description}
                  onChange={(e) => setSeoForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Buy Instagram followers, TikTok views at the best prices..."
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">150–160 chars ideal for search previews</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  value={seoForm.keywords}
                  onChange={(e) => setSeoForm((p) => ({ ...p, keywords: e.target.value }))}
                  placeholder="smm panel, cheap followers, instagram panel"
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={seoForm.canonical}
                  onChange={(e) => setSeoForm((p) => ({ ...p, canonical: e.target.value }))}
                  placeholder="https://yourdomain.com/"
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter Card Type
                </label>
                <select
                  value={seoForm.twitterCard}
                  onChange={(e) => setSeoForm((p) => ({ ...p, twitterCard: e.target.value }))}
                  className="border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="summary_large_image">summary_large_image (recommended)</option>
                  <option value="summary">summary</option>
                </select>
              </div>

            </div>

            <button
              onClick={saveSeo}
              disabled={seoSaving}
              className={`mt-6 px-4 py-2 rounded text-white flex items-center gap-2 ${
                seoSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              <FiGlobe />
              {seoSaving ? "Saving..." : "Save SEO Settings"}
            </button>

          </div>

        </main>
      </div>
    </div>
  );
            }
