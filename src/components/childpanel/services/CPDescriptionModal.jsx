// src/components/childpanel/services/CPBulkActionBar.jsx

import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";

export default function CPBulkActionBar({ selectedIds, setSelectedIds, onRefresh }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!selectedIds.length) return null;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await API.patch("/cp/services/bulk-toggle", { ids: selectedIds });
      toast.success(`${selectedIds.length} service(s) toggled`);
      setSelectedIds([]);
      onRefresh();
    } catch {
      toast.error("Failed to toggle services");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete("/cp/services/bulk", { data: { ids: selectedIds } });
      toast.success(`${selectedIds.length} service(s) deleted`);
      setSelectedIds([]);
      setConfirmOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to delete services");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-xl">
        <span className="text-sm font-medium text-blue-900">
          {selectedIds.length} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleToggle}
            disabled={toggling || deleting}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            {toggling ? "Toggling..." : "Toggle On/Off"}
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting || toggling}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Confirm Delete</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete {selectedIds.length} service
              {selectedIds.length > 1 ? "s" : ""}? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
      }
