
import type { TrendPoint } from "../../src/models/report";

export default function LineChart({
  data,
  color = "#3264a5",
}: {
  data: TrendPoint[];
  color?: string;
}) {
  const width = 320;
  const height = 160;
  const pad = 24;

  const values = data.map((point) => point.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const span = dataMax - dataMin || 1;
  const min = dataMin - span * 0.1;
  const max = dataMax + span * 0.1;
  const range = max - min || 1;

  const innerW = width - pad * 2;
  const innerH = height - pad * 2 - 18;
  const stepX =
    data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    x: pad + index * stepX,
    y: pad + innerH - ((point.value - min) / range) * innerH,
    label: point.label,
  }));

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    )
    .join(" ");

  const baseY = pad + innerH;

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(
    1
  )} ${baseY} L ${points[0].x.toFixed(1)} ${baseY} Z`;

  const gradientId = `area-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="line-chart"
      role="img"
      aria-label="Trend chart"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#${gradientId})`} />

      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((point) => (
        <g key={point.label}>
          <circle
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#ffffff"
            stroke={color}
            strokeWidth="2"
          />

          <text
            x={point.x}
            y={height - 5}
            textAnchor="middle"
            className="line-label"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
