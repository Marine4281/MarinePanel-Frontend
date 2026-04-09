// src/components/AdminServiceTable/RateChangesPanel.jsx
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";

const QUERY_KEY = ["services"];

const RateChangesPanel = ({ services = [] }) => {
  const queryClient = useQueryClient();

  // ================= RATE HELPERS =================
  const getProviderRate = (s) =>
    Number(s.newRate ?? s.lastSyncedRate ?? s.rate ?? 0);

  const getYourRate = (s) => Number(s.rate ?? 0);

  // ================= RATE CHANGES =================
  const rateChanges = useMemo(() => {
    return services
      .map((s) => {
        const providerRate = getProviderRate(s);
        const yourRate = getYourRate(s);

        if (providerRate === yourRate) return null;

        return {
          ...s,
          providerRate,
          yourRate,
          diff: providerRate - yourRate,
        };
      })
      .filter(Boolean);
  }, [services]);

  // Helper to update cache regardless of structure
  const updateServicesCache = (updater) => {
    queryClient.setQueryData(QUERY_KEY, (oldData) => {
      if (!oldData) return oldData;

      // Paginated or wrapped data: { data: [...] }
      if (Array.isArray(oldData?.data)) {
        return {
          ...oldData,
          data: updater(oldData.data),
        };
      }

      // Simple array
      if (Array.isArray(oldData)) {
        return updater(oldData);
      }

      return oldData;
    });
  };

  // ================= SINGLE SYNC =================
  const syncMutation = useMutation({
    mutationFn: ({ id, rate }) =>
      API.put(`/admin/services/${id}`, {
        rate,
        lastSyncedRate: rate,
      }),

    onSuccess: (_, variables) => {
      toast.success("Rate synced");

      updateServicesCache((services) =>
        services.map((s) =>
          s._id === variables.id
            ? { ...s, rate: variables.rate, lastSyncedRate: variables.rate }
            : s
        )
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to sync rate"
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // ================= BULK SYNC =================
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

      updateServicesCache((services) =>
        services.map((s) => {
          const match = rateChanges.find((r) => r._id === s._id);
          if (!match) return s;

          return {
            ...s,
            rate: match.providerRate,
            lastSyncedRate: match.providerRate,
          };
        })
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Bulk update failed"
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // ================= UI =================
  if (!rateChanges.length) return null;

  return (
    <div className="mb-6 border rounded-xl p-4 bg-yellow-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-yellow-800">
          ⚠ Rate Changes ({rateChanges.length})
        </h2>

        <button
          onClick={() => updateAllMutation.mutate()}
          disabled={updateAllMutation.isPending}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
        >
          {updateAllMutation.isPending ? "Updating..." : "Update All"}
        </button>
      </div>

      {/* Scrollable List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {rateChanges.map((s) => (
          <div
            key={s._id}
            className="flex justify-between items-center bg-white p-3 rounded border text-sm"
          >
            {/* Service Name */}
            <div className="font-medium">{s.name}</div>

            {/* Rates */}
            <div className="flex gap-3 items-center">
              <span className="text-gray-500">
                Your: {s.yourRate.toFixed(4)}
              </span>
              <span>→</span>
              <span className="font-semibold">
                Provider: {s.providerRate.toFixed(4)}
              </span>

              {/* Difference */}
              <span
                className={`text-xs font-semibold ${
                  s.diff > 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {s.diff > 0 ? "+" : ""}
                {s.diff.toFixed(4)}
              </span>

              {/* Sync Button */}
              <button
                onClick={() =>
                  syncMutation.mutate({
                    id: s._id,
                    rate: s.providerRate,
                  })
                }
                disabled={syncMutation.isPending}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
              >
                {syncMutation.isPending ? "Syncing..." : "Sync"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateChangesPanel;
