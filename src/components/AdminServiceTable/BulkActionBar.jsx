// src/components/AdminServiceTable/BulkActionBar.jsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const BulkActionBar = ({ selectedIds, setSelectedIds }) => {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ================= TOGGLE =================
  const toggleMutation = useMutation({
    mutationFn: async (ids) => {
      return Promise.all(
        ids.map((id) => API.patch(`/admin/services/${id}/toggle`))
      );
    },

    // 🔥 safer optimistic update (based on CURRENT state, not blind toggle)
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });

      const previous = queryClient.getQueryData(["services"]);

      queryClient.setQueryData(["services"], (old = []) =>
        old.map((s) => {
          if (!ids.includes(s._id)) return s;

          return {
            ...s,
            status: s.status === true ? false : true, // safe toggle
          };
        })
      );

      return { previous };
    },

    onError: (err, _, context) => {
      toast.error("Toggle failed");

      if (context?.previous) {
        queryClient.setQueryData(["services"], context.previous);
      }
    },

    onSuccess: () => {
      toast.success("Updated");
      setSelectedIds([]);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      return Promise.all(
        ids.map((id) => API.delete(`/admin/services/${id}`))
      );
    },

    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });

      const previous = queryClient.getQueryData(["services"]);

      queryClient.setQueryData(["services"], (old = []) =>
        old.filter((s) => !ids.includes(s._id))
      );

      return { previous };
    },

    onError: (err, _, context) => {
      toast.error("Delete failed");

      if (context?.previous) {
        queryClient.setQueryData(["services"], context.previous);
      }
    },

    onSuccess: () => {
      toast.success("Deleted");
      setSelectedIds([]);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // ================= UI =================
  if (!selectedIds.length) return null;

  return (
    <>
      <div className="mb-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg">
        
        <span className="text-sm font-medium">
          {selectedIds.length} selected
        </span>

        <div className="flex gap-3">
          
          {/* TOGGLE */}
          <button
            onClick={() => toggleMutation.mutate(selectedIds)}
            disabled={toggleMutation.isPending}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {toggleMutation.isPending ? "Updating..." : "Toggle"}
          </button>

          {/* DELETE */}
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedIds)}
        message="Delete selected services?"
      />
    </>
  );
};

export default BulkActionBar;
