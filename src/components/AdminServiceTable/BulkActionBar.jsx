// src/components/AdminServiceTable/BulkActionBar.jsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const QUERY_KEY = ["services"];

const BulkActionBar = ({ selectedIds = [], setSelectedIds }) => {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Helper: Update services regardless of data structure
  const updateServicesCache = (updater) => {
    queryClient.setQueryData(QUERY_KEY, (oldData) => {
      if (!oldData) return oldData;

      // If data is paginated or wrapped: { data: [...] }
      if (Array.isArray(oldData?.data)) {
        return {
          ...oldData,
          data: updater(oldData.data),
        };
      }

      // If data is a simple array
      if (Array.isArray(oldData)) {
        return updater(oldData);
      }

      return oldData;
    });
  };

  // ================= TOGGLE =================
  const toggleMutation = useMutation({
    mutationFn: async (ids) => {
      if (!ids.length) return;
      return Promise.all(
        ids.map((id) => API.patch(`/admin/services/${id}/toggle`))
      );
    },

    // Optimistic update
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previous = queryClient.getQueryData(QUERY_KEY);

      updateServicesCache((services) =>
        services.map((s) =>
          ids.includes(s._id) ? { ...s, status: !s.status } : s
        )
      );

      return { previous };
    },

    onError: (error, _, context) => {
      toast.error(
        error?.response?.data?.message || "Failed to update service status"
      );

      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },

    onSuccess: (_, ids) => {
      toast.success(
        ids.length > 1
          ? "Selected services updated"
          : "Service status updated"
      );
      setSelectedIds([]);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      if (!ids.length) return;
      return Promise.all(
        ids.map((id) => API.delete(`/admin/services/${id}`))
      );
    },

    // Optimistic update
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previous = queryClient.getQueryData(QUERY_KEY);

      updateServicesCache((services) =>
        services.filter((s) => !ids.includes(s._id))
      );

      return { previous };
    },

    onError: (error, _, context) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete services"
      );

      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },

    onSuccess: (_, ids) => {
      toast.success(
        ids.length > 1
          ? "Selected services deleted"
          : "Service deleted"
      );
      setSelectedIds([]);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // ================= HANDLERS =================
  const handleToggle = () => {
    if (!selectedIds.length) {
      toast.error("No services selected");
      return;
    }
    toggleMutation.mutate(selectedIds);
  };

  const handleDeleteConfirm = () => {
    if (!selectedIds.length) {
      toast.error("No services selected");
      return;
    }
    deleteMutation.mutate(selectedIds);
    setConfirmOpen(false); // Close modal after confirmation
  };

  // ================= UI =================
  if (!selectedIds.length) return null;

  const isToggling = toggleMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <>
      <div className="mb-4 flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <span className="text-sm font-medium text-blue-900">
          {selectedIds.length} selected
        </span>

        <div className="flex gap-3">
          {/* TOGGLE */}
          <button
            onClick={handleToggle}
            disabled={isToggling || isDeleting}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {isToggling ? "Updating..." : "Hide/Show"}
          </button>

          {/* DELETE */}
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting || isToggling}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        message={`Are you sure you want to delete ${
          selectedIds.length > 1 ? "these services" : "this service"
        }?`}
      />
    </>
  );
};

export default BulkActionBar;
