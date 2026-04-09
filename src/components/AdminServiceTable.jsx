// src/components/AdminServiceTable.jsx
import { useState, useMemo } from "react";
import RateChangesPanel from "./AdminServiceTable/RateChangesPanel";
import BulkActionBar from "./AdminServiceTable/BulkActionBar";
import SearchBar from "./AdminServiceTable/SearchBar";
import ServiceTable from "./AdminServiceTable/ServiceTable";
import DescriptionModal from "./AdminServiceTable/DescriptionModal";

const AdminServiceTable = ({
  services = [],
  onEdit,
  onDelete,        // Optional: if single delete is handled here
  onToggleStatus,  // Optional: if single toggle is handled here
}) => {
  const [search, setSearch] = useState("");
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // ================= SEARCH =================
  const filteredServices = useMemo(() => {
    if (!search) return services;

    const q = search.toLowerCase();

    return services.filter((s) =>
      String(s.providerServiceId || "").toLowerCase().includes(q) ||
      String(s.serviceId || "").toLowerCase().includes(q) ||
      String(s._id || "").toLowerCase().includes(q) ||
      String(s.category || "").toLowerCase().includes(q) ||
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.rate || "").toLowerCase().includes(q)
    );
  }, [search, services]);

  // ================= GROUP BY CATEGORY =================
  const groupedServices = useMemo(() => {
    const grouped = filteredServices.reduce((acc, service) => {
      const category = service.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});

    // Convert to array of [category, services]
    return Object.entries(grouped).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [filteredServices]);

  // ================= SELECTION HANDLERS =================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map((s) => s._id));
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* 🔥 RATE CHANGES PANEL */}
      <RateChangesPanel services={services} />

      {/* 🔥 BULK ACTION BAR */}
      <BulkActionBar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

      {/* 🔍 SEARCH BAR */}
      <SearchBar search={search} setSearch={setSearch} />

      {/* 📋 SERVICE TABLE */}
      <ServiceTable
        groupedServices={groupedServices}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        toggleSelectCategory={toggleSelectCategory}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        setSelectedDescription={setSelectedDescription}
      />

      {/* 📝 DESCRIPTION MODAL */}
      <DescriptionModal
        description={selectedDescription}
        onClose={() => setSelectedDescription(null)}
      />
    </div>
  );
};

export default AdminServiceTable;
