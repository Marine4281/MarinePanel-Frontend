import { useState, useMemo } from "react";
import RateChangesPanel from "./AdminServiceTable/RateChangesPanel";
import BulkActionBar from "./AdminServiceTable/BulkActionBar";
import SearchBar from "./AdminServiceTable/SearchBar";
import ServiceTable from "./AdminServiceTable/ServiceTable";
import DescriptionModal from "./AdminServiceTable/DescriptionModal";

const AdminServiceTable = ({
  services,
  onEdit,
  onDelete,
  onToggleStatus,
  refresh, // 🔥 IMPORTANT
}) => {
  const [search, setSearch] = useState("");
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // ===== SEARCH =====
  const filteredServices = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase();

    return services.filter((s) =>
      String(s.providerServiceId || "").toLowerCase().includes(q) ||
      String(s.serviceId || "").includes(search) ||
      String(s._id || "").toLowerCase().includes(q) ||
      String(s.category || "").toLowerCase().includes(q) ||
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.rate || "").includes(search)
    );
  }, [search, services]);

  // ===== GROUP =====
  const groupedServices = useMemo(() => {
    return Object.entries(
      filteredServices.reduce((acc, s) => {
        const cat = s.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
      }, {})
    );
  }, [filteredServices]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <RateChangesPanel services={services} refresh={refresh} />

      <BulkActionBar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        refresh={refresh}
      />

      <SearchBar search={search} setSearch={setSearch} />

      <ServiceTable
        groupedServices={groupedServices}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        setSelectedDescription={setSelectedDescription}
      />

      <DescriptionModal
        description={selectedDescription}
        onClose={() => setSelectedDescription(null)}
      />
    </div>
  );
};

export default AdminServiceTable;
