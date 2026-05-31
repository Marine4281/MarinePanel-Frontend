// src/components/AdminServiceTable/CategoryHeader.jsx
import { useState } from "react";
import CommissionModal from "../CommissionModal";
import API from "../../api/axios";
import toast from "react-hot-toast";

function CPCategoryToggle({ category, items, onDone }) {
  const allEnabled  = items.every((s) => s.availableToChildPanels);
  const someEnabled = items.some((s) => s.availableToChildPanels);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      await API.patch("/admin/services/category-toggle-cp", {
        category,
        available: !allEnabled,
      });
      toast.success(
        !allEnabled
          ? `"${category}" published to child panels`
          : `"${category}" hidden from child panels`
      );
      onDone?.();
    } catch {
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title="Toggle child panel visibility for entire category"
      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition border disabled:opacity-60 ${
        allEnabled
          ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
          : someEnabled
          ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200"
          : "bg-white text-gray-400 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {loading ? "..." : allEnabled ? "CP ✓" : someEnabled ? "CP ~" : "CP Off"}
    </button>
  );
}

const CategoryHeader = ({
  category,
  items,
  toggleSelectCategory,
  children,
  globalCommission,
  categoryCommissions,
  onCommissionSaved,
}) => {
  const [showModal, setShowModal] = useState(false);

  const currentOverride = categoryCommissions?.[category] ?? null;

  const handleSave = async (value) => {
    await API.patch("/admin/services/category-commissions", {
      category,
      commission: value,
    });
    toast.success(
      value === null
        ? `Category "${category}" commission cleared`
        : `Category "${category}" commission set to ${value}%`
    );
    onCommissionSaved?.();
  };

  return (
    <>
      <tr className="bg-gray-200">
        <td className="px-4 py-3">
          <input type="checkbox" onChange={() => toggleSelectCategory(items)} />
        </td>

        <td colSpan="9" className="px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold">
              📦 {category} ({items.length})
            </span>

            {/* Category Commission Badge/Button */}
            <button
              onClick={() => setShowModal(true)}
              title={`Set commission for all "${category}" services`}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition border ${
                currentOverride != null
                  ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              💰
              {currentOverride != null
                ? `${currentOverride}% (cat override)`
                : "Set Category %"}
            </button>

            {/* CP toggle for entire category */}
            <CPCategoryToggle
              category={category}
              items={items}
              onDone={onCommissionSaved}
            />
          </div>
        </td>
      </tr>

      {children}

      <CommissionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode="category"
        target={{ name: category, currentOverride }}
        globalCommission={globalCommission}
        onSave={handleSave}
        accentColor="orange"
      />
    </>
  );
};

export default CategoryHeader;
