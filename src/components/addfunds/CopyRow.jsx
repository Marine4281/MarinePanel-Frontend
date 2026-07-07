import toast from "react-hot-toast";

const CopyRow = ({ label, value }) => (
  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
    <div className="flex-1">
      {label && <p className="text-[10px] text-gray-400">{label}</p>}
      <code className="text-sm font-bold text-gray-800">{value}</code>
    </div>
    <button
      onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied!"); }}
      className="text-xs text-orange-500 font-semibold hover:text-orange-600 shrink-0"
    >
      Copy
    </button>
  </div>
);

export default CopyRow;
