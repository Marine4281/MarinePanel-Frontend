// src/components/api/ApiStatCard.jsx
const colorMap = {
  orange: "bg-orange-50 text-orange-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
};

const ApiStatCard = ({ icon: Icon, label, value, color = "orange", loading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${colorMap[color]}`}>
      <Icon />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-6 w-16 bg-gray-100 rounded animate-pulse mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      )}
    </div>
  </div>
);

export default ApiStatCard;
