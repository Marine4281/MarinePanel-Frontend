// src/components/AdminServiceTable/ServiceTable.jsx
import ServiceRow from "./ServiceRow";
import CategoryHeader from "./CategoryHeader";

const ServiceTable = ({
  groupedServices,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  onToggleStatus,
  setSelectedDescription,
  commission,
  pageOffset = 0, // ← ADDED
}) => {

  // ================= SELECT =================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = groupedServices.flatMap(([_, items]) =>
      items.map((s) => s._id)
    );
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const toggleSelectCategory = (items) => {
    const ids = items.map((i) => i._id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // ================= EMPTY / LOADING =================
  if (!groupedServices.length) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  // ================= GLOBAL OFFSET =================
  // Starts from pageOffset so # is continuous across pages
  let globalOffset = pageOffset; // ← CHANGED from 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left min-w-full bg-white rounded-xl shadow overflow-hidden">

        {/* HEADER */}
        <thead>
          <tr className="bg-orange-500 text-white text-left text-xs uppercase tracking-wide">
            <th className="px-3 py-3">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                className="accent-white"
              />
            </th>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">System ID</th>
            <th className="px-3 py-3">Platform</th>
            <th className="px-3 py-3">Service</th>
            <th className="px-3 py-3">Provider</th>
            <th className="px-3 py-3">Provider ID</th>
            <th className="px-3 py-3">Provider Rate</th>
            <th className="px-3 py-3">
              Rate
              {commission != null && (
                <span className="ml-1 text-[10px] text-orange-200 font-normal">
                  (+{commission}%)
                </span>
              )}
            </th>
            <th className="px-3 py-3 text-center">Description</th>
            <th className="px-3 py-3 text-center">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {groupedServices.map(([category, items]) => {
            const offset = globalOffset;
            globalOffset += items.length;

            return (
              <CategoryHeader
                key={category}
                category={category}
                items={items}
                toggleSelectCategory={toggleSelectCategory}
              >
                {items.map((s, index) => (
                  <ServiceRow
                    key={s._id}
                    index={offset + index}
                    service={s}
                    commission={commission}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    setSelectedDescription={setSelectedDescription}
                  />
                ))}
              </CategoryHeader>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
