// src/components/admin/childpanel/settings/CPTiersBuilder.jsx

import { FiPlus, FiTrash2 } from "react-icons/fi";

/**
 * Props
 *  tiers     { minOrders, maxOrders, fee }[]
 *  onChange  fn
 */
export default function CPTiersBuilder({ tiers, onChange }) {
  const add = () =>
    onChange([...tiers, { minOrders: 0, maxOrders: null, fee: 0 }]);

  const update = (i, field, val) =>
    onChange(
      tiers.map((t, idx) =>
        idx === i ? { ...t, [field]: val === "" ? null : Number(val) } : t
      )
    );

  const remove = (i) => onChange(tiers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {tiers.length === 0 && (
        <p className="text-xs text-gray-400 italic">
          No tiers — flat monthly fee will be used.
        </p>
      )}

      {tiers.map((t, i) => (
        <div
          key={i}
          className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-lg p-2 border"
        >
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Orders</span>
            <input
              type="number" min="0" value={t.minOrders}
              onChange={(e) => update(i, "minOrders", e.target.value)}
              className="w-16 border rounded px-1.5 py-1 text-xs focus:outline-none"
              placeholder="Min"
            />
            <span className="text-xs text-gray-400">–</span>
            <input
              type="number" min="0" value={t.maxOrders ?? ""}
              onChange={(e) =>
                update(i, "maxOrders", e.target.value === "" ? "" : e.target.value)
              }
              className="w-16 border rounded px-1.5 py-1 text-xs focus:outline-none"
              placeholder="Max (∞)"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Fee $</span>
            <input
              type="number" min="0" step="0.01" value={t.fee}
              onChange={(e) => update(i, "fee", e.target.value)}
              className="w-16 border rounded px-1.5 py-1 text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 ml-auto"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      ))}

      <button
        onClick={add}
        className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1"
      >
        <FiPlus size={12} /> Add tier
      </button>
    </div>
  );
      }
