// src/components/childpanel/services/CPProvidersImport.jsx
import { useState } from "react";
import { FiLink, FiGrid } from "react-icons/fi";
import CPOwnProvidersTab from "./import/CPOwnProvidersTab";
import CPPlatformServicesTab from "./import/CPPlatformServicesTab";

const IMPORT_TABS = [
  { key: "own",      label: "Own Provider APIs", icon: <FiLink size={13} /> },
  { key: "platform", label: "Platform Services",  icon: <FiGrid size={13} /> },
];

export default function CPProvidersImport({ onImportDone }) {
  const [subTab, setSubTab] = useState("own");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {IMPORT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === t.key
                ? "bg-white shadow text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {subTab === "own"      && <CPOwnProvidersTab      onImportDone={onImportDone} />}
      {subTab === "platform" && <CPPlatformServicesTab  onImportDone={onImportDone} />}
    </div>
  );
}
