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
  onDelete,
  onToggleStatus,
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

    return Object.entries(grouped); // Keep original order
  }, [filteredServices]);

  // ================= SELECTION HANDLERS =================

  // Toggle single service selection
  const toggleSelect = (id) => {
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // Toggle select all filtered services
  const toggleSelectAll = () => {
    const allIds = filteredServices.map((s) => s._id).filter(Boolean);

    const isAllSelected =
      allIds.length > 0 &&
      allIds.every((id) => selectedIds.includes(id));

    setSelectedIds(isAllSelected ? [] : allIds);
  };

  // Toggle selection for a specific category
  const toggleSelectCategory = (items = []) => {
    const ids = items.map((i) => i._id).filter(Boolean);
    if (!ids.length) return;

    const allSelected = ids.every((id) =>
      selectedIds.includes(id)
    );

    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !ids.includes(id)) // Deselect category
        : [...new Set([...prev, ...ids])]        // Select category
    );
  };

  // Helper for "Select All" checkbox state
  const isAllSelected = useMemo(() => {
    const allIds = filteredServices.map((s) => s._id).filter(Boolean);
    return (
      allIds.length > 0 &&
      allIds.every((id) => selectedIds.includes(id))
    );
  }, [filteredServices, selectedIds]);

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
        isAllSelected={isAllSelected}
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
