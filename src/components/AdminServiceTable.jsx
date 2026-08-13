// src/components/AdminServiceTable.jsx
import { useState, useMemo } from "react";

import RateChangesPanel from "./AdminServiceTable/RateChangesPanel";
import BulkActionBar from "./AdminServiceTable/BulkActionBar";
import SearchBar from "./AdminServiceTable/SearchBar";
import ServiceTable from "./AdminServiceTable/ServiceTable";
import DescriptionModal from "./AdminServiceTable/DescriptionModal";

const AdminServiceTable = ({
  services = [],
  search,
  setSearch,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  commission,
  categoryCommissions,
  onCommissionSaved,
  pageOffset = 0,
}) => {
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // `services` is already filtered + paginated by the parent —
  // just group it by category for display.
  const groupedServices = useMemo(() => {
    return Object.entries(
      services.reduce((acc, s) => {
        const cat = s.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
      }, {})
    );
  }, [services]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
        Loading services...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <RateChangesPanel services={services} />
      <BulkActionBar selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      <SearchBar search={search} setSearch={setSearch} />
      <ServiceTable
        groupedServices={groupedServices}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        setSelectedDescription={setSelectedDescription}
        commission={commission}
        categoryCommissions={categoryCommissions}
        onCommissionSaved={onCommissionSaved}
        pageOffset={pageOffset}
      />
      <DescriptionModal
        description={selectedDescription}
        onClose={() => setSelectedDescription(null)}
      />
    </div>
  );
};

export default AdminServiceTable;
