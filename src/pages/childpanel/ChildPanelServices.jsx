// src/pages/childpanel/ChildPanelServices.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import CPInlineAddService from "../../components/childpanel/services/CPInlineAddService";

import CPCommissionBar from "../../components/childpanel/services/CPCommissionBar";
import CPServiceTable from "../../components/childpanel/services/CPServiceTable";
import CPServiceForm from "../../components/childpanel/services/CPServiceForm";
import CPBulkActionBar from "../../components/childpanel/services/CPBulkActionBar";
import CPServiceSearchBar from "../../components/childpanel/services/CPServiceSearchBar";
import CPDescriptionModal from "../../components/childpanel/services/CPDescriptionModal";
import CPProvidersImport from "../../components/childpanel/services/CPProvidersImport";
import CPRateChangesPanel from "../../components/childpanel/services/CPRateChangesPanel";
import CPDeletedSyncPanel from "../../components/childpanel/services/CPDeletedSyncPanel";

import {
  FiPlus, FiRefreshCw, FiLink, FiGrid, FiZap,
  FiTrendingUp, FiAlertTriangle,
} from "react-icons/fi";

function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ onAdd, onGoProviders }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
        <FiZap size={28} className="text-blue-400" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-800">No Services Yet</p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Add services manually or import them from your provider connections.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
        >
          <FiPlus size={14} /> Add Manually
        </button>
        <button
          onClick={onGoProviders}
          className="flex items-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50"
        >
          <FiLink size={14} /> Import from Provider
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { key: "services",      label: "My Services",          icon: <FiGrid size={14} /> },
  { key: "providers",     label: "Import from Providers", icon: <FiLink size={14} /> },
  { key: "rate-changes",  label: "Rate Changes",          icon: <FiTrendingUp size={14} /> },
  { key: "deleted-sync",  label: "Deleted Sync",          icon: <FiAlertTriangle size={14} /> },
];

export default function ChildPanelServices() {
  const [activeTab, setActiveTab] = useState("services");

  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [commission, setCommission] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch]           = useState("");

  const [editService, setEditService] = useState(null);
  const [addOpen, setAddOpen]         = useState(false);
  const [descText, setDescText]       = useState(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, comRes] = await Promise.all([
        API.get("/cp/services"),
        API.get("/cp/services/commission"),
      ]);
      setServices(svcRes.data || []);
      setCommission(comRes.data?.commission ?? 0);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.platform?.toLowerCase().includes(q) ||
        String(s.serviceId || "").includes(q)
    );
  }, [services, search]);

  const groupedServices = useMemo(() => {
    const map = {};
    filtered.forEach((s) => {
      const cat = s.category || "Uncategorized";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleToggle = async (id) => {
    try {
      await API.patch(`/cp/services/${id}/toggle`);
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: !s.status } : s))
      );
    } catch {
      toast.error("Failed to toggle service");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await API.delete(`/cp/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setServices((prev) => prev.map((s) => (s._id === saved._id ? { ...s, ...saved } : s)));
    } else {
      setServices((prev) => [saved, ...prev]);
    }
  };

  const handleImportDone = () => {
    setActiveTab("services");
    loadServices();
  };

  return (
    <ChildPanelLayout>
      <div className="max-w-7xl mx-auto space-y-5 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Services</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Full control over the services your end users can see and order.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadServices}
              className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <FiRefreshCw size={15} />
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              <FiPlus size={14} /> Add Service
            </button>
          </div>
        </div>

        {/* Commission Bar */}
        <CPCommissionBar commission={commission} onUpdate={setCommission} />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white shadow text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: MY SERVICES ── */}
        {activeTab === "services" && (
          <div className="space-y-4">
            {/* ── INLINE ADD SERVICE FORM (always visible at top) ── */}
            <CPInlineAddService onAdded={(svc) => setServices((prev) => [svc, ...prev])} />

            {/* Search */}
            <CPServiceSearchBar value={search} onChange={setSearch} />
            {!loading && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span><strong className="text-gray-800">{services.length}</strong> total</span>
                <span><strong className="text-green-600">{services.filter((s) => s.status).length}</strong> active</span>
                <span><strong className="text-gray-400">{services.filter((s) => !s.status).length}</strong> hidden</span>
              </div>
            )}

            <CPBulkActionBar
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onRefresh={loadServices}
            />

            {loading ? (
              <Spinner />
            ) : services.length === 0 ? (
              <EmptyState
                onAdd={() => setAddOpen(true)}
                onGoProviders={() => setActiveTab("providers")}
              />
            ) : (
              <CPServiceTable
                groupedServices={groupedServices}
                commission={commission}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onEdit={(s) => setEditService(s)}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onShowDesc={(d) => setDescText(d)}
              />
            )}
          </div>
        )}

        {/* ── TAB: IMPORT FROM PROVIDERS ── */}
        {activeTab === "providers" && (
          <CPProvidersImport onImportDone={handleImportDone} />
        )}

        {/* ── TAB: RATE CHANGES ── */}
        {activeTab === "rate-changes" && (
          <CPRateChangesPanel onSynced={loadServices} />
        )}

        {/* ── TAB: DELETED SYNC ── */}
        {activeTab === "deleted-sync" && (
          <CPDeletedSyncPanel onDeleted={loadServices} />
        )}
      </div>

      {/* Modals */}
      {(addOpen || editService) && (
        <CPServiceForm
          service={editService || null}
          onClose={() => { setAddOpen(false); setEditService(null); }}
          onSaved={handleSaved}
        />
      )}

      {descText && (
        <CPDescriptionModal
          description={descText}
          onClose={() => setDescText(null)}
        />
      )}
    </ChildPanelLayout>
  );
    }
