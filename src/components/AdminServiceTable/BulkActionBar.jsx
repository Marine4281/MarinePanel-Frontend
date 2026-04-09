import API from "../../api/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const BulkActionBar = ({ selectedIds, setSelectedIds, services, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const bulkToggle = async () => {
    try {
      setLoading(true);

      await Promise.all(
        selectedIds.map((id) =>
          API.patch(`/admin/services/${id}/toggle`)
        )
      );

      toast.success("Updated");
      setSelectedIds([]);
      await refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    try {
      setLoading(true);

      await Promise.all(
        selectedIds.map((id) =>
          API.delete(`/admin/services/${id}`)
        )
      );

      toast.success("Deleted");
      setSelectedIds([]);
      await refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="mb-4 flex justify-between bg-blue-50 p-3 rounded-lg">
        <span>{selectedIds.length} selected</span>

        <div className="flex gap-3">
          <button
            onClick={bulkToggle}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Toggle
          </button>

          <button
            onClick={() => setConfirmOpen(true)}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={bulkDelete}
        message="Delete selected services?"
      />
    </>
  );
};

export default BulkActionBar;
