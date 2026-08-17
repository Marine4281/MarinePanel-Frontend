// src/components/api/ApiLeaderboardTab.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiAward } from "react-icons/fi";
import API from "../../api/axios";

const podiumStyle = [
  { order: 2, height: "h-24", bg: "bg-gray-200", text: "text-gray-600", medal: "🥈" },
  { order: 1, height: "h-32", bg: "bg-orange-100", text: "text-orange-600", medal: "🥇" },
  { order: 3, height: "h-20", bg: "bg-orange-50", text: "text-orange-500", medal: "🥉" },
];

const ApiLeaderboardTab = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/admin/api/leaderboard");
        setLeaderboard(Array.isArray(data?.leaderboard) ? data.leaderboard : []);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FiAward className="text-orange-500" /> Top API Users
        </h3>

        {loading ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">Loading...</div>
        ) : top3.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">No API orders yet</div>
        ) : (
          <div className="flex items-end justify-center gap-4">
            {podiumStyle.slice(0, top3.length === 1 ? 1 : top3.length === 2 ? 2 : 3).map((slot) => {
              const entry = top3[slot.order - 1];
              if (!entry) return null;
              return (
                <div key={slot.order} className="flex flex-col items-center w-32">
                  <span className="text-2xl mb-1">{slot.medal}</span>
                  <p className="text-sm font-semibold text-gray-800 truncate w-full text-center">{entry.username}</p>
                  <p className="text-xs text-gray-400 truncate w-full text-center mb-2">{entry.email}</p>
                  <div className={`w-full ${slot.height} ${slot.bg} rounded-t-xl flex items-start justify-center pt-2`}>
                    <span className={`text-lg font-bold ${slot.text}`}>{entry.orderCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Orders via API</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {rest.map((l, i) => (
                <tr key={l.userId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{i + 4}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.username}</div>
                    <div className="text-xs text-gray-400">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{l.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApiLeaderboardTab;
