// src/components/childpanel/services/CPServiceRow.jsx
import { FiEye, FiEyeOff, FiEdit2, FiTrash2, FiGift } from "react-icons/fi";

const fmt = (n, d = 4) => Number(n || 0).toFixed(d);

const SOURCE_BADGE = {
  platform: { label: "Platform", cls: "bg-blue-100 text-blue-700" },
  manual:   { label: "Manual",   cls: "bg-purple-100 text-purple-700" },
};

function getSourceBadge(s) {
  if (s.source === "platform") return SOURCE_BADGE.platform;
  if (s.provider === "manual") return SOURCE_BADGE.manual;
  return { label: s.provider || "Provider", cls: "bg-orange-100 text-orange-700" };
}

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
  const costRate  = Number(s.rate || 0);
  const finalRate = costRate + (costRate * (commission ?? 0)) / 100;
  const badge     = getSourceBadge(s);

  const defaultFlags = [
    s.isDefault && "Default",
    s.isDefaultCategoryGlobal && "Global",
    s.isDefaultCategoryPlatform && "Plt.Default",
  ].filter(Boolean);

  return (
    <tr className={`border-b last:border-none transition-colors ${isEven ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/30`}>

      {/* Checkbox */}
      <td className="px-3 py-2">
        <input type="checkbox" checked={selectedIds.includes(s._id)}
          onChange={() => toggleSelect(s._id)} className="accent-blue-600" />
      </td>

      {/* # */}
      <td className="px-3 py-2 text-gray-400 text-xs">{index + 1}</td>

      {/* ID + Date */}
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        <span className="font-mono">{s.serviceId || s._id?.slice(-6)}</span>
        {s.createdAt && (
          <div className="text-[10px] text-gray-400 mt-0.5">
            {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
          </div>
        )}
      </td>

      {/* Platform */}
      <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{s.platform}</td>

      {/* Name + badges */}
      <td className="px-3 py-2 min-w-[160px] max-w-[220px]">
        <div className="flex items-start gap-1 flex-wrap">
          {s.isFree && <FiGift size={11} className="text-yellow-500 flex-shrink-0 mt-0.5" />}
          <span className="text-xs font-medium text-gray-800 line-clamp-2">{s.name}</span>
        </div>
        {defaultFlags.length > 0 && (
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {defaultFlags.map((f) => (
              <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{f}</span>
            ))}
          </div>
        )}
      </td>

      {/* Source */}
      <td className="px-3 py-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </td>

      {/* Cost Rate */}
      <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
        {s.isFree ? <span className="text-yellow-600 font-semibold">FREE</span> : `$${fmt(costRate)}`}
        {s.refillAllowed && !s.isFree && (
          <div className="text-[10px] text-green-600 mt-0.5">
            Refill: {s.refillPolicy === "custom" ? `${s.customRefillDays}d` : s.refillPolicy}
          </div>
        )}
      </td>

      {/* End-user Rate */}
      <td className="px-3 py-2 text-xs font-semibold text-blue-600 whitespace-nowrap">
        {s.isFree
          ? <span className="text-yellow-500">Free</span>
          : <>
              <span>${fmt(finalRate)}</span>
              {commission > 0 && (
                <div className="text-[10px] text-gray-400 font-normal mt-0.5">+{commission}%</div>
              )}
            </>
        }
      </td>

      {/* Min / Max */}
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        {s.isFree
          ? <span className="text-xs text-gray-500">max {s.freeQuantity?.toLocaleString()}</span>
          : `${Number(s.min).toLocaleString()} / ${Number(s.max).toLocaleString()}`
        }
      </td>

      {/* Description */}
      <td className="px-3 py-2 text-center">
        <button onClick={() => onShowDesc(s.description || "No description")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-[3px] rounded text-[10px] transition">
          Info
        </button>
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button onClick={() => onToggle(s._id)}
            className={`flex items-center gap-1 px-2 py-[3px] rounded text-[10px] font-medium transition ${
              s.status ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}>
            {s.status ? <><FiEye size={11} /> On</> : <><FiEyeOff size={11} /> Off</>}
          </button>
          <button onClick={() => onEdit(s)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-[3px] rounded text-[10px] font-medium transition">
            <FiEdit2 size={10} />
          </button>
          <button onClick={() => onDelete(s._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-[3px] rounded text-[10px] transition">
            <FiTrash2 size={10} />
          </button>
        </div>
      </td>
    </tr>
  );
}
