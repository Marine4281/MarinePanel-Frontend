// src/components/childpanel/financial/CPFinancialUserBalances.jsx
import { Section, fmt } from "./CPFinancialShared";

export default function CPFinancialUserBalances({ users, loading, userPage, setUserPage, userTotal }) {
  return (
    <Section title={`User Balances — sorted by highest balance (${userTotal} total)`}>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">#</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Country</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400">No users found</td></tr>
                )}
                {users.map((u, i) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{(userPage - 1) * 20 + i + 1}</td>
                    <td className="py-2">
                      <p className="text-gray-800 font-medium">{u.email}</p>
                      <p className="text-xs text-gray-400">{u.phone}</p>
                    </td>
                    <td className="py-2 text-gray-500">{u.country}</td>
                    <td className="py-2">
                      {u.isReseller ? (
                        <span className="text-xs bg-blue-100 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">Reseller</span>
                      ) : (
                        <span className="text-xs text-gray-400">User</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-bold ${u.balance > 0 ? "text-green-600" : "text-gray-400"}`}>
                        ${fmt(u.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>{userTotal} users</span>
            <div className="flex gap-2">
              <button disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <span className="px-3 py-1">Page {userPage}</span>
              <button disabled={userPage * 20 >= userTotal} onClick={() => setUserPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}
