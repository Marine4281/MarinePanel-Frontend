// src/components/shared/LogoGalleryPicker.jsx  (NEW FILE)

import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiUpload, FiCheck, FiImage } from "react-icons/fi";

/**
 * Props:
 *  currentLogo   — currently selected logo URL
 *  onSelect(url) — called when user picks a logo
 *  uploadEndpoint — e.g. "/seo/reseller/logo" or "/seo/cp/logo"
 *  label         — section title
 */
export default function LogoGalleryPicker({ currentLogo, onSelect, uploadEndpoint, label = "Logo" }) {
  const [gallery, setGallery]         = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [tab, setTab]                 = useState("gallery"); // "gallery" | "upload" | "url"
  const [urlInput, setUrlInput]       = useState(currentLogo || "");
  const fileRef                       = useRef();

  useEffect(() => {
    API.get("/seo/gallery")
      .then((r) => setGallery(r.data.gallery || []))
      .catch(() => toast.error("Failed to load logo gallery"))
      .finally(() => setLoadingGallery(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max file size is 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await API.post(uploadEndpoint, formData, {
        withCredentials: true,
      });
      onSelect(res.data.url);
      toast.success("Logo uploaded!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      {/* Current preview */}
      {currentLogo && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <img src={currentLogo} alt="Current logo" className="h-12 w-12 object-contain rounded" />
          <span className="text-xs text-gray-400 truncate flex-1">{currentLogo}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {["gallery", "upload", "url"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === t
                ? "bg-white text-orange-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "gallery" ? "🖼 Gallery" : t === "upload" ? "⬆ Upload" : "🔗 URL"}
          </button>
        ))}
      </div>

      {/* Gallery tab */}
      {tab === "gallery" && (
        <div>
          {loadingGallery ? (
            <p className="text-xs text-gray-400">Loading gallery...</p>
          ) : gallery.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              No logos in gallery yet. Admin can add logos from the admin panel.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {gallery.map((item) => (
                <button
                  key={item._id}
                  onClick={() => onSelect(item.url)}
                  title={item.label || item.url}
                  className={`relative p-1.5 rounded-lg border-2 transition-all hover:border-orange-400 ${
                    currentLogo === item.url
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <img src={item.url} alt={item.label} className="h-10 w-10 object-contain mx-auto" />
                  {currentLogo === item.url && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white rounded-full p-0.5">
                      <FiCheck size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload tab */}
      {tab === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all w-full justify-center"
          >
            <FiUpload />
            {uploading ? "Uploading..." : "Click to upload (PNG, JPG, SVG, WebP — max 2MB)"}
          </button>
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-300 outline-none"
          />
          <button
            onClick={() => {
              if (!urlInput.startsWith("http")) return toast.error("Enter a valid URL");
              onSelect(urlInput);
              toast.success("Logo URL applied");
            }}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
