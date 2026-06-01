// src/pages/AdminCategoryMeta.jsx
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import {
  FiSave, FiRefreshCw, FiChevronDown, FiChevronRight,
  FiStar, FiGrid, FiLoader, FiTag,
} from "react-icons/fi";

// ── Colour definitions ────────────────────────────────────────────────────────
const COLOURS = {
  orange: {
    badge:  "bg-orange-100 text-orange-600 border border-orange-300",
    star:   "text-orange-500",
    glow:   "drop-shadow(0 0 5px rgba(249,115,22,0.8))",
    dot:    "bg-orange-500",
    label:  "Orange",
    ring:   "ring-2 ring-orange-400",
    swatch: "from-orange-400 to-orange-600",
  },
  blue: {
    badge:  "bg-blue-100 text-blue-600 border border-blue-300",
    star:   "text-blue-500",
    glow:   "drop-shadow(0 0 5px rgba(59,130,246,0.8))",
    dot:    "bg-blue-500",
    label:  "Blue",
    ring:   "ring-2 ring-blue-400",
    swatch: "from-blue-400 to-blue-600",
  },
};

// ── Centred Colour Picker Modal ───────────────────────────────────────────────
function ColourPickerModal({ current, categoryName, onPick, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <FiTag size={16} className="text-orange-500" />
          <h3 className="font-bold text-gray-800 text-base">Feature Colour</h3>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Choose a highlight colour for{" "}
          <strong className="text-gray-600">{categoryName}</strong>
        </p>

        <div className="flex flex-col gap-3">
          {Object.entries(COLOURS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => onPick(key)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition
                ${current === key
                  ? `${c.ring} bg-gray-50 border-transparent`
                  : "border-gray-200 hover:bg-gray-50"
                }`}
            >
              <span
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.swatch} flex-shrink-0 shadow-md`}
              />
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                <p className="text-xs text-gray-400">
                  {key === "orange" ? "Admin panel style" : "Alternate brand colour"}
                </p>
              </div>
              {current === key && (
                <span className="text-green-500 font-bold text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Services Drawer ───────────────────────────────────────────────────────────
function ServicesDrawer({ category }) {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    API.get(`/category-meta/${encodeURIComponent(category)}/services`)
      .then((r) => { if (!cancelled) setServices(r.data || []); })
      .catch(() => toast.error("Failed to load services"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

  if (loading)
    return (
      <div className="flex items-center gap-2 py-4 px-6 text-sm text-gray-400">
        <FiLoader className="animate-spin" /> Loading services…
      </div>
    );

  if (services.length === 0)
    return (
      <p className="py-4 px-6 text-sm text-gray-400 italic">No services in this category.</p>
    );

  return (
    <div className="divide-y divide-gray-100">
      {services.map((s) => (
        <div
          key={s._id}
          className="flex items-center justify-between px-6 py-2.5 text-sm hover:bg-orange-50/40 transition"
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                s.status ? "bg-green-400" : "bg-gray-300"
              }`}
            />
            <span className="font-medium text-gray-800">{s.name}</span>
            <span className="text-gray-400 text-xs">#{s.serviceId}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span>${Number(s.rate || 0).toFixed(4)} / 1k</span>
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                s.status
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {s.status ? "Active" : "Hidden"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────
function CategoryRow({
  cat, index, total,
  onMove, onToggleFeatured, onColorChange,
  expanded, onToggleExpand,
  isDragging, onOpenColourPicker,
}) {
  const c = COLOURS[cat.featuredColor] || COLOURS.orange;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden
        ${isDragging
          ? "shadow-lg scale-[1.01] border-orange-300 bg-orange-50"
          : "border-gray-200 bg-white hover:border-gray-300"
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Drag handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none text-xl leading-none flex-shrink-0"
          title="Drag to reorder"
        >
          ⠿
        </div>

        {/* Expand + name */}
        <button
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          {expanded
            ? <FiChevronDown size={16} className="text-orange-500 flex-shrink-0" />
            : <FiChevronRight size={16} className="text-gray-400 flex-shrink-0" />
          }
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{cat.category}</p>
            <p className="text-xs text-gray-400 truncate">{cat.platform}</p>
          </div>
        </button>

        {/* Feature button */}
        <button
          onClick={() => {
            if (!cat.isFeatured) {
              onOpenColourPicker();
            } else {
              onToggleFeatured();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0
            ${cat.isFeatured
              ? `${c.badge} hover:opacity-80`
              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }`}
        >
          <FiStar
            size={12}
            className={cat.isFeatured ? c.star : "text-gray-400"}
            style={cat.isFeatured ? { filter: c.glow } : {}}
          />
          {cat.isFeatured ? c.label : "Feature"}
        </button>

        {/* Change colour */}
        {cat.isFeatured && (
          <button
            onClick={onOpenColourPicker}
            className="flex-shrink-0 text-xs text-gray-400 hover:text-orange-500 transition underline underline-offset-2"
          >
            change
          </button>
        )}

        {/* ▲▼ */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs disabled:opacity-30 leading-none transition"
          >▲</button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs disabled:opacity-30 leading-none transition"
          >▼</button>
        </div>
      </div>

      {/* Services drawer */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60">
          <ServicesDrawer category={cat.category} />
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCategoryMeta() {
  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [search,         setSearch]         = useState("");
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [expandedCat,    setExpandedCat]    = useState(null);
  const [pickerFor,      setPickerFor]      = useState(null);

  const dragIndex  = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);

  const fetchMeta = async () => {
    setLoading(true);
    try {
      const res = await API.get("/category-meta");
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

  useEffect(() => { fetchMeta(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post("/category-meta", categories);
      toast.success("Category settings saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Move within same platform group
  const moveRow = (index, direction) => {
    setCategories((prev) => {
      const updated  = [...prev];
      const platform = updated[index].platform;

      const groupIndices = updated
        .map((c, i) => (c.platform === platform ? i : null))
        .filter((i) => i !== null);

      const posInGroup = groupIndices.indexOf(index);
      const swapPos    = posInGroup + direction;
      if (swapPos < 0 || swapPos >= groupIndices.length) return updated;

      const swapIndex = groupIndices[swapPos];
      const tempOrder = updated[index].sortOrder;
      updated[index]    = { ...updated[index],    sortOrder: updated[swapIndex].sortOrder };
      updated[swapIndex] = { ...updated[swapIndex], sortOrder: tempOrder };

      return [...updated].sort((a, b) => {
        if (a.platform !== b.platform) return a.platform.localeCompare(b.platform);
        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      });
    });
  };

  const toggleFeatured = (index, forceColour) => {
    setCategories((prev) => {
      const updated = [...prev];
      const cat     = updated[index];
      updated[index] = {
        ...cat,
        isFeatured:    !cat.isFeatured,
        featuredColor: forceColour ?? cat.featuredColor ?? "orange",
      };
      return updated;
    });
  };

  const changeColour = (index, colour) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], featuredColor: colour, isFeatured: true };
      return updated;
    });
  };

  // Drag handlers
  const onDragStart = (index) => {
    dragIndex.current = index;
    setDraggingIdx(index);
  };

  const onDragEnter = (index) => {
    if (dragIndex.current === null || dragIndex.current === index) return;
    setCategories((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex.current, 1);
      updated.splice(index, 0, moved);
      updated.forEach((c, i) => { c.sortOrder = i + 1; });
      dragIndex.current = index;
      return updated;
    });
  };

  const onDragEnd = () => {
    dragIndex.current = null;
    setDraggingIdx(null);
  };

  // Derived
  const platforms = ["All", ...new Set(categories.map((c) => c.platform))].filter(Boolean);

  const filtered = categories
    .map((c, i) => ({ ...c, _origIndex: i }))
    .filter((c) => {
      const matchPlatform = filterPlatform === "All" || c.platform === filterPlatform;
      const matchSearch   = !search.trim() ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.platform.toLowerCase().includes(search.toLowerCase());
      return matchPlatform && matchSearch;
    });

  const featuredCount = categories.filter((c) => c.isFeatured).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Category Settings</h2>
            <p className="text-gray-500 text-sm mt-1">
              Drag to reorder, feature with a colour, and tap a category to see its services.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMeta}
              className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-white transition"
              title="Refresh"
            >
              <FiRefreshCw size={15} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition text-sm"
            >
              <FiSave size={14} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-sm text-gray-500 flex-wrap mb-4">
          <span><strong className="text-gray-800">{categories.length}</strong> categories</span>
          {featuredCount > 0 && (
            <span className="flex items-center gap-2">
              <strong className="text-yellow-500">{featuredCount}</strong> featured ·
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                <span className="text-orange-500">
                  {categories.filter(c => c.isFeatured && c.featuredColor === "orange").length}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-blue-500">
                  {categories.filter(c => c.isFeatured && c.featuredColor === "blue").length}
                </span>
              </span>
            </span>
          )}
        </div>

        {/* Search + Platform pills */}
        <div className="flex flex-col gap-3 mb-5">
          <input
            type="text"
            placeholder="Search category or platform…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          {platforms.length > 2 && (
            <div className="flex gap-2 flex-wrap">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition ${
                    filterPlatform === p
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FiGrid size={32} className="mx-auto mb-3 opacity-30" />
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((cat) => {
              const i = cat._origIndex;
              return (
                <div
                  key={`${cat.platform}::${cat.category}`}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragEnter={() => onDragEnter(i)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <CategoryRow
                    cat={cat}
                    index={i}
                    total={categories.length}
                    onMove={(dir) => moveRow(i, dir)}
                    onToggleFeatured={(forceColour) => toggleFeatured(i, forceColour)}
                    onColorChange={(colour) => changeColour(i, colour)}
                    expanded={expandedCat === `${cat.platform}::${cat.category}`}
                    onToggleExpand={() =>
                      setExpandedCat((prev) =>
                        prev === `${cat.platform}::${cat.category}`
                          ? null
                          : `${cat.platform}::${cat.category}`
                      )
                    }
                    isDragging={draggingIdx === i}
                    onOpenColourPicker={() => setPickerFor(i)}
                  />
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          💡 Drag rows to reorder, or use ▲▼. Click <strong>Feature</strong> to pick a colour. Tap a row to see its services. Hit <strong>Save Changes</strong> when done.
        </p>
      </div>

      {/* Colour Picker Modal */}
      {pickerFor !== null && categories[pickerFor] && (
        <ColourPickerModal
          current={categories[pickerFor].featuredColor ?? "orange"}
          categoryName={categories[pickerFor].category}
          onPick={(colour) => {
            changeColour(pickerFor, colour);
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
          }
