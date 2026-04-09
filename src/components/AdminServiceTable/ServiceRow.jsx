const ServiceRow = ({
  service: s,
  selectedIds,
  toggleSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  setSelectedDescription,
}) => {
  // ================= RATE HELPERS (same logic) =================
  const getProviderRate = (s) => {
    return Number(
      s.newRate ??
      s.lastSyncedRate ??
      s.rate ??
      0
    );
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

  const providerRate = getProviderRate(s);
  const diff = getDiffFormatted(s);

  return (
    <tr className="hover:bg-gray-50">
      
      {/* ✅ SELECT */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selectedIds.includes(s._id)}
          onChange={() => toggleSelect(s._id)}
        />
      </td>

      {/* 🆔 SYSTEM ID */}
      <td className="px-4 py-3 text-xs">
        {s.serviceId || s._id?.slice(-6)}
      </td>

      {/* 📱 PLATFORM */}
      <td className="px-4 py-3">{s.platform}</td>

      {/* 🧾 NAME */}
      <td className="px-4 py-3">{s.name}</td>

      {/* 🏢 PROVIDER */}
      <td className="px-4 py-3">{s.provider}</td>

      {/* 🔗 PROVIDER ID */}
      <td className="px-4 py-3">{s.providerServiceId}</td>

      {/* 💰 RATE */}
      <td className="px-4 py-3">
        {providerRate.toFixed(4)}

        {diff && (
          <span
            className={`ml-2 text-xs ${
              diff.startsWith("+")
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            ({diff})
          </span>
        )}
      </td>

      {/* 📄 DESCRIPTION */}
      <td className="px-4 py-3">
        <button
          onClick={() =>
            setSelectedDescription(
              s.description || "No description"
            )
          }
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
