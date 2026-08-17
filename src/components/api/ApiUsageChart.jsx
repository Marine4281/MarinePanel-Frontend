// src/components/api/ApiUsageChart.jsx
import { useMemo, useState } from "react";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 220;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 26;

const ApiUsageChart = ({ timeSeries = [], loading }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { bars, maxValue } = useMemo(() => {
    if (!timeSeries.length) return { bars: [], maxValue: 0 };

    const max = Math.max(...timeSeries.map((d) => d.total), 1);
    const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const barWidth = innerWidth / timeSeries.length;

    const computed = timeSeries.map((d, i) => {
      const x = PADDING_LEFT + i * barWidth;
      const totalHeight = (d.total / max) * innerHeight;
      const errorHeight = d.total > 0 ? (d.errors / d.total) * totalHeight : 0;
      return {
        x,
        width: barWidth * 0.6,
        y: PADDING_TOP + innerHeight - totalHeight,
        height: totalHeight,
        errorHeight,
        date: d.date,
        total: d.total,
        errors: d.errors,
      };
    });

    return { bars: computed, maxValue: max };
  }, [timeSeries]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">API Calls (14 days)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Daily volume · red segment = errors</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" /> Calls
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Errors
          </span>
        </div>
      </div>

      <div className="h-56">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">Loading...</div>
        ) : bars.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            No API activity in this period
          </div>
        ) : (
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-full" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
              const y = PADDING_TOP + innerHeight - t * innerHeight;
              return (
                <g key={t}>
                  <line x1={PADDING_LEFT} x2={CHART_WIDTH - PADDING_RIGHT} y1={y} y2={y} stroke="#F3F4F6" strokeWidth="1" />
                  <text x={2} y={y + 3} fontSize="9" fill="#9CA3AF">
                    {Math.round(maxValue * t)}
                  </text>
                </g>
              );
            })}

            {bars.map((b, i) => (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                <rect x={b.x + b.width * 0.3} y={b.y} width={b.width} height={b.height} rx="2" fill="#f97316" opacity={hoverIndex === i ? 1 : 0.85} />
                {b.errorHeight > 0 && (
                  <rect
                    x={b.x + b.width * 0.3}
                    y={b.y + b.height - b.errorHeight}
                    width={b.width}
                    height={b.errorHeight}
                    rx="2"
                    fill="#dc2626"
                  />
                )}
                <rect x={b.x} y={PADDING_TOP} width={b.width * 1.6} height={CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM} fill="transparent" />

                {(bars.length <= 14 || i % 2 === 0) && (
                  <text x={b.x + b.width * 0.6} y={CHART_HEIGHT - 8} fontSize="9" fill="#9CA3AF" textAnchor="middle">
                    {b.date?.slice(5)}
                  </text>
                )}

                {hoverIndex === i && (
                  <g>
                    <rect x={Math.min(Math.max(b.x - 20, 0), CHART_WIDTH - 90)} y={b.y - 34} width="90" height="28" rx="6" fill="#111827" />
                    <text x={Math.min(Math.max(b.x + 25, 25), CHART_WIDTH - 45)} y={b.y - 20} fontSize="9" fill="#fff" textAnchor="middle">
                      {b.total} calls
                    </text>
                    <text x={Math.min(Math.max(b.x + 25, 25), CHART_WIDTH - 45)} y={b.y - 8} fontSize="9" fill="#f87171" textAnchor="middle">
                      {b.errors} errors
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
};

export default ApiUsageChart;
