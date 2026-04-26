// src/pages/reseller/ResellerBranding.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useReseller } from "../../context/ResellerContext";

import Sidebar from "../../components/reseller/Sidebar";

export default function ResellerBranding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { reseller, setReseller } = useReseller();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const [brandName, setBrandName]   = useState("");
  const [logo, setLogo]             = useState("");
  const [themeColor, setThemeColor] = useState("#16a34a");

  const [supportWhatsapp, setSupportWhatsapp]               = useState("");
  const [supportTelegram, setSupportTelegram]               = useState("");
  const [supportWhatsappChannel, setSupportWhatsappChannel] = useState("");

  const [domainType, setDomainType]     = useState("subdomain");
  const [customDomain, setCustomDomain] = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);

  useEffect(() => {
    if (reseller?.themeColor) {
      document.documentElement.style.setProperty("--theme-color", reseller.themeColor);
    }
  }, [reseller]);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res  = await API.get("/branding/dashboard", { withCredentials: true });
        const data = res.data;

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
      } catch (err) {
        console.error("Failed to load branding:", err);
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [setReseller]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

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
      toast.success("Branding updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-lg font-bold text-orange-500">Branding</h1>
          <FiLogOut />
        </header>

        <main className="flex-1 p-6">
          <div className="bg-white shadow rounded-lg p-6 max-w-xl">

            {/* Preview */}
            <div
              className="flex items-center gap-4 mb-6 p-4 rounded"
              style={{ backgroundColor: themeColor }}
            >
              {logo && (
                <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
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
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full border rounded p-2"
              />
              {logo && (
                <img src={logo} alt="Logo Preview" className="h-12 mt-2" />
              )}
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Theme Color</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-10 w-16 p-0 border-0 rounded"
              />
            </div>

            {/* Domain */}
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
            <div className="mt-8 border-t pt-6">
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
        </main>
      </div>
    </div>
  );
                                                 }
