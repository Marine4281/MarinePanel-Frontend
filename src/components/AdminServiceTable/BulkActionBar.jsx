import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const BulkActionBar = ({ selectedIds, setSelectedIds }) => {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => API.patch(`/admin/services/${id}/toggle`))),

    onMutate: async (ids) => {
      await queryClient.cancelQueries(["services"]);

      const previous = queryClient.getQueryData(["services"]);

      queryClient.setQueryData(["services"], (old = []) =>
        old.map((s) =>
          ids.includes(s._id) ? { ...s, status: !s.status } : s
        )
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(["services"], context.previous);
      toast.error("Failed");
    },

    onSuccess: () => {
      toast.success("Updated");
      setSelectedIds([]);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["services"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => API.delete(`/admin/services/${id}`))),

    onMutate: async (ids) => {
      await queryClient.cancelQueries(["services"]);

      const previous = queryClient.getQueryData(["services"]);

      queryClient.setQueryData(["services"], (old = []) =>
        old.filter((s) => !ids.includes(s._id))
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(["services"], context.previous);
      toast.error("Delete failed");
    },

    onSuccess: () => {
      toast.success("Deleted");
      setSelectedIds([]);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["services"]);
    },
  });

  if (!selectedIds.length) return null;

  return (
    <>
      <div className="mb-4 flex justify-between bg-blue-50 p-3 rounded-lg">
        <span>{selectedIds.length} selected</span>

        <div className="flex gap-3">
          <button
            onClick={() => toggleMutation.mutate(selectedIds)}
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
        onConfirm={() => deleteMutation.mutate(selectedIds)}
        message="Delete selected services?"
      />
    </>
  );
};

export default BulkActionBar;
