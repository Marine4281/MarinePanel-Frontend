// src/components/AdminServiceTable/ServiceRow.jsx
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CommissionModal from "../CommissionModal";
import API from "../../api/axios";
import toast from "react-hot-toast";

const ServiceRow = ({
  service: s,
  selectedIds,
  toggleSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  setSelectedDescription,
  index,
  commission,         // global commission
  categoryCommissions, // { [category]: number }
  onCommissionSaved,  // () => void — refresh callback
}) => {

  const [showCommModal, setShowCommModal] = useState(false);

  // ================= RATE HELPERS =================
  const getProviderRate = (s) => Number(s.newRate ?? s.lastSyncedRate ?? s.rate ?? 0);
  const getYourRate = (s) => Number(s.rate ?? 0);

  const getDiffFormatted = (s) => {
    const diff = getProviderRate(s) - getYourRate(s);
    if (diff === 0) return null;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(4)}`;
  };

  // Effective commission: service > category > global
  const getEffectiveCommission = () => {
    if (s.commissionOverride != null) return s.commissionOverride;
    if (categoryCommissions?.[s.category] != null) return categoryCommissions[s.category];
    return commission;
  };

  const effectiveCommission = getEffectiveCommission();
  const hasServiceOverride = s.commissionOverride != null;
  const hasCategoryOverride = !hasServiceOverride && categoryCommissions?.[s.category] != null;

  const calculateFinalRate = (service, commissionPct) => {
    const base = getProviderRate(service);
    const pct = Number(commissionPct ?? 0);
    return (base + (base * pct) / 100).toFixed(4);
  };

  const providerRate = getProviderRate(s);
  const finalRate = calculateFinalRate(s, effectiveCommission);
  const diff = getDiffFormatted(s);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };

  const dateAdded = formatDate(s.createdAt ?? s.dateAdded ?? s.addedAt);
  const isEven = index % 2 === 0;

  const handleCommissionSave = async (value) => {
    await API.patch(`/admin/services/${s._id}/commission`, { commission: value });
    toast.success(value === null ? "Commission override cleared" : `Commission set to ${value}%`);
    onCommissionSaved?.();
  };

  return (
    <>
      <tr
        className={`border-b last:border-none transition-colors ${
          isEven ? "bg-white" : "bg-gray-50"
        } hover:bg-orange-50/40`}
      >
        {/* SELECT */}
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={selectedIds.includes(s._id)}
            onChange={() => toggleSelect(s._id)}
            className="accent-orange-500"
          />
        </td>

        {/* # */}
        <td className="px-3 py-2 text-gray-400 text-xs">{index + 1}</td>

        {/* ID + Date */}
        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
          <span>{s.serviceId || s._id?.slice(-6)}</span>
          {dateAdded && (
            <div className="text-[10px] text-gray-400 mt-0.5 leading-none">{dateAdded}</div>
          )}
        </td>

        {/* Platform */}
        <td className="px-3 py-2 text-xs text-gray-600">{s.platform}</td>

        {/* Name */}
        <td className="px-3 py-2 text-xs text-gray-800 font-medium min-w-[160px]">{s.name}</td>

        {/* Provider */}
        <td className="px-3 py-2 text-xs text-gray-600">{s.provider}</td>

        {/* Provider ID */}
        <td className="px-3 py-2 text-xs text-gray-500">{s.providerServiceId}</td>

        {/* Provider Rate */}
        <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
          {providerRate.toFixed(4)}
          {diff && (
            <span className={`ml-1 text-[10px] ${diff.startsWith("+") ? "text-red-500" : "text-green-600"}`}>
              ({diff})
            </span>
          )}
        </td>

        {/* Final Rate */}
        <td className="px-3 py-2 text-xs font-semibold text-orange-500 whitespace-nowrap">
          <span>${finalRate}</span>
          <div className="text-[10px] mt-0.5 leading-none flex items-center gap-1">
            {hasServiceOverride ? (
              <span className="text-purple-500 font-semibold">
                {effectiveCommission}% ✦ svc
              </span>
            ) : hasCategoryOverride ? (
              <span className="text-blue-500 font-semibold">
                {effectiveCommission}% ◆ cat
              </span>
            ) : (
              <span className="text-gray-400">+{effectiveCommission}% global</span>
            )}
          </div>
        </td>

        {/* Description */}
        <td className="px-3 py-2 text-center">
          <button
            onClick={() => setSelectedDescription(s.description || "No description")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] transition"
          >
            Info
          </button>
        </td>

        {/* Actions */}
        <td className="px-3 py-2">
          <div className="flex items-center gap-1 flex-wrap">

            {/* Visibility toggle */}
            <button
              onClick={() => onToggleStatus(s._id)}
              title={s.status ? "Hide service" : "Show service"}
              className={`flex items-center gap-1 px-2 py-[3px] rounded text-[10px] font-medium transition ${
                s.status
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              {s.status ? <><FiEye size={11} /> On</> : <><FiEyeOff size={11} /> Off</>}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(s)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] font-medium transition"
            >
              Edit
            </button>

            {/* CP toggle */}
<button
  onClick={async () => {
    try {
      const res = await API.patch(`/admin/services/${s._id}/toggle-cp`);
      toast.success(
        res.data.availableToChildPanels
          ? "Published to child panels"
          : "Hidden from child panels"
      );
      onCommissionSaved?.(); // reuse refresh callback
    } catch {
      toast.error("Failed to toggle");
    }
  }}
  title="Toggle child panel visibility"
  className={`px-2 py-[3px] rounded text-[10px] font-semibold transition ${
    s.availableToChildPanels
      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
  }`}
>
  CP
</button>

            {/* 💰 Commission */}
            <button
              onClick={() => setShowCommModal(true)}
              title="Set commission override"
              className={`px-2 py-[3px] rounded text-[10px] font-semibold transition ${
                hasServiceOverride
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {hasServiceOverride ? `${s.commissionOverride}%` : "💰"}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(s._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-[3px] rounded text-[10px] font-medium transition"
            >
              Del
            </button>

          </div>
        </td>
      </tr>

      {/* Commission Modal */}
      <CommissionModal
        isOpen={showCommModal}
        onClose={() => setShowCommModal(false)}
        mode="service"
        target={s}
        globalCommission={effectiveCommission}
        onSave={handleCommissionSave}
        accentColor="orange"
      />
    </>
  );
};

export default ServiceRow;
