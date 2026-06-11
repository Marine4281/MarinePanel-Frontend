import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { Field, SaveBtn } from "./SettingsShared";

export default function FeesTab({ settings, onSaved }) {
  const [activationFee, setActivationFee] = useState(settings.resellerActivationFee ?? 25);
  const [withdrawMin,   setWithdrawMin]   = useState(settings.withdrawMin           ?? 10);
  const [loading,       setLoading]       = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/reseller-fees", {
        resellerActivationFee: Number(activationFee),
        withdrawMin:           Number(withdrawMin),
      });
      toast.success("Fees updated");
      onSaved({
        resellerActivationFee: Number(activationFee),
        withdrawMin:           Number(withdrawMin),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save fees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Read-only billing info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Billing (set by platform — read only)
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500">Mode: </span>
            <span className="font-semibold capitalize text-gray-800">
              {settings.billingMode || "—"}
            </span>
          </div>
          {(settings.billingMode === "monthly" || settings.billingMode === "both") && (
            <div>
              <span className="text-gray-500">Monthly Fee: </span>
              <span className="font-semibold text-gray-800">${settings.monthlyFee ?? 0}</span>
            </div>
          )}
          {(settings.billingMode === "per_order" || settings.billingMode === "both") && (
            <div>
              <span className="text-gray-500">Per-Order Fee: </span>
              <span className="font-semibold text-gray-800">${settings.perOrderFee ?? 0}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Your Commission: </span>
            <span className="font-semibold text-green-600">{settings.commissionRate ?? 0}%</span>
          </div>
        </div>
      </div>

      <Field
        label="Reseller Activation Fee"
        hint="Fee you charge when a user activates as a reseller on your panel"
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={activationFee}
            onChange={(e) => setActivationFee(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </Field>

      <Field
        label="Minimum Withdrawal"
        hint="Minimum amount your panel wallet must reach before you can withdraw"
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={withdrawMin}
            onChange={(e) => setWithdrawMin(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}
