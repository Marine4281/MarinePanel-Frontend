// src/components/AdminServiceTable.jsx
import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query"; // ✅ ADDED
import { QUERY_KEYS } from "../constants/queryKeys";

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
  refresh, // fallback (optional)
}) => {
  const queryClient = useQueryClient(); // ✅ React Query client

  const [search, setSearch] = useState("");
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // ===== GLOBAL REFRESH HANDLER (PRODUCTION READY) =====
  const handleRefresh = useCallback(() => {
    // 🔥 Invalidate services cache everywhere
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });

    // Optional fallback (if still used somewhere)
    if (refresh) refresh();
  }, [queryClient, refresh]);

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
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

      <RateChangesPanel services={services} refresh={handleRefresh} />

      <BulkActionBar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        refresh={handleRefresh}
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
        refresh={handleRefresh} // ✅ optional future use
      />

      <DescriptionModal
        description={selectedDescription}
        onClose={() => setSelectedDescription(null)}
      />
    </div>
  );
};

export default AdminServiceTable;
