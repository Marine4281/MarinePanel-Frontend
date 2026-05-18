// src/components/admin/childpanel/settings/CPSettingsHelpers.js

export const INTERVAL_PRESETS = [1, 7, 14, 30, 45, 60, 90];

export const fmt = (v, d = 2) => Number(v || 0).toFixed(d);

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

/** Returns { label, colorClass } for a next-bill date */
export function billingStatus(nextBilledAt) {
  if (!nextBilledAt) return null;
  const days = Math.ceil((new Date(nextBilledAt) - Date.now()) / 86_400_000);
  if (days < 0)
    return { label: `Expired ${Math.abs(days)}d ago`, colorClass: "bg-red-100 text-red-600" };
  if (days === 0)
    return { label: "Due today", colorClass: "bg-amber-100 text-amber-700" };
  if (days <= 3)
    return { label: `Due in ${days}d`, colorClass: "bg-amber-100 text-amber-700" };
  return {
    label: `Due ${fmtDate(nextBilledAt)} (${days}d)`,
    colorClass: "bg-green-100 text-green-700",
  };
}
