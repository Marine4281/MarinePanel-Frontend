// src/components/AdminServiceTable.jsx
import { useState, useMemo } from "react";

import RateChangesPanel from "./AdminServiceTable/RateChangesPanel";
import BulkActionBar from "./AdminServiceTable/BulkActionBar";
import SearchBar from "./AdminServiceTable/SearchBar";
import ServiceTable from "./AdminServiceTable/ServiceTable";
import DescriptionModal from "./AdminServiceTable/DescriptionModal";

const AdminServiceTable = ({
  services = [],
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  commission,
  pageOffset = 0, // ← ADDED
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

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
        Loading services...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

      {/* ================= RATE PANEL ================= */}
      <RateChangesPanel services={services} />

      {/* ================= BULK ACTIONS ================= */}
      <BulkActionBar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

      {/* ================= SEARCH ================= */}
      <SearchBar search={search} setSearch={setSearch} />

      {/* ================= TABLE ================= */}
      <ServiceTable
        groupedServices={groupedServices}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        setSelectedDescription={setSelectedDescription}
        commission={commission}
        pageOffset={pageOffset} // ← ADDED
      />

      {/* ================= MODAL ================= */}
      <DescriptionModal
        description={selectedDescription}
        onClose={() => setSelectedDescription(null)}
      />

    </div>
  );
};

export default AdminServiceTable;
