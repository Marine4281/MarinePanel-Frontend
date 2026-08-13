// src/components/reseller/ResellerOrderVolumeChart.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../api/axios";

const RANGES = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
];

const RangeSubtitles = {
  week: "Showing this week, by day",
  month: "Showing this month, day by day",
  year: "Showing this year, by month",
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 260;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

const ResellerOrderVolumeChart = () => {
  const [range, setRange] = useState("week");
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);

  const fetchTrend = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/reseller/order-volume-trend", {
        params: { range },
      });
      setLabels(Array.isArray(data?.labels) ? data.labels : []);
      setValues(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to fetch order volume trend", err);
      setLabels([]);
      setValues([]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  const { bars, maxValue } = useMemo(() => {
    if (!values.length) return { bars: [], maxValue: 0 };

    const max = Math.max(...values, 1);
    const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const slot = innerWidth / values.length;
    const barWidth = Math.min(slot * 0.55, 34);

    const b = values.map((v, i) => {
      const h = (v / max) * innerHeight;
      const x = PADDING_LEFT + slot * i + (slot - barWidth) / 2;
      const y = PADDING_TOP + innerHeight - h;
      return { x, y, width: barWidth, height: h, value: v, label: labels[i], slotX: PADDING_LEFT + slot * i, slot };
    });

    return { bars: b, maxValue: max };
  }, [values, labels]);

  const tickCount = 4;
  const yTicks = useMemo(() => {
    if (!maxValue) return [];
    return Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxValue / tickCount) * i));
  }, [maxValue]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Order Volume</h3>
          <p className="text-xs text-gray-400 mt-0.5">{RangeSubtitles[range]}</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                range === r.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : bars.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            No orders for this range
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {yTicks.map((t, i) => {
              const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
              const y = PADDING_TOP + innerHeight - (t / (maxValue || 1)) * innerHeight;
              return (
                <g key={i}>
                  <line
                    x1={PADDING_LEFT}
                    x2={CHART_WIDTH - PADDING_RIGHT}
                    y1={y}
                    y2={y}
                    stroke="#F3F4F6"
                    strokeWidth="1"
                  />
                  <text x={2} y={y + 3} fontSize="9" fill="#9CA3AF">
                    {t.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {bars.map((b, i) => (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                <rect x={b.slotX} y={PADDING_TOP} width={b.slot} height={CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM} fill="transparent" />
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.width}
                  height={Math.max(b.height, 1)}
                  rx="4"
                  fill={hoverIndex === i ? "#ea580c" : "#f97316"}
                />
                {bars.length <= 14 || i % Math.ceil(bars.length / 8) === 0 ? (
                  <text
                    x={b.slotX + b.slot / 2}
                    y={CHART_HEIGHT - 8}
                    fontSize="9"
                    fill="#9CA3AF"
                    textAnchor="middle"
                  >
                    {b.label}
                  </text>
                ) : null}
                {hoverIndex === i && (
                  <g>
                    <rect
                      x={Math.min(Math.max(b.x + b.width / 2 - 30, 0), CHART_WIDTH - 60)}
                      y={b.y - 26}
                      width="60"
                      height="20"
                      rx="6"
                      fill="#111827"
                    />
                    <text
                      x={Math.min(Math.max(b.x + b.width / 2, 30), CHART_WIDTH - 30)}
                      y={b.y - 12}
                      fontSize="10"
                      fill="#fff"
                      textAnchor="middle"
                    >
                      {b.value} orders
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

export default ResellerOrderVolumeChart;
