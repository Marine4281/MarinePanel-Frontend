// src/components/AdminServiceTable/RateChangesPanel.jsx
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { QUERY_KEYS } from "../../constants/queryKeys";

const RateChangesPanel = ({ services = [] }) => {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null); // 🔥 track single loading

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

  // ================= SINGLE SYNC =================
  const syncMutation = useMutation({
    mutationFn: ({ id, rate }) =>
      API.put(`/admin/services/${id}`, {
        rate,
        lastSyncedRate: rate,
      }),

    onSuccess: () => {
      toast.success("Rate synced");
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to sync");
    },

    onSettled: () => {
      setActiveId(null);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICES],
      });
    },
  });

  // ================= BULK SYNC =================
  const updateAllMutation = useMutation({
    mutationFn: async () => {
      // 🔥 safer: sequential instead of Promise.all
      for (const s of rateChanges) {
        await API.put(`/admin/services/${s._id}`, {
          rate: s.providerRate,
          lastSyncedRate: s.providerRate,
        });
      }
    },

    onSuccess: () => {
      toast.success("All rates synced");
    },

    onError: () => {
      toast.error("Bulk update failed");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICES],
      });
    },
  });

  // ================= UI =================
  if (!rateChanges.length) return null;

  return (
    <div className="mb-6 border rounded-xl p-4 bg-yellow-50">

      {/* HEADER */}
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

      {/* LIST */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {rateChanges.map((s) => (
          <div
            key={s._id}
            className="flex justify-between items-center bg-white p-3 rounded border text-sm"
          >
            <div className="font-medium">{s.name}</div>

            <div className="flex gap-3 items-center">
              <span className="text-gray-500">
                Your: {s.yourRate.toFixed(4)}
              </span>

              <span>→</span>

              <span className="font-semibold">
                Provider: {s.providerRate.toFixed(4)}
              </span>

              <span
                className={`text-xs font-semibold ${
                  s.diff > 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {s.diff > 0 ? "+" : ""}
                {s.diff.toFixed(4)}
              </span>

              <button
                onClick={() => {
                  setActiveId(s._id);
                  syncMutation.mutate({
                    id: s._id,
                    rate: s.providerRate,
                  });
                }}
                disabled={activeId === s._id}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
              >
                {activeId === s._id ? "Syncing..." : "Sync"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateChangesPanel;
