import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { useChildPanel } from "../../../context/ChildPanelContext";
import { getAllTemplates } from "../../../templates/registry";
import {
  FiCheck, FiLayout, FiMonitor, FiSmartphone, FiMenu,
} from "react-icons/fi";

const STYLE_ICONS = {
  "Hidden ≡ Menu · No Header · Dark":      <FiMenu size={12} />,
  "Bottom Nav · Minimal · Mobile-First":   <FiSmartphone size={12} />,
  "Sidebar · Dark · Neon Glow":            <FiMonitor size={12} />,
  "Header + Footer · Professional · Blue": <FiLayout size={12} />,
};

function LayoutPreview({ templateId }) {
  if (templateId === "aurora") {
    return (
      <div className="w-full h-full flex flex-col p-2 gap-1.5">
        <div className="flex items-center justify-between">
          <div className="w-4 h-3 rounded-sm bg-white/20 flex flex-col justify-center gap-0.5 px-0.5">
            <div className="h-px bg-white/60 rounded" />
            <div className="h-px bg-white/60 rounded" />
            <div className="h-px bg-white/60 rounded" />
          </div>
          <div className="w-8 h-2 rounded-full bg-white/20" />
          <div className="w-6 h-2 rounded-full bg-white/30" />
        </div>
        <div className="flex-1 flex flex-col gap-1 mt-1">
          <div className="w-3/4 h-2 rounded bg-white/20" />
          <div className="w-full h-2 rounded bg-white/10" />
          <div className="w-full h-2 rounded bg-white/10" />
          <div className="w-1/2 h-2 rounded bg-white/10" />
          <div className="mt-auto w-full h-5 rounded-lg bg-white/20" />
        </div>
      </div>
    );
  }
  if (templateId === "pulse") {
    return (
      <div className="w-full h-full flex flex-col p-2 gap-1.5 bg-gray-50/10">
        <div className="flex items-center justify-between bg-white/30 rounded px-1.5 py-1">
          <div className="w-5 h-1.5 rounded bg-white/60" />
          <div className="w-8 h-1.5 rounded-full bg-white/40" />
        </div>
        <div className="flex-1 flex flex-col gap-1 px-0.5">
          <div className="w-3/4 h-1.5 rounded bg-white/30" />
          <div className="w-full h-10 rounded-xl bg-white/20" />
        </div>
        <div className="flex justify-center">
          <div className="w-3/4 h-4 rounded-full bg-white/40 flex items-center justify-around px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (templateId === "neon") {
    return (
      <div className="w-full h-full flex gap-1.5 p-2">
        <div className="w-8 flex flex-col gap-1 flex-shrink-0">
          <div className="w-full h-3 rounded bg-white/20" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-2 rounded bg-white/10" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-3/4 h-2 rounded bg-white/20" />
          <div className="w-full h-2 rounded bg-white/10" />
          <div className="w-full flex-1 rounded-lg bg-white/10" />
        </div>
      </div>
    );
  }
  if (templateId === "tide") {
    return (
      <div className="w-full h-full flex flex-col p-2 gap-1">
        <div className="w-full h-4 rounded bg-white/30 flex items-center px-1.5 gap-1">
          <div className="w-4 h-1.5 rounded bg-white/70" />
          <div className="flex-1" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-4 h-1.5 rounded bg-white/40" />
          ))}
        </div>
        <div className="flex-1 flex gap-1">
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-3/4 h-1.5 rounded bg-white/20" />
            <div className="w-full h-14 rounded-lg bg-white/15" />
          </div>
          <div className="w-10 flex flex-col gap-1">
            <div className="w-full h-8 rounded bg-white/15" />
            <div className="w-full h-8 rounded bg-white/15" />
          </div>
        </div>
        <div className="w-full h-3 rounded bg-white/25" />
      </div>
    );
  }
  return null;
}

export default function TemplatesTab({ settings, onSaved }) {
  const { refetch }  = useChildPanel();
  const templates    = getAllTemplates();

  const [activeId,   setActiveId]   = useState(settings.templateId || null);
  const [selectedId, setSelectedId] = useState(settings.templateId || null);
  const [saving,     setSaving]     = useState(false);

  const hasChanged = selectedId !== activeId;

  const handleApply = async () => {
    if (!selectedId)  return toast.error("Select a template first");
    if (!hasChanged)  return toast("Already using this template");
    setSaving(true);
    try {
      await API.put("/cp/settings/template", { templateId: selectedId });
      toast.success("Template applied! Your end users will see the new look.");
      setActiveId(selectedId);
      onSaved({ templateId: selectedId });
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply template");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      await API.put("/cp/settings/template", { templateId: null });
      toast.success("Template removed. Default pages restored.");
      setActiveId(null);
      setSelectedId(null);
      onSaved({ templateId: null });
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800">Choose a Template</h3>
        <p className="text-xs text-gray-500 mt-1">
          Your end users will see the selected template when they visit your panel — on login,
          home, wallet, orders, services, and profile pages. Your admin panel is never affected.
        </p>
      </div>

      {activeId && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <FiCheck size={15} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                Active Template: <span className="capitalize">{activeId}</span>
              </p>
              <p className="text-xs text-green-600">
                Your end users are currently seeing this template.
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={saving}
            className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline disabled:opacity-50 flex-shrink-0 ml-4"
          >
            Remove
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          const isActive   = activeId   === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => setSelectedId(tpl.id)}
              className="text-left rounded-2xl border-2 overflow-hidden transition-all focus:outline-none group"
              style={{
                borderColor: isSelected ? tpl.accent : "#e5e7eb",
                boxShadow:   isSelected
                  ? `0 0 0 4px ${tpl.accent}20`
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="relative h-36 w-full overflow-hidden"
                style={{ background: tpl.preview }}
              >
                <div className="absolute inset-0">
                  <LayoutPreview templateId={tpl.id} />
                </div>
                <div
                  className="absolute bottom-2 left-3 text-xs font-black tracking-wider uppercase opacity-40"
                  style={{ color: tpl.accent }}
                >
                  {tpl.name}
                </div>
                {isActive && (
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: tpl.accent, color: "#fff" }}
                  >
                    <FiCheck size={10} /> Live
                  </div>
                )}
                {isSelected && !isActive && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: tpl.accent }}
                  >
                    <FiCheck size={12} color="#fff" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">{tpl.name}</p>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tpl.accent }} />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{tpl.description}</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${tpl.accent}14`, color: tpl.accent }}
                  >
                    {STYLE_ICONS[tpl.style]}
                    {tpl.style}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {["Login","Register","Home","Wallet","Orders","Services","Profile"].map((page) => (
                    <span key={page} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button
          onClick={handleApply}
          disabled={saving || !selectedId || !hasChanged}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background:  selectedId ? templates.find((t) => t.id === selectedId)?.accent || "#3b82f6" : "#9ca3af",
            boxShadow:   selectedId && hasChanged
              ? `0 4px 14px ${templates.find((t) => t.id === selectedId)?.accent}44`
              : "none",
          }}
        >
          <FiCheck size={14} />
          {saving
            ? "Applying..."
            : hasChanged && selectedId
            ? `Apply ${templates.find((t) => t.id === selectedId)?.name || ""} Template`
            : "Template Applied"}
        </button>
        {!hasChanged && activeId   && <p className="text-xs text-gray-400">Click a different template card to switch.</p>}
        {!hasChanged && !activeId  && <p className="text-xs text-gray-400">Select a template card above, then click Apply.</p>}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">How templates work</p>
        <p>Templates only change what your <strong>end users</strong> see. Your admin panel always stays the same.</p>
        <p>Your brand name, logo, and theme color from the Branding tab are applied inside every template.</p>
        <p>Switching templates is instant and reversible at any time.</p>
      </div>
    </div>
  );
                                                                              }
