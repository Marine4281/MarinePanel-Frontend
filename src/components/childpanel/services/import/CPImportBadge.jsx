// src/components/childpanel/services/import/CPImportBadge.jsx
export default function Badge({ children, color = "gray" }) {
  const map = {
    gray:   "bg-gray-100 text-gray-600",
    green:  "bg-green-100 text-green-700",
    blue:   "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}
