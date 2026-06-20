// src/components/admin/AdminLogoGallery.jsx  (NEW FILE)

import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiTrash2, FiUpload, FiImage } from "react-icons/fi";

export default function AdminLogoGallery() {
  const [gallery, setGallery]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel]         = useState("");
  const fileRef                   = useRef();

  const fetchGallery = async () => {
    try {
      const res = await API.get("/seo/gallery");
      setGallery(res.data.gallery || []);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    if (label) formData.append("label", label);

    try {
      setUploading(true);
      await API.post("/seo/admin/gallery", formData, {
        withCredentials: true,
      });
      toast.success("Logo added to gallery");
      setLabel("");
      fetchGallery();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this logo from gallery?")) return;
    try {
      await API.delete(`/seo/admin/gallery/${id}`, { withCredentials: true });
      toast.success("Deleted");
      setGallery((prev) => prev.filter((g) => g._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <FiImage className="text-orange-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Logo Gallery</h3>
        <span className="ml-auto text-xs text-gray-400">{gallery.length} logos</span>
      </div>

      <p className="text-sm text-gray-500">
        Logos uploaded here appear in the gallery picker for resellers and child panel owners.
      </p>

      {/* Upload */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Default Blue Logo"
            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
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
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          <FiUpload /> {uploading ? "Uploading..." : "Upload Logo"}
        </button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : gallery.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          No logos yet. Upload some for resellers to use.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {gallery.map((item) => (
            <div
              key={item._id}
              className="group relative border rounded-xl p-2 bg-gray-50 hover:border-orange-300 transition-all"
            >
              <img
                src={item.url}
                alt={item.label || "Logo"}
                className="h-16 w-full object-contain"
              />
              {item.label && (
                <p className="text-xs text-center text-gray-500 mt-1 truncate">{item.label}</p>
              )}
              <button
                onClick={() => handleDelete(item._id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity"
              >
                <FiTrash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
