// src/components/childpanel/services/CPServiceTable.jsx
// Full admin-style table for CP owner's services with category grouping.

import CPServiceRow from "./CPServiceRow";

export default function CPServiceTable({
  groupedServices,   // [[category, items[]], ...]
  commission,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  onToggle,
  onShowDesc,
}) {
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = groupedServices.flatMap(([, items]) => items.map((s) => s._id));
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const toggleSelectCategory = (items) => {
    const ids = items.map((i) => i._id);
    const allSel = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSel
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
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
        {/* Header */}
        <thead>
          <tr className="bg-blue-600 text-white text-left text-xs uppercase tracking-wide">
            <th className="px-3 py-3">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                className="accent-white"
              />
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
                <span className="ml-1 text-[10px] text-blue-200 font-normal">
                  (+{commission}%)
                </span>
              )}
            </th>
            <th className="px-3 py-3">Min / Max</th>
            <th className="px-3 py-3 text-center">Desc</th>
            <th className="px-3 py-3 text-center">Actions</th>
          </tr>
        </thead>

        {/* Body — grouped by category */}
        <tbody>
          {groupedServices.map(([category, items]) => {
            const offset = globalOffset;
            globalOffset += items.length;

            const allCatSel = items.every((s) => selectedIds.includes(s._id));

            return (
              <>
                {/* Category header row */}
                <tr
                  key={`cat-${category}`}
                  className="bg-gray-100 border-b border-gray-200"
                >
                  <td colSpan={11} className="px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allCatSel}
                        onChange={() => toggleSelectCategory(items)}
                        className="accent-blue-600"
                      />
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {category}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({items.length})
                      </span>
                    </div>
                  </td>
                </tr>

                {items.map((s, index) => (
                  <CPServiceRow
                    key={s._id}
                    index={offset + index}
                    service={s}
                    commission={commission}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggle={onToggle}
                    onShowDesc={onShowDesc}
                  />
                ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
