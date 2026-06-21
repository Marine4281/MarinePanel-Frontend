// src/components/reseller/branding/SeoCard.jsx
import { useRef } from "react";
import { FiGlobe, FiImage } from "react-icons/fi";

export default function SeoCard({
  seoForm, setSeoForm,
  ogImageUrl, faviconUrl,
  uploading, uploadSeoImage,
  seoSaving, saveSeo,
}) {
  const ogRef  = useRef();
  const favRef = useRef();

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiGlobe className="text-orange-500" />
          SEO Settings
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Controls how your panel appears in Google and when shared on social media.
        </p>
      </div>

      {/* OG Image + Favicon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* OG Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OG Image <span className="text-gray-400 font-normal">(1200×630)</span>
          </label>
          {ogImageUrl && (
            <img src={ogImageUrl} alt="OG" className="h-14 mb-2 rounded object-contain bg-gray-100 p-1" />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
          {faviconUrl && (
            <img src={faviconUrl} alt="Favicon" className="h-14 mb-2 rounded object-contain bg-gray-100 p-1" />
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

      {/* Text fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
          <input
            type="text"
            value={seoForm.canonical}
            onChange={(e) => setSeoForm((p) => ({ ...p, canonical: e.target.value }))}
            placeholder="https://yourdomain.com/"
            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Card Type</label>
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
        className="w-full py-2.5 rounded text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition"
      >
        <FiGlobe />
        {seoSaving ? "Saving..." : "Save SEO Settings"}
      </button>
    </div>
  );
          }
