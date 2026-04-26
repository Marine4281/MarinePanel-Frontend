// src/components/AdminServiceTable/ServiceRow.jsx
import { FiEye, FiEyeOff } from "react-icons/fi";

const ServiceRow = ({
  service: s,
  selectedIds,
  toggleSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  setSelectedDescription,
  index,
  commission,
}) => {

  // ================= RATE HELPERS =================
  const getProviderRate = (s) => {
    return Number(s.newRate ?? s.lastSyncedRate ?? s.rate ?? 0);
  };

  const getYourRate = (s) => {
    return Number(s.rate ?? 0);
  };

  const getDiffFormatted = (s) => {
    const diff = getProviderRate(s) - getYourRate(s);
    if (diff === 0) return null;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(4)}`;
  };

  const calculateFinalRate = (service, commissionPct) => {
    const base = getProviderRate(service);
    const pct = Number(commissionPct ?? 0);
    return (base + (base * pct) / 100).toFixed(4);
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
    <tr
      className={`border-b last:border-none transition-colors ${
        isEven ? "bg-white" : "bg-gray-50"
      } hover:bg-orange-50/40`}
    >

      {/* ✅ SELECT */}
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

      {/* 🆔 SYSTEM ID + DATE */}
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        <span>{s.serviceId || s._id?.slice(-6)}</span>
        {dateAdded && (
          <div className="text-[10px] text-gray-400 mt-0.5 leading-none">
            {dateAdded}
          </div>
        )}
      </td>

      {/* 📱 PLATFORM */}
      <td className="px-3 py-2 text-xs text-gray-600">{s.platform}</td>

      {/* 🧾 NAME */}
      <td className="px-3 py-2 text-xs text-gray-800 font-medium min-w-[160px]">
        {s.name}
      </td>

      {/* 🏢 PROVIDER */}
      <td className="px-3 py-2 text-xs text-gray-600">{s.provider}</td>

      {/* 🔗 PROVIDER ID */}
      <td className="px-3 py-2 text-xs text-gray-500">{s.providerServiceId}</td>

      {/* 💰 PROVIDER RATE */}
      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
        {providerRate.toFixed(4)}
        {diff && (
          <span
            className={`ml-1 text-[10px] ${
              diff.startsWith("+") ? "text-red-500" : "text-green-600"
            }`}
          >
            ({diff})
          </span>
        )}
      </td>

      {/* 💵 FINAL RATE */}
      <td className="px-3 py-2 text-xs font-semibold text-orange-500 whitespace-nowrap">
        <span>${finalRate}</span>
        {commission != null && (
          <div className="text-[10px] text-gray-400 mt-0.5 leading-none">
            +{commission}% fee
          </div>
        )}
      </td>

      {/* 📄 DESCRIPTION */}
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => setSelectedDescription(s.description || "No description")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] transition"
        >
          Info
        </button>
      </td>

      {/* ⚙ ACTIONS — Visibility + Edit + Delete */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">

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
            {s.status ? (
              <><FiEye size={11} /> On</>
            ) : (
              <><FiEyeOff size={11} /> Off</>
            )}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(s)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] font-medium transition"
          >
            Edit
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
  );
};

export default ServiceRow;
