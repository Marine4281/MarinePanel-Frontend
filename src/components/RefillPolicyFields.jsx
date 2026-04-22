const RefillPolicyFields = ({ form, handleChange }) => {
  if (!form.refillAllowed) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
      <h3 className="font-semibold text-sm">Refill Settings</h3>

      <select
        name="refillPolicy"
        value={form.refillPolicy || "30d"}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="30d">30 Days</option>
        <option value="60d">60 Days</option>
        <option value="90d">90 Days</option>
        <option value="365d">365 Days</option>
        <option value="lifetime">Lifetime</option>
        <option value="custom">Custom Days</option>
      </select>

      {form.refillPolicy === "custom" && (
        <input
          type="number"
          name="customRefillDays"
          placeholder="Enter number of days"
          value={form.customRefillDays || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      )}
    </div>
  );
};

export default RefillPolicyFields;
