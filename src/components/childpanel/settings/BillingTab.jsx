// src/components/childpanel/settings/BillingTab.jsx
import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";

export default function BillingTab({ settings, onSaved }) {
  const [loading, setLoading] = useState(false);

  const nextBilledAt   = settings?.nextBilledAt ? new Date(settings.nextBilledAt) : null;
  const now            = new Date();
  const isSuspended    = settings?.subscriptionSuspended;
  const daysUntil      = nextBilledAt
    ? Math.ceil((nextBilledAt - now) / (1000 * 60 * 60 * 24))
    : null;
  const isDue          = nextBilledAt && now >= nextBilledAt;
  const reminderHours  = settings?.reminderHours ?? 48;
  const reminderThresh = nextBilledAt
    ? new Date(nextBilledAt.getTime() - reminderHours * 60 * 60 * 1000)
    : null;
  const showReminder   = reminderThresh && now >= reminderThresh && !isDue && !isSuspended;

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const res = await API.post("/cp/settings/pay-fee");
      toast.success(res.data.message);
      onSaved({
        nextBilledAt:          res.data.nextBilledAt,
        subscriptionSuspended: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoDeduct = async () => {
    const newVal = !(settings?.autoDeduct ?? true);
    try {
      await API.post("/cp/settings/auto-deduct", { autoDeduct: newVal });
      toast.success(`Auto-deduct ${newVal ? "enabled" : "disabled"}`);
      onSaved({ autoDeduct: newVal });
    } catch {
      toast.error("Failed to update auto-deduct");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-800">Billing</h2>
        <p className="text-sm text-gray-500">Your panel subscription and fee information</p>
      </div>

      {/* Suspension banner */}
      {isSuspended && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Panel suspended — fee overdue</p>
            <p className="text-xs text-red-600 mt-1">
              Your panel has been suspended due to unpaid billing. Pay now to restore access immediately.
            </p>
          </div>
        </div>
      )}

      {/* Reminder banner */}
      {showReminder && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <FiClock className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="text-sm font-semibold text-amber-700">
              Billing due in {daysUntil !== null ? `${daysUntil} day${daysUntil !== 1 ? "s" : ""}` : "soon"}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Your next fee is due on {nextBilledAt?.toLocaleDateString()}. Make sure your wallet has enough balance.
            </p>
          </div>
        </div>
      )}

      {/* Status card */}
      <div className="border rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Billing mode</span>
          <span className="font-medium capitalize">{settings?.billingMode || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monthly fee</span>
          <span className="font-medium">${settings?.monthlyFee ?? "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Next billing date</span>
          <span className="font-medium">
            {nextBilledAt ? nextBilledAt.toLocaleDateString() : "Not set"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last billed</span>
          <span className="font-medium">
            {settings?.lastBilledAt
              ? new Date(settings.lastBilledAt).toLocaleDateString()
              : "Never"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className={`font-medium ${isSuspended ? "text-red-600" : isDue ? "text-amber-600" : "text-green-600"}`}>
            {isSuspended ? "Suspended" : isDue ? "Overdue" : "Active"}
          </span>
        </div>
      </div>

      {/* Pay now button — show when due or suspended */}
      {(isDue || isSuspended) && (
        <button
          onClick={handlePayNow}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition"
        >
          {loading ? "Processing..." : "Pay Fee Now from Wallet"}
        </button>
      )}

      {/* Auto-deduct toggle */}
      <div className="flex items-center justify-between p-4 border rounded-xl">
        <div>
          <p className="text-sm font-medium text-gray-800">Auto-deduct fee from wallet</p>
          <p className="text-xs text-gray-500 mt-0.5">
            When enabled, your billing fee is automatically deducted on the due date.
            Turn off if you prefer to pay manually.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleAutoDeduct}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4 ${
            (settings?.autoDeduct ?? true) ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            (settings?.autoDeduct ?? true) ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
      </div>
    </div>
  );
          }
