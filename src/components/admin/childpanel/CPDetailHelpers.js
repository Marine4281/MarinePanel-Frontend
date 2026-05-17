// src/components/admin/childpanel/CPDetailHelpers.js

export const fmt = (v, d = 2) => Number(v || 0).toFixed(d);

export const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":  return "bg-green-100 text-green-700";
    case "processing": return "bg-blue-100 text-blue-700";
    case "pending":    return "bg-yellow-100 text-yellow-700";
    case "failed":     return "bg-red-100 text-red-700";
    case "refunded":   return "bg-purple-100 text-purple-700";
    default:           return "bg-gray-100 text-gray-600";
  }
};
