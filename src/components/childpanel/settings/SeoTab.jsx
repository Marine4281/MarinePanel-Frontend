import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import LogoGalleryPicker from "../../shared/LogoGalleryPicker";
import { resetSeoCache } from "../../../hooks/useSEO";

export default function SeoTab({ cpSeo, setCpSeo, cpOgImage, setCpOgImage, cpFavicon, setCpFavicon }) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      await API.patch("/seo/cp", cpSeo, { withCredentials: true });
      resetSeoCache();
      toast.success("SEO settings saved");
    } catch {
      toast.error("Failed to save SEO");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      label: "Page Title",
      key: "title",
      placeholder: "My SMM Panel – Fast & Cheap",
      hint: "Shown in browser tab & search results",
    },
    {
      label: "Meta Description",
      key: "description",
      area: true,
      placeholder: "Buy Instagram followers, TikTok views at the best prices...",
      hint: "150–160 chars ideal for search previews",
    },
    {
      label: "Keywords",
      key: "keywords",
      placeholder: "smm panel, cheap followers, instagram panel",
      hint: "Comma separated",
    },
    {
      label: "Canonical URL",
      key: "canonical",
      placeholder: "https://yourdomain.com/",
    },
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        Control how your child panel appears in Google search results and social media previews.
      </p>

      {fields.map(({ label, key, area, placeholder, hint }) => (
        <div key={key}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
          {area ? (
            <textarea
              rows={3}
              value={cpSeo[key] || ""}
              onChange={(e) => setCpSeo((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          ) : (
            <input
              type="text"
              value={cpSeo[key] || ""}
              onChange={(e) => setCpSeo((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
      ))}

      <LogoGalleryPicker
        currentLogo={cpOgImage}
        onSelect={async (url) => {
          setCpOgImage(url);
          await API.patch("/seo/cp", { ...cpSeo, ogImage: url }, { withCredentials: true }).catch(() => {});
          resetSeoCache();
        }}
        uploadEndpoint="/seo/cp/seo-image?type=ogImage"
        label="OG Image (social media preview, 1200×630)"
      />

      <LogoGalleryPicker
        currentLogo={cpFavicon}
        onSelect={async (url) => {
          setCpFavicon(url);
          await API.patch("/seo/cp", { ...cpSeo, favicon: url }, { withCredentials: true }).catch(() => {});
          resetSeoCache();
        }}
        uploadEndpoint="/seo/cp/seo-image?type=favicon"
        label="Favicon (browser tab icon)"
      />

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save SEO Settings"}
      </button>
    </div>
  );
}
