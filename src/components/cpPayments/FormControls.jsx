export function F({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}

export function I({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none bg-white border border-gray-300 focus:border-orange-400" />
  );
}

export function Toggle({ label, sublabel, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {sublabel && <p className="text-xs mt-0.5 text-gray-500">{sublabel}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-orange-500" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
