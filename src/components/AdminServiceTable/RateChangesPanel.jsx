// src/components/AdminServiceTable/RateChangesPanel.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";

const RateChangesPanel = ({ rateChanges }) => {
  const queryClient = useQueryClient();

  const updateAllMutation = useMutation({
    mutationFn: async () => {
      return Promise.all(
        rateChanges.map((s) =>
          API.put(`/admin/services/${s._id}`, {
            rate: s.providerRate,
            lastSyncedRate: s.providerRate,
          })
        )
      );
    },
    onSuccess: () => {
      toast.success("All rates synced");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => {
      toast.error("Bulk update failed");
    },
  });

  if (!rateChanges.length) return null;

  return (
    <div className="mb-6 border rounded-xl p-4 bg-yellow-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-yellow-800">
          ⚠ Rate Changes ({rateChanges.length})
        </h2>

        <button
          onClick={() => updateAllMutation.mutate()}
          disabled={updateAllMutation.isPending}
          className="bg-red-600 text-white px-3 py-1 rounded text-xs"
        >
          {updateAllMutation.isPending ? "Updating..." : "Update All"}
        </button>
      </div>

      {/* Scrollable container */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {rateChanges.map((s) => (
          <div
            key={s._id}
            className="flex justify-between bg-white p-2 rounded border text-sm"
          >
            <div>
              <strong>{s.name}</strong>
            </div>

            <div className="flex gap-3 items-center">
              <span className="text-gray-500">
                Your: {s.yourRate.toFixed(4)}
              </span>
              <span>→</span>
              <span className="font-semibold">
                Provider: {s.providerRate.toFixed(4)}
              </span>
              <span
                className={`text-xs ${
                  s.diff > 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {s.diff > 0 ? "+" : ""}
                {s.diff.toFixed(4)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateChangesPanel;
