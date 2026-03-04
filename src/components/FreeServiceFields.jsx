import React from "react";

const FreeServiceFields = ({ form, handleChange }) => {
  if (!form.isFree) return null;

  return (
    <div className="p-4 mt-4 border rounded-lg bg-yellow-50">
      <h3 className="font-semibold mb-3 text-yellow-700">
        🎁 Free Service Settings
      </h3>

      {/* Max Quantity */}
      <div className="mb-3">
        <label className="block text-sm font-medium">
          Free Quantity (Max per claim) *
        </label>
        <input
          type="number"
          min="1"
          name="freeQuantity"
          value={form.freeQuantity || ""}
          onChange={handleChange}
          required={form.isFree}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Cooldown Hours */}
      <div>
        <label className="block text-sm font-medium">
          Cooldown Hours *
        </label>
        <input
          type="number"
          name="cooldownHours"
          placeholder="-1 = One Time Ever, 24 = Daily"
          value={form.cooldownHours || ""}
          onChange={handleChange}
          required={form.isFree}
          className="w-full p-2 border rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          -1 = One time ever, 24 = Daily, 168 = Weekly, 720 = Monthly
        </p>
      </div>
    </div>
  );
};

export default FreeServiceFields;
