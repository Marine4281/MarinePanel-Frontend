// src/components/childpanel/services/CPServiceRow.jsx
// Single row in the CP admin-style service table.

import { FiEye, FiEyeOff, FiEdit2, FiTrash2 } from "react-icons/fi";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

export default function CPServiceRow({
  service: s,
  index,
  commission,
  selectedIds,
  toggleSelect,
  onEdit,
  onDelete,
  onToggle,
  onShowDesc,
}) {
  const isEven = index % 2 === 0;
  const base = Number(s.rate || 0);
  const finalRate = base + (base * (commission ?? 0)) / 100;
  const sourceBadge = s.source === "platform"
    ? { label: "Platform", cls: "bg-blue-100 text-blue-700" }
    : s.provider === "manual"
    ? { label: "Manual", cls: "bg-purple-100 text-purple-700" }
    : { label: s.provider || "Provider", cls: "bg-orange-100 text-orange-700" };

  return (
    <tr
      className={`border-b last:border-none transition-colors ${
        isEven ? "bg-white" : "bg-gray-50"
      } hover:bg-blue-50/40`}
    >
      {/* Checkbox */}
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={selectedIds.includes(s._id)}
          onChange={() => toggleSelect(s._id)}
          className="accent-blue-600"
        />
      </td>

      {/* # */}
      <td className="px-3 py-2 text-gray-400 text-xs">{index + 1}</td>

      {/* System ID */}
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        <span className="font-mono">{s.serviceId || s._id?.slice(-6)}</span>
        {s.createdAt && (
          <div className="text-[10px] text-gray-400 mt-0.5">
            {new Date(s.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "2-digit",
            })}
          </div>
        )}
      </td>

      {/* Platform */}
      <td className="px-3 py-2 text-xs text-gray-600">{s.platform}</td>

      {/* Service Name */}
      <td className="px-3 py-2 text-xs text-gray-800 font-medium min-w-[160px] max-w-[220px]">
        <span className="line-clamp-2">{s.name}</span>
      </td>

      {/* Source / Provider */}
      <td className="px-3 py-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sourceBadge.cls}`}>
          {sourceBadge.label}
        </span>
      </td>

      {/* Cost Rate (what CP pays) */}
      <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
        ${fmt(s.rate)}
      </td>

      {/* End-user Rate (cost + commission) */}
      <td className="px-3 py-2 text-xs font-semibold text-blue-600 whitespace-nowrap">
        <span>${fmt(finalRate)}</span>
        {commission > 0 && (
          <div className="text-[10px] text-gray-400 font-normal mt-0.5">
            +{commission}%
          </div>
        )}
      </td>

      {/* Min / Max */}
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        {s.min} / {s.max?.toLocaleString()}
      </td>

      {/* Description */}
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => onShowDesc(s.description || "No description")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-[3px] rounded text-[10px] transition"
        >
          Info
        </button>
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          {/* Toggle visibility */}
          <button
            onClick={() => onToggle(s._id)}
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-[3px] rounded text-[10px] font-medium transition"
          >
            <FiEdit2 size={10} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(s._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-[3px] rounded text-[10px] transition"
          >
            <FiTrash2 size={10} />
          </button>
        </div>
      </td>
    </tr>
  );
}
