// src/components/admin/childpanel/CPDetailInfoCard.jsx

import { useState } from "react";
import { FiGlobe, FiUnlock } from "react-icons/fi";
import CPReopenModal from "./CPReopenModal";

export default function CPDetailInfoCard({ cp, onUpdate }) {
  const [showReopen, setShowReopen] = useState(false);

  const isSuspended =
    !cp.childPanelIsActive || cp.childPanelSubscriptionSuspended;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">
        Panel Info
      </h3>

      {/* Suspension banner */}
      {isSuspended && cp.childPanelSuspendReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
          <span className="font-semibold">Suspended:</span> {cp.childPanelSuspendReason}
        </div>
      )}

      {/* Reopen button — only when subscription-suspended */}
      {cp.childPanelSubscriptionSuspended && (
        <button
          onClick={() => setShowReopen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <FiUnlock size={14} />
          Reopen Subscription
        </button>
      )}

      <div className="space-y-2 text-sm">
        <InfoRow icon={<FiGlobe size={13} className="text-gray-400" />} label="Domain">
          {cp.childPanelDomain ||
            (cp.childPanelSlug ? `${cp.childPanelSlug}.marinepanel.online` : "—")}
        </InfoRow>

        <InfoRow label="Status">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            cp.childPanelIsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}>
            {cp.childPanelIsActive ? "Active" : "Suspended"}
          </span>
          {cp.childPanelSubscriptionSuspended && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              Sub. Expired
            </span>
          )}
        </InfoRow>

        <InfoRow label="Payment Mode">
          <span className="capitalize">{cp.childPanelPaymentMode || "—"}</span>
        </InfoRow>

        <InfoRow label="Service Mode">
          <span className="capitalize">{cp.childPanelServiceMode || "—"}</span>
        </InfoRow>

        <InfoRow label="Theme">
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: cp.childPanelThemeColor || "#1e40af" }}
            />
            <span className="text-xs font-mono text-gray-600">
              {cp.childPanelThemeColor || "—"}
            </span>
          </div>
        </InfoRow>

        <InfoRow label="Billing">
          <span className="capitalize">
            {cp.childPanelBillingMode || "—"}
            {cp.childPanelMonthlyFee  > 0 && <> · ${cp.childPanelMonthlyFee}/mo</>}
            {cp.childPanelPerOrderFee > 0 && <> · ${cp.childPanelPerOrderFee}/order</>}
          </span>
        </InfoRow>

        <InfoRow label="Activated">
          {cp.childPanelActivatedAt
            ? new Date(cp.childPanelActivatedAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })
            : "—"}
        </InfoRow>

        <InfoRow label="Last Billed">
          {cp.childPanelLastBilledAt
            ? new Date(cp.childPanelLastBilledAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })
            : "—"}
        </InfoRow>

        <InfoRow label="Next Billing">
          {cp.childPanelNextBilledAt ? (
            <span className={
              new Date(cp.childPanelNextBilledAt) < new Date()
                ? "text-red-600 font-semibold"
                : "text-gray-800"
            }>
              {new Date(cp.childPanelNextBilledAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          ) : "—"}
        </InfoRow>

        <InfoRow label="Withdraw Min">
          ${cp.childPanelWithdrawMin ?? 10}
        </InfoRow>

        <InfoRow label="Phone">
          {cp.phone || "—"}
        </InfoRow>
      </div>

      {showReopen && (
        <CPReopenModal
          cp={cp}
          onClose={() => setShowReopen(false)}
          onReopened={(patch) => {
            onUpdate(patch);
            setShowReopen(false);
          }}
        />
      )}
    </div>
  );
}

function InfoRow({ label, icon, children }) {
  return (
    <div className="flex items-center gap-2 flex-wrap min-h-[22px]">
      {icon}
      <span className="text-gray-500 shrink-0 min-w-[100px]">{label}:</span>
      <span className="font-semibold text-gray-800 break-all">{children}</span>
    </div>
  );
}
