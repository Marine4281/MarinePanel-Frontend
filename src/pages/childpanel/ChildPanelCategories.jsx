// src/pages/childpanel/ChildPanelCategories.jsx
// CP Owner – Categories page
// Features: drag-to-reorder, featured toggle (with colour picker popup: orange or blue),
//           tap a category to expand and list its services

import { useState, useEffect, useCallback, useRef } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import {
  FiSave, FiRefreshCw, FiChevronDown, FiChevronRight,
  FiStar, FiGrid, FiLoader,
} from "react-icons/fi";

// ── Colour definitions ────────────────────────────────────────────────────────
const COLOURS = {
  orange: {
    badge:   "bg-orange-100 text-orange-600 border border-orange-300",
    star:    "text-orange-500",
    glow:    "drop-shadow(0 0 5px rgba(249,115,22,0.8))",
    dot:     "bg-orange-500",
    label:   "Orange",
    ring:    "ring-orange-400",
  },
  blue: {
    badge:   "bg-blue-100 text-blue-600 border border-blue-300",
    star:    "text-blue-500",
    glow:    "drop-shadow(0 0 5px rgba(59,130,246,0.8))",
    dot:     "bg-blue-500",
    label:   "Blue",
    ring:    "ring-blue-400",
  },
};

// ── Colour Picker Popup ───────────────────────────────────────────────────────
function ColourPicker({ current, onPick, onClose }) {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full mt-2 left-0 bg-white rounded-xl shadow-xl border p-3 flex flex-col gap-2 min-w-[160px]"
    >
      <p className="text-xs font-semibold text-gray-500 mb-1">Pick feature colour</p>
      {Object.entries(COLOURS).map(([key, c]) => (
        <button
          key={key}
          onClick={() => onPick(key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition
            ${current === key ? `ring-2 ${c.ring} bg-gray-50` : "hover:bg-gray-50"}`}
        >
          <span className={`w-3 h-3 rounded-full ${c.dot}`} />
          {c.label}
          {current === key && <span className="ml-auto text-xs text-gray-400">✓</span>}
        </button>
      ))}
    </div>
  );
}

// ── Services Drawer (expands when category is tapped) ────────────────────────
function ServicesDrawer({ category }) {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    API.get(`/cp/categories/${encodeURIComponent(category)}/services`)
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
          className="flex items-center justify-between px-6 py-2.5 text-sm hover:bg-blue-50/40 transition"
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

// ── Category Row (draggable) ──────────────────────────────────────────────────
function CategoryRow({
  cat, index, total,
  onMove, onToggleFeatured, onColorChange,
  expanded, onToggleExpand,
  isDragging, dragHandleProps,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const c = COLOURS[cat.featuredColor] || COLOURS.orange;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden
        ${isDragging ? "shadow-lg scale-[1.01] border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}
      `}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none text-lg leading-none flex-shrink-0"
          title="Drag to reorder"
        >
          ⠿
        </div>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-3 text-left"
        >
          {expanded
            ? <FiChevronDown size={16} className="text-blue-500 flex-shrink-0" />
            : <FiChevronRight size={16} className="text-gray-400 flex-shrink-0" />
          }
          <div>
            <p className="font-semibold text-gray-800 text-sm">{cat.category}</p>
            <p className="text-xs text-gray-400">{cat.platform}</p>
          </div>
        </button>

        {/* Featured badge + colour picker */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              if (!cat.isFeatured) {
                // Not featured yet — show picker first
                setShowPicker(true);
              } else {
                // Already featured — un-feature immediately
                onToggleFeatured();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition
              ${cat.isFeatured
                ? `${c.badge} hover:opacity-80`
                : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
              }`}
          >
            <FiStar
              size={13}
              className={cat.isFeatured ? c.star : "text-gray-400"}
              style={cat.isFeatured ? { filter: c.glow } : {}}
            />
            {cat.isFeatured ? `Featured · ${c.label}` : "Feature"}
          </button>

          {/* Change colour button (only when featured) */}
          {cat.isFeatured && (
            <button
              onClick={() => setShowPicker(true)}
              className="ml-1 text-xs text-gray-400 hover:text-gray-600 underline"
              title="Change colour"
            >
              change
            </button>
          )}

          {showPicker && (
            <ColourPicker
              current={cat.featuredColor}
              onPick={(colour) => {
                onColorChange(colour);
                if (!cat.isFeatured) onToggleFeatured(colour); // feature with chosen colour
                setShowPicker(false);
              }}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>

        {/* Sort order arrows */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs disabled:opacity-30 leading-none"
          >▲</button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs disabled:opacity-30 leading-none"
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
export default function ChildPanelCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [expandedCat, setExpandedCat] = useState(null);

  // Drag state
  const dragIndex = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/cp/categories");
      const sorted = (res.data || []).sort((a, b) => {
        if (a.platform !== b.platform) return a.platform.localeCompare(b.platform);
        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      });
      setCategories(sorted);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post("/cp/categories", categories);
      toast.success("Category settings saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const moveRow = (index, direction) => {
    setCategories((prev) => {
      const updated   = [...prev];
      const swapIndex = index + direction;
      if (swapIndex < 0 || swapIndex >= updated.length) return updated;

      // Swap sortOrders
      const tempOrder = updated[index].sortOrder;
      updated[index]   = { ...updated[index],   sortOrder: updated[swapIndex].sortOrder };
      updated[swapIndex] = { ...updated[swapIndex], sortOrder: tempOrder };

      return [...updated].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
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
      updated[index] = { ...updated[index], featuredColor: colour };
      return updated;
    });
  };

  // ── Drag handlers ───────────────────────────────────────────────
  const onDragStart = (index) => {
    dragIndex.current = index;
    setDraggingIdx(index);
  };

  const onDragEnter = (index) => {
    if (dragIndex.current === null || dragIndex.current === index) return;
    setCategories((prev) => {
      const updated  = [...prev];
      const [moved]  = updated.splice(dragIndex.current, 1);
      updated.splice(index, 0, moved);
      // Re-assign sortOrders to reflect new positions
      updated.forEach((c, i) => { c.sortOrder = i + 1; });
      dragIndex.current = index;
      return updated;
    });
  };

  const onDragEnd = () => {
    dragIndex.current = null;
    setDraggingIdx(null);
  };

  // ── Filtered display ────────────────────────────────────────────
  const filtered = categories
    .map((c, i) => ({ ...c, _origIndex: i }))
    .filter((c) =>
      !search.trim() ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.toLowerCase().includes(search.toLowerCase())
    );

  const featuredCount = categories.filter((c) => c.isFeatured).length;

  return (
    <ChildPanelLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Reorder categories and choose which to feature. Tap a category to see its services.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <FiRefreshCw size={15} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
            >
              <FiSave size={14} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span><strong className="text-gray-800">{categories.length}</strong> categories</span>
          <span>
            <strong className="text-yellow-500">{featuredCount}</strong> featured
            {featuredCount > 0 && (
              <>
                {" · "}
                <span className="text-orange-500">{categories.filter(c => c.isFeatured && c.featuredColor === "orange").length} orange</span>
                {" · "}
                <span className="text-blue-500">{categories.filter(c => c.isFeatured && c.featuredColor === "blue").length} blue</span>
              </>
            )}
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />
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
                    dragHandleProps={{}}
                  />
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400">
          💡 Drag rows to reorder, or use ▲▼. Click <strong>Feature</strong> to pick a colour and
          feature a category. Click a category name to see its services. Hit{" "}
          <strong>Save Changes</strong> when done.
        </p>
      </div>
    </ChildPanelLayout>
  );
}
