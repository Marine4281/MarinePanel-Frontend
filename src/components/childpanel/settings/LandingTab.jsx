// src/components/childpanel/settings/LandingTab.jsx
import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { useChildPanel } from "../../../context/ChildPanelContext";

const TEMPLATES = [
  {
    id: "default",
    name: "Default",
    description: "Gradient hero with feature cards and stats. Clean and versatile.",
    preview: ({ color }) => (
      <div className="w-full h-full flex flex-col" style={{ background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3">
          <div className="w-16 h-3 rounded bg-white/60" />
          <div className="w-24 h-2 rounded bg-white/40" />
          <div className="flex gap-1.5 mt-2">
            <div className="w-10 h-5 rounded-lg bg-white/90" />
            <div className="w-10 h-5 rounded-lg bg-white/30 border border-white/40" />
          </div>
          <div className="flex gap-1.5 mt-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-10 h-8 rounded-xl bg-white/20" />
            ))}
          </div>
        </div>
        <div className="h-5 bg-white/20" />
      </div>
    ),
  },
  {
    id: "dark-pro",
    name: "Dark Pro",
    description: "Sleek dark theme with glowing accents. Perfect for a premium look.",
    preview: ({ color }) => (
      <div className="w-full h-full flex flex-col bg-gray-950">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
          <div className="w-8 h-2 rounded bg-white/20" />
          <div className="flex gap-1">
            <div className="w-6 h-2.5 rounded bg-white/20" />
            <div className="w-8 h-2.5 rounded" style={{ backgroundColor: color }} />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full blur-2xl opacity-25" style={{ backgroundColor: color }} />
          </div>
          <div className="relative w-14 h-2.5 rounded bg-white/30" />
          <div className="relative w-20 h-2 rounded" style={{ backgroundColor: `${color}60` }} />
          <div className="relative flex gap-1.5 mt-1">
            <div className="w-10 h-5 rounded-lg" style={{ backgroundColor: color }} />
            <div className="w-10 h-5 rounded-lg border border-white/20" />
          </div>
        </div>
        <div className="h-5 border-t border-white/10 flex items-center justify-center gap-2 px-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-4 h-1.5 rounded-full" style={{ backgroundColor: `${color}60` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white design with crisp typography. Understated and professional.",
    preview: ({ color }) => (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100">
          <div className="w-8 h-2 rounded bg-gray-200" />
          <div className="flex gap-1">
            <div className="w-6 h-2.5 rounded bg-gray-100" />
            <div className="w-8 h-2.5 rounded" style={{ backgroundColor: color }} />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3">
          <div className="w-20 h-3 rounded bg-gray-800" />
          <div className="w-16 h-2 rounded bg-gray-300" />
          <div className="flex gap-1.5 mt-2">
            <div className="w-10 h-5 rounded-xl" style={{ backgroundColor: color }} />
            <div className="w-10 h-5 rounded-xl bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 rounded-xl bg-gray-50 border border-gray-100" />
            ))}
          </div>
        </div>
        <div className="h-4 border-t border-gray-100" />
      </div>
    ),
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Colorful gradient background with platform icons. Energetic and engaging.",
    preview: ({ color }) => (
      <div className="w-full h-full flex flex-col" style={{ background: `linear-gradient(160deg, #fff 0%, ${color}20 50%, ${color}40 100%)` }}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="w-8 h-2 rounded bg-gray-700/40" />
          <div className="flex gap-1">
            <div className="w-6 h-2.5 rounded bg-white shadow-sm" />
            <div className="w-8 h-2.5 rounded shadow-md" style={{ backgroundColor: color }} />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-2">
          <div className="w-8 h-8 rounded-2xl bg-white shadow-md flex items-center justify-center text-sm">🚀</div>
          <div className="w-20 h-3 rounded bg-gray-800/60" />
          <div className="w-16 h-2 rounded bg-gray-500/40" />
          <div className="flex gap-1.5 mt-1">
            <div className="w-12 h-5 rounded-2xl shadow-md" style={{ backgroundColor: color }} />
            <div className="w-12 h-5 rounded-2xl bg-white shadow-md" />
          </div>
          <div className="grid grid-cols-4 gap-1 mt-1 w-full">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-5 rounded-xl bg-white/70 shadow-sm" />
            ))}
          </div>
        </div>
        <div className="h-4 bg-white/40 border-t border-white/60" />
      </div>
    ),
  },
];

export default function LandingTab({ settings, onSaved }) {
  const { refetch } = useChildPanel();
  const [selected, setSelected] = useState(settings.landingTemplate || "default");
  const [loading,  setLoading]  = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/landing-template", { landingTemplate: selected });
      toast.success("Landing page updated");
      onSaved({ landingTemplate: selected });
      refetch?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const themeColor = settings.themeColor || "#1e40af";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Choose Landing Page Template</h3>
        <p className="text-xs text-gray-500">
          This template shows to visitors when they land on your panel domain before logging in.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map((t) => {
          const isActive = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 text-left ${
                isActive ? "border-blue-500 shadow-lg shadow-blue-100" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Mini preview */}
              <div className="h-36 w-full overflow-hidden relative">
                <t.preview color={themeColor} />
              </div>

              {/* Selected badge */}
              {isActive && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="p-3 border-t border-gray-100">
                <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: themeColor }}
      >
        {loading ? "Saving…" : "Save Landing Template"}
      </button>
    </div>
  );
}
