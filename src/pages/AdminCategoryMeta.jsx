// src/pages/AdminCategoryMeta.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const AdminCategoryMeta = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("All");

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      setLoading(true);
      const res = await API.get("/category-meta");
      // Sort by platform then sortOrder for initial display
      const sorted = (res.data || []).sort((a, b) => {
        if (a.platform !== b.platform) return a.platform.localeCompare(b.platform);
        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      });
      setCategories(sorted);
    } catch {
      toast.error("Failed to load category meta");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (index, field, value) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.post("/category-meta", categories);
      toast.success("Category settings saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Move a row up or down within its platform group
  const moveRow = (index, direction) => {
    setCategories((prev) => {
      const updated = [...prev];
      const platform = updated[index].platform;

      // Find all indices for this platform
      const platformIndices = updated
        .map((c, i) => (c.platform === platform ? i : null))
        .filter((i) => i !== null);

      const posInGroup = platformIndices.indexOf(index);
      const swapPos = posInGroup + direction;

      if (swapPos < 0 || swapPos >= platformIndices.length) return updated;

      const swapIndex = platformIndices[swapPos];

      // Swap sortOrder values
      const tempOrder = updated[index].sortOrder;
      updated[index] = { ...updated[index], sortOrder: updated[swapIndex].sortOrder };
      updated[swapIndex] = { ...updated[swapIndex], sortOrder: tempOrder };

      // Re-sort the full array
      return [...updated].sort((a, b) => {
        if (a.platform !== b.platform) return a.platform.localeCompare(b.platform);
        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      });
    });
  };

  const platforms = ["All", ...new Set(categories.map((c) => c.platform))];

  const filtered = categories.filter((c) => {
    const matchPlatform = filterPlatform === "All" || c.platform === filterPlatform;
    const matchSearch = c.category.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Category Settings</h2>
            <p className="text-gray-500 text-sm mt-1">
              Control category sort order and featured star badges shown on the home page.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition"
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  filterPlatform === p
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-500 text-white text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-center">Sort Order</th>
                  <th className="px-4 py-3 text-center">⭐ Featured Star</th>
                  <th className="px-4 py-3 text-center">Move</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      No categories found
                    </td>
                  </tr>
                )}
                {filtered.map((cat, i) => {
                  // Find real index in the full categories array
                  const realIndex = categories.findIndex(
                    (c) => c.platform === cat.platform && c.category === cat.category
                  );
                  return (
                    <tr
                      key={`${cat.platform}::${cat.category}`}
                      className={`border-b last:border-none ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-orange-50/30 transition`}
                    >
                      {/* Platform */}
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {cat.platform}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-gray-800 flex items-center gap-2">
                        {cat.isFeatured && (
                          <span
                            className="text-yellow-400 animate-pulse"
                            style={{ filter: "drop-shadow(0 0 4px rgba(250,204,21,0.9))" }}
                          >
                            ⭐
                          </span>
                        )}
                        {cat.category}
                      </td>

                      {/* Sort Order — manual number input */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={cat.sortOrder ?? 999}
                          onChange={(e) =>
                            updateField(realIndex, "sortOrder", Number(e.target.value))
                          }
                          className="w-20 border rounded-lg px-2 py-1 text-center text-sm outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            updateField(realIndex, "isFeatured", !cat.isFeatured)
                          }
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                            cat.isFeatured
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {cat.isFeatured ? "⭐ Featured" : "☆ Not Featured"}
                        </button>
                      </td>

                      {/* Move Up / Down */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => moveRow(realIndex, -1)}
                            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition"
                            title="Move up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveRow(realIndex, 1)}
                            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition"
                            title="Move down"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          💡 Lower sort order number = appears first. Use the ▲▼ buttons for quick reordering, or type a number directly. Click <strong>Save Changes</strong> when done.
        </p>
      </div>
    </div>
  );
};

export default AdminCategoryMeta;
