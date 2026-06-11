// src/components/admin/AdminSeoSettings.jsx  (NEW FILE)

import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiGlobe, FiImage, FiSave } from "react-icons/fi";
import AdminLogoGallery from "./AdminLogoGallery";
import { resetSeoCache } from "../../hooks/useSEO";

export default function AdminSeoSettings() {
  const [loading, setSaving]   = useState(false);
  const [form, setForm]        = useState({
    title:       "",
    description: "",
    keywords:    "",
    twitterCard: "summary_large_image",
    canonical:   "",
    schemaOrg:   { whatsapp: "", telegram: "", instagram: "" },
  });
  const [ogImageUrl,  setOgImageUrl]  = useState("");
  const [faviconUrl,  setFaviconUrl]  = useState("");
  const [mainLogoUrl, setMainLogoUrl] = useState("");
  const ogRef      = useRef();
  const favRef     = useRef();
  const logoRef    = useRef();
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    API.get("/seo/admin", { withCredentials: true }).then((r) => {
      const s = r.data.seo || {};
      setForm({
        title:       s.title       || "",
        description: s.description || "",
        keywords:    s.keywords    || "",
        twitterCard: s.twitterCard || "summary_large_image",
        canonical:   s.canonical   || "",
        schemaOrg:   s.schemaOrg   || { whatsapp: "", telegram: "", instagram: "" },
      });
      setOgImageUrl(s.ogImage   || "");
      setFaviconUrl(s.favicon   || "");
      setMainLogoUrl(r.data.mainLogo || "");
    }).catch(() => toast.error("Failed to load SEO settings"));
  }, []);

  const uploadImage = async (file, type) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(type);
      const endpoint = type === "logo"
        ? "/seo/admin/logo"
        : `/seo/admin/seo-image?type=${type}`;
      const res = await API.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (type === "logo")    setMainLogoUrl(res.data.url);
      if (type === "ogImage") setOgImageUrl(res.data.url);
      if (type === "favicon") setFaviconUrl(res.data.url);
      toast.success("Image uploaded");
      resetSeoCache();
    } catch { toast.error("Upload failed"); }
    finally { setUploading(""); }
  };

  const save = async () => {
    try {
      setSaving(true);
      await API.patch("/seo/admin", form, { withCredentials: true });
      toast.success("SEO settings saved");
      resetSeoCache();
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const Field = ({ label, name, type = "text", hint }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={form[name] || ""}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
          rows={3}
          className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[name] || ""}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
          className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const ImageUploader = ({ label, url, inputRef, type }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {url && <img src={url} alt={label} className="h-14 mb-2 rounded object-contain bg-gray-100 p-1" />}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => uploadImage(e.target.files?.[0], type)} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading === type}
        className="flex items-center gap-2 text-sm px-3 py-2 border rounded-lg hover:border-orange-400 hover:text-orange-500 transition-all disabled:opacity-50"
      >
        <FiImage /> {uploading === type ? "Uploading..." : `Upload ${label}`}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Main brand note */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        <strong>Brand name is hardcoded as "MarinePanel"</strong> — only SEO metadata and images are editable here.
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiImage className="text-orange-500" /> Brand Images
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ImageUploader label="Main Logo"      url={mainLogoUrl} inputRef={logoRef} type="logo"    />
          <ImageUploader label="OG Image (1200×630)" url={ogImageUrl}  inputRef={ogRef}   type="ogImage" />
          <ImageUploader label="Favicon"        url={faviconUrl}  inputRef={favRef}  type="favicon"  />
        </div>
      </div>

      {/* SEO Fields */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiGlobe className="text-orange-500" /> SEO Meta Tags
        </h3>
        <Field label="Page Title"    name="title"       hint="Shown in browser tab & search results" />
        <Field label="Description"   name="description" type="textarea" hint="Shown in search engine previews (150–160 chars ideal)" />
        <Field label="Keywords"      name="keywords"    hint="Comma separated keywords" />
        <Field label="Canonical URL" name="canonical"   hint="e.g. https://marinepanel.online/" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Card Type</label>
          <select
            value={form.twitterCard}
            onChange={(e) => setForm((p) => ({ ...p, twitterCard: e.target.value }))}
            className="border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="summary_large_image">summary_large_image (recommended)</option>
            <option value="summary">summary</option>
          </select>
        </div>

        {/* Schema.org social links */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Schema.org Social Links (for Google rich results)</p>
          <div className="grid gap-3">
            {["whatsapp", "telegram", "instagram"].map((k) => (
              <div key={k}>
                <label className="text-xs text-gray-500 mb-1 block capitalize">{k} URL</label>
                <input
                  type="text"
                  value={form.schemaOrg?.[k] || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      schemaOrg: { ...p.schemaOrg, [k]: e.target.value },
                    }))
                  }
                  placeholder={`https://${k}.com/...`}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          <FiSave /> {loading ? "Saving..." : "Save SEO Settings"}
        </button>
      </div>

      {/* Logo Gallery Manager */}
      <AdminLogoGallery />
    </div>
  );
}
