// src/components/childpanel/services/import/CPImportCategoryBlock.jsx
import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiPackage } from "react-icons/fi";
import Badge from "./CPImportBadge";

export default function CPImportCategoryBlock({
  category,
  services: svcs,
  selectedToImport,
  onToggleSelect,
  onToggleCat,
  onImportCategory,
  onShowDesc,
  importingCat,
  idKey = "service",       // "service" for own providers, "_id" for platform
  renderRow,               // (svc, isSel, onToggleSelect, onShowDesc) => <tr>
  headerExtra,             // optional extra badge/element in header
}) {
  const [isOpen, setIsOpen] = useState(false); // collapsed by default — match main platform
  const allSel  = svcs.length > 0 && svcs.every((s) => selectedToImport.has(s[idKey]));
  const someSel = svcs.some((s) => selectedToImport.has(s[idKey]));

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Category header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-gray-100 cursor-pointer hover:bg-gray-200 transition select-none"
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="checkbox"
            checked={allSel}
            ref={(el) => { if (el) el.indeterminate = !allSel && someSel; }}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleCat(svcs)}
            className="accent-blue-600"
          />
          <span className="font-bold text-sm text-gray-700">📦 {category}</span>
          <Badge>{svcs.length}</Badge>
          {headerExtra}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onImportCategory(category, svcs); }}
            disabled={importingCat === category}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-semibold"
          >
            <FiPackage size={11} />
            {importingCat === category ? "Importing..." : "Import Category"}
          </button>
          {isOpen
            ? <FiChevronUp size={14} className="text-gray-400" />
            : <FiChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Services — only visible when open */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-full">
            <thead>
              <tr className="bg-blue-600 text-white text-left text-[11px] uppercase tracking-wide">
                <th className="px-3 py-2 w-8" />
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Service Name</th>
                <th className="px-3 py-2">Rate</th>
                <th className="px-3 py-2">Min / Max</th>
                <th className="px-3 py-2 text-center">Desc</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {svcs.map((svc, i) =>
                renderRow(svc, i, selectedToImport.has(svc[idKey]), onToggleSelect, onShowDesc)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
      }
