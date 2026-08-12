// src/components/RevenueTrendChart.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../api/axios";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
];

const RangeSubtitles = {
  today: "Showing today, by hour",
  week: "Showing this week, by day",
  month: "Showing this month, day by day",
  year: "Showing this year, by month",
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 260;
const PADDING_LEFT = 44;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

const RevenueTrendChart = ({ country = "All" }) => {
  const [range, setRange] = useState("week");
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);

  const fetchTrend = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/revenue-trend", {
        params: { range, country },
      });
      setLabels(Array.isArray(data?.labels) ? data.labels : []);
      setValues(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to fetch revenue trend", err);
      setLabels([]);
      setValues([]);
    } finally {
      setLoading(false);
    }
  }, [range, country]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  const { linePath, areaPath, points, maxValue } = useMemo(() => {
    if (!values.length) {
      return { linePath: "", areaPath: "", points: [], maxValue: 0 };
    }

    const max = Math.max(...values, 1);
    const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;

    const pts = values.map((v, i) => {
      const x = PADDING_LEFT + stepX * i;
      const y = PADDING_TOP + innerHeight - (v / max) * innerHeight;
      return { x, y, value: v, label: labels[i] };
    });

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area =
      pts.length > 0
        ? `${line} L${pts[pts.length - 1].x},${PADDING_TOP + innerHeight} L${pts[0].x},${
            PADDING_TOP + innerHeight
          } Z`
        : "";

    return { linePath: line, areaPath: area, points: pts, maxValue: max };
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
          <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">{RangeSubtitles[range]}</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                range === r.key
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
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
        ) : points.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            No revenue data for this range
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>

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
                  <text x={4} y={y + 3} fontSize="9" fill="#9CA3AF">
                    ${t.toLocaleString()}
                  </text>
                </g>
              );
            })}

            <path d={areaPath} fill="url(#revenueFill)" stroke="none" />
            <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.5" />

            {points.map((p, i) => (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverIndex === i ? 4 : 2.5}
                  fill="#f97316"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <rect
                  x={p.x - CHART_WIDTH / points.length / 2}
                  y={PADDING_TOP}
                  width={CHART_WIDTH / points.length}
                  height={CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM}
                  fill="transparent"
                />
                {points.length <= 14 || i % Math.ceil(points.length / 8) === 0 ? (
                  <text x={p.x} y={CHART_HEIGHT - 8} fontSize="9" fill="#9CA3AF" textAnchor="middle">
                    {p.label}
                  </text>
                ) : null}
                {hoverIndex === i && (
                  <g>
                    <rect
                      x={Math.min(Math.max(p.x - 32, 0), CHART_WIDTH - 64)}
                      y={p.y - 32}
                      width="64"
                      height="22"
                      rx="6"
                      fill="#111827"
                    />
                    <text
                      x={Math.min(Math.max(p.x, 32), CHART_WIDTH - 32)}
                      y={p.y - 17}
                      fontSize="10"
                      fill="#fff"
                      textAnchor="middle"
                    >
                      ${p.value.toLocaleString()}
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

export default RevenueTrendChart;
