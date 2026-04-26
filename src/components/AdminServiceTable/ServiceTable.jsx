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
      setSelectedIds((prev) =>
        prev.filter((id) => !ids.includes(id))
      );
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // ================= EMPTY / LOADING =================
  if (!groupedServices.length) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-gray-200 animate-pulse rounded"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        
        {/* HEADER */}
        <thead className="bg-gray-100 text-xs">
          <tr>
            <th className="px-4 py-3">
              <input type="checkbox" onChange={toggleSelectAll} />
            </th>
            <th className="px-4 py-3">System ID</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Provider ID</th>
            <th className="px-4 py-3">Provider Rate</th>
            <th className="px-4 py-3">Rate</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {groupedServices.map(([category, items]) => (
            <CategoryHeader
              key={category}
              category={category}
              items={items}
              toggleSelectCategory={toggleSelectCategory}
            >
              {items.map((s) => (
                <ServiceRow
                  key={s._id}
                  service={s}
                  selectedIds={selectedIds}
                  toggleSelect={toggleSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  setSelectedDescription={setSelectedDescription}
                />
              ))}
            </CategoryHeader>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
