import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { Field, Input, SaveBtn } from "./SettingsShared";

export default function BrandingTab({ settings, onSaved }) {
  const [brandName,   setBrandName]   = useState(settings.brandName   || "");
  const [logo,        setLogo]        = useState(settings.logo        || "");
  const [themeColor,  setThemeColor]  = useState(settings.themeColor  || "#1e40af");
  const [loading,     setLoading]     = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/branding", { brandName, logo, themeColor });
      toast.success("Branding updated");
      onSaved({ brandName, logo, themeColor });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save branding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <div
        className="flex items-center gap-4 p-5 rounded-xl"
        style={{ backgroundColor: themeColor }}
      >
        {logo && (
          <img
            src={logo}
            alt="logo"
            className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1"
          />
        )}
        <span className="text-white font-bold text-lg">
          {brandName || "Your Panel Name"}
        </span>
      </div>

      <Field label="Brand Name">
        <Input value={brandName} onChange={setBrandName} placeholder="e.g. MyBoostPanel" />
      </Field>

      <Field label="Logo URL" hint="Direct link to your logo image (PNG/SVG recommended)">
        <Input value={logo} onChange={setLogo} placeholder="https://yoursite.com/logo.png" />
        {logo && (
          <img src={logo} alt="preview" className="h-10 mt-2 rounded object-contain border p-1" />
        )}
      </Field>

      <Field label="Theme Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-10 w-16 border-0 p-0 rounded cursor-pointer"
          />
          <span className="text-sm font-mono text-gray-600">{themeColor}</span>
        </div>
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}
