export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="text-2xl text-orange-500">{icon}</div>
    </div>
  );
}
