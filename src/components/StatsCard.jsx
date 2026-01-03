const colors = {
  orange: "text-orange-500",
  blue: "text-blue-500",
  green: "text-green-500",
};

const StatsCard = ({ title, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold ${colors[color] || "text-gray-700"}`}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;