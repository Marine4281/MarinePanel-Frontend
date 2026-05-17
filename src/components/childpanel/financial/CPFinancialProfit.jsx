// src/components/childpanel/financial/CPFinancialProfit.jsx
import { StatCard, Section, MiniChart, CountryDropdown, RANGES, fmt } from "./CPFinancialShared";

export default function CPFinancialProfit({
  profitData, loading, range, setRange,
  country, setCountry,
  customStart, setCustomStart,
  customEnd, setCustomEnd,
  onApply,
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Date Range</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 bg-white"
          >
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {range === "custom" && (
          <>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Start</label>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                className="border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">End</label>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2" />
            </div>
          </>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Country</label>
          <CountryDropdown value={country} onChange={setCountry} />
        </div>

        <button
          onClick={onApply}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Apply
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : profitData ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Profit (Completed)" value={`$${fmt(profitData.profit)}`}       accent="green"  sub={`${profitData.commission}% commission`} />
            <StatCard label="Gross Revenue"       value={`$${fmt(profitData.grossRevenue)}`} accent="blue" />
            <StatCard label="Orders (Completed)"  value={profitData.totalOrders}              accent="cyan" />
            <StatCard label="Commission"          value={`${profitData.commission}%`}         accent="purple" />
          </div>

          <Section title="Daily Profit Breakdown">
            <MiniChart data={profitData.chart} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Orders</th>
                    <th className="pb-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.chart.map((d) => (
                    <tr key={d.date} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-gray-600">{d.date}</td>
                      <td className="py-2 text-right text-gray-500">{d.orders}</td>
                      <td className="py-2 text-right text-green-600 font-medium">${fmt(d.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
              }
