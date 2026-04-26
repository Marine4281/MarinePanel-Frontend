import { useEffect, useState } from "react";

const ServiceRow = ({
  service: s,
  selectedIds,
  toggleSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  setSelectedDescription,
  index,
  commission, // ← pass this from parent (fetch once at page level)
}) => {
  // ================= RATE HELPERS =================
  const getProviderRate = (s) => {
    return Number(s.newRate ?? s.lastSyncedRate ?? s.rate ?? 0);
  };

  const getYourRate = (s) => {
    return Number(s.rate ?? 0);
  };

  const getDiffValue = (s) => {
    return getProviderRate(s) - getYourRate(s);
  };

  const getDiffFormatted = (s) => {
    const diff = getDiffValue(s);
    if (diff === 0) return null;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(4)}`;
  };

  // ================= FINAL RATE (providerRate + admin commission %) =================
  const calculateFinalRate = (service, commissionPct) => {
    const base = getProviderRate(service);
    const pct = Number(commissionPct ?? 0);
    const final = base + (base * pct) / 100;
    return final.toFixed(4);
  };

  const providerRate = getProviderRate(s);
  const finalRate = calculateFinalRate(s, commission);
  const diff = getDiffFormatted(s);

  // ================= DATE HELPER =================
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  const dateAdded = formatDate(s.createdAt ?? s.dateAdded ?? s.addedAt);

  // ================= ZEBRA =================
  const isEven = index % 2 === 0;

  return (
    <tr className={`${isEven ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>

      {/* ✅ SELECT */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selectedIds.includes(s._id)}
          onChange={() => toggleSelect(s._id)}
        />
      </td>

      {/* 🆔 SYSTEM ID + DATE */}
      <td className="px-4 py-3 text-xs">
        <span>{s.serviceId || s._id?.slice(-6)}</span>
        {dateAdded && (
          <div className="text-[10px] text-gray-400 mt-0.5 leading-none">
            {dateAdded}
          </div>
        )}
      </td>

      {/* 📱 PLATFORM */}
      <td className="px-4 py-3 text-xs">{s.platform}</td>

      {/* 🧾 NAME */}
      <td className="px-4 py-3 text-xs">{s.name}</td>

      {/* 🏢 PROVIDER */}
      <td className="px-4 py-3 text-xs">{s.provider}</td>

      {/* 🔗 PROVIDER ID */}
      <td className="px-4 py-3 text-xs">{s.providerServiceId}</td>

      {/* 💰 PROVIDER RATE */}
      <td className="px-4 py-3 text-xs">
        {providerRate.toFixed(4)}
        {diff && (
          <span
            className={`ml-2 text-xs ${
              diff.startsWith("+") ? "text-red-500" : "text-green-600"
            }`}
          >
            ({diff})
          </span>
        )}
      </td>

      {/* 💵 FINAL RATE (provider rate + commission %) */}
      <td className="px-4 py-3 text-xs font-medium text-indigo-600">
        <span>${finalRate}</span>
        {commission != null && (
          <div className="text-[10px] text-gray-400 mt-0.5 leading-none">
            +{commission}% fee
          </div>
        )}
      </td>

      {/* 📄 DESCRIPTION */}
      <td className="px-4 py-3">
        <button
          onClick={() => setSelectedDescription(s.description || "No description")}
          className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
        >
          View
        </button>
      </td>

      {/* 👁 STATUS */}
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 text-xs rounded-full text-white ${
            s.status ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {s.status ? "Visible" : "Hidden"}
        </span>
      </td>

      {/* ⚙ ACTIONS */}
      <td className="px-4 py-3 flex gap-2">
        <button
          onClick={() => onEdit(s)}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(s._id)}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        >
          {s.status ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => onDelete(s._id)}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ServiceRow;
