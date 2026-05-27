// src/components/childpanel/services/CPServiceTable.jsx
import { useState } from "react";
import CPServiceRow from "./CPServiceRow";
import CommissionModal from "../../CommissionModal";
import API from "../../../api/axios";
import toast from "react-hot-toast";

function CPCategoryHeader({
  category, items, selectedIds, toggleSelectCategory,
  globalCommission, categoryCommissions, onCommissionSaved,
}) {
  const [showModal, setShowModal] = useState(false);
  const currentOverride = categoryCommissions?.[category] ?? null;

  const handleSave = async (value) => {
    await API.patch("/cp/services/category-commissions", { category, commission: value });
    toast.success(
      value === null
        ? `Category "${category}" commission cleared`
        : `Category "${category}" → ${value}%`
    );
    onCommissionSaved?.();
  };

  const allCatSel = items.every((s) => selectedIds.includes(s._id));

  return (
    <>
      <tr className="bg-gray-100 border-b border-gray-200">
        <td colSpan={11} className="px-4 py-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="checkbox"
              checked={allCatSel}
              onChange={() => toggleSelectCategory(items)}
              className="accent-blue-600"
            />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{category}</span>
            <span className="text-[10px] text-gray-400">({items.length})</span>

            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition border ${
                currentOverride != null
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              💰 {currentOverride != null ? `${currentOverride}%` : "Set %"}
            </button>
          </div>
        </td>
      </tr>

      <CommissionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode="category"
        target={{ name: category, currentOverride }}
        globalCommission={globalCommission}
        onSave={handleSave}
        accentColor="blue"
      />
    </>
  );
}

export default function CPServiceTable({
  groupedServices,
  commission,
  categoryCommissions,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  onToggle,
  onShowDesc,
  onCommissionSaved,
}) {
  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    const allIds = groupedServices.flatMap(([, items]) => items.map((s) => s._id));
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const toggleSelectCategory = (items) => {
    const ids = items.map((i) => i._id);
    const allSel = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSel ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  if (!groupedServices.length) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  let globalOffset = 0;

  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
      <table className="w-full text-sm text-left min-w-full bg-white">
        <thead>
          <tr className="bg-blue-600 text-white text-left text-xs uppercase tracking-wide">
            <th className="px-3 py-3">
              <input type="checkbox" onChange={toggleSelectAll} className="accent-white" />
            </th>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">Platform</th>
            <th className="px-3 py-3">Service</th>
            <th className="px-3 py-3">Source</th>
            <th className="px-3 py-3">Cost Rate</th>
            <th className="px-3 py-3">
              End-user Rate
              {commission > 0 && (
                <span className="ml-1 text-[10px] text-blue-200 font-normal">(+{commission}% default)</span>
              )}
            </th>
            <th className="px-3 py-3">Min / Max</th>
            <th className="px-3 py-3 text-center">Desc</th>
            <th className="px-3 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {groupedServices.map(([category, items]) => {
            const offset = globalOffset;
            globalOffset += items.length;

            return (
              <CPCategoryHeader
                key={`cat-${category}`}
                category={category}
                items={items}
                selectedIds={selectedIds}
                toggleSelectCategory={toggleSelectCategory}
                globalCommission={commission}
                categoryCommissions={categoryCommissions}
                onCommissionSaved={onCommissionSaved}
              >
                {items.map((s, index) => (
                  <CPServiceRow
                    key={s._id}
                    index={offset + index}
                    service={s}
                    commission={commission}
                    categoryCommissions={categoryCommissions}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggle={onToggle}
                    onShowDesc={onShowDesc}
                    onCommissionSaved={onCommissionSaved}
                  />
                ))}
              </CPCategoryHeader>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
