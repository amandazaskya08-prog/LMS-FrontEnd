
import type { DonutSlice } from "../../src/models/report";

export default function DonutChart({
  data,
}: {
  data: DonutSlice[];
}) {
  const total = data.reduce(
    (sum, slice) => sum + slice.value,
    0
  );

  const safeTotal = total || 1;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // Compute each slice's arc length and starting offset up front,
  // so nothing is reassigned during render.

  const slices = data.reduce<
    {
      slice: DonutSlice;
      length: number;
      start: number;
    }[]
  >((acc, slice) => {
    const length = (slice.value / safeTotal) * circumference;
    const start = acc.length
      ? acc[acc.length - 1].start + acc[acc.length - 1].length
      : 0;

    return [...acc, { slice, length, start }];
  }, []);

  return (
    <div className="chart-with-legend">
      <svg
        viewBox="0 0 160 160"
        className="donut-chart"
        role="img"
        aria-label="Distribution chart"
      >
        <g transform="rotate(-90 80 80)">
          {slices.map(({ slice, length, start }) => (
            <circle
              key={slice.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="20"
              strokeDasharray={`${length} ${
                circumference - length
              }`}
              strokeDashoffset={-start}
            />
          ))}
        </g>

        <text
          x="80"
          y="75"
          textAnchor="middle"
          className="donut-total"
        >
          {total.toLocaleString()}
        </text>

        <text
          x="80"
          y="93"
          textAnchor="middle"
          className="donut-label"
        >
          Total
        </text>
      </svg>

      <ul className="chart-legend">
        {data.map((slice) => (
          <li key={slice.label}>
            <span
              className="legend-dot"
              style={{ background: slice.color }}
            />

            <span className="legend-label">{slice.label}</span>

            <span className="legend-value">
              {slice.value.toLocaleString()}
            </span>

            <span className="legend-pct">
              {Math.round((slice.value / safeTotal) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
