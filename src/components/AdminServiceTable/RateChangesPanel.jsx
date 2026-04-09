import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/axios";
import toast from "react-hot-toast";

const RateChangesPanel = ({ services }) => {
  const queryClient = useQueryClient();

  const getProviderRate = (s) =>
    Number(s.newRate ?? s.lastSyncedRate ?? s.rate ?? 0);

  const rateChanges = services
    .map((s) => {
      const providerRate = getProviderRate(s);
      const yourRate = Number(s.rate ?? 0);
      if (providerRate === yourRate) return null;

      return { ...s, providerRate, yourRate };
    })
    .filter(Boolean);

  const mutation = useMutation({
    mutationFn: ({ id, rate }) =>
      API.put(`/admin/services/${id}`, {
        rate,
        lastSyncedRate: rate,
      }),

    onSuccess: () => {
      toast.success("Rate synced");
      queryClient.invalidateQueries(["services"]);
    },
  });

  if (!rateChanges.length) return null;

  return (
    <div className="mb-6 bg-yellow-50 p-4 rounded-xl">
      <div className="flex justify-between mb-3">
        <h2>⚠ Rate Changes ({rateChanges.length})</h2>
      </div>

      {rateChanges.map((s) => (
        <div key={s._id} className="flex justify-between p-2 bg-white rounded">
          <strong>{s.name}</strong>

          <button
            onClick={() =>
              mutation.mutate({
                id: s._id,
                rate: s.providerRate,
              })
            }
            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
          >
            Sync
          </button>
        </div>
      ))}
    </div>
  );
};

export default RateChangesPanel;
