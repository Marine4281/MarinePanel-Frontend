// src/components/reseller/branding/BrandingCard.jsx
import { useRef } from "react";
import { FiImage } from "react-icons/fi";

export default function BrandingCard({
  brandName, setBrandName,
  logo, setLogo,
  themeColor, setThemeColor,
  supportWhatsapp, setSupportWhatsapp,
  supportTelegram, setSupportTelegram,
  supportWhatsappChannel, setSupportWhatsappChannel,
  domainType, setDomainType,
  customDomain, setCustomDomain,
  reseller,
  uploading, uploadLogo,
  switchLoading, switchDomain,
  saving, saveBranding,
}) {
  const logoRef = useRef();

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold">Brand Settings</h2>

      {/* Live preview */}
      <div
        className="flex items-center gap-4 p-4 rounded"
        style={{ backgroundColor: themeColor }}
      >
        {logo && (
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded" />
        )}
        <h2 className="text-white text-lg font-bold">{brandName || "Reseller"}</h2>
      </div>

      {/* Brand Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Brand Name</label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Logo */}
      <div>
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
        <p className="text-xs text-gray-400 mt-1">Or paste a URL:</p>
        <input
          type="text"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="https://..."
          className="w-full border rounded p-2 mt-1 text-sm"
        />
      </div>

      {/* Theme Color */}
      <div>
        <label className="block text-sm font-medium mb-1">Theme Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-10 w-16 p-0 border-0 rounded cursor-pointer"
          />
          <span className="text-sm font-mono text-gray-500">{themeColor}</span>
        </div>
      </div>

      {/* Domain */}
      <div className="border-t pt-6">
        <h3 className="text-md font-semibold mb-4">Domain Settings</h3>
        <div className="grid gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="subdomain"
              checked={domainType === "subdomain"}
              onChange={() => setDomainType("subdomain")}
            />
            <span>Use subdomain</span>
          </label>
          {domainType === "subdomain" && (
            <p className="text-sm text-gray-500 -mt-2 ml-5">
              <strong>
                {reseller?.brandName?.toLowerCase()?.replace(/\s+/g, "")}.
                {reseller?.platformDomain || "marinepanel.online"}
              </strong>
            </p>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={domainType === "custom"}
              onChange={() => setDomainType("custom")}
            />
            <span>Use custom domain</span>
          </label>
          {domainType === "custom" && (
            <input
              type="text"
              placeholder="example.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="border p-3 rounded-lg w-full -mt-2"
            />
          )}
        </div>

        <button
          onClick={switchDomain}
          disabled={switchLoading}
          className="mt-4 px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
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
        <p className="text-xs text-gray-400 mt-3">These links will be shown ONLY to your users.</p>
      </div>

      <button
        onClick={saveBranding}
        disabled={saving}
        className="w-full py-2.5 rounded text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
      >
        {saving ? "Saving..." : "Save Branding"}
      </button>
    </div>
  );
        }
