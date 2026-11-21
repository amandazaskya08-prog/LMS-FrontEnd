
import type { BarDatum } from "../../src/models/report";

export default function BarChart({
  data,
  color = "#3264a5",
}: {
  data: BarDatum[];
  color?: string;
}) {
  const max = Math.max(
    ...data.map((item) => item.value),
    1
  );

  return (
    <div className="bar-chart-bars">
      {data.map((item) => (
        <div className="bar-col" key={item.label}>
          <div className="bar-value">
            {item.value.toLocaleString()}
          </div>

          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                height: `${(item.value / max) * 100}%`,
                background: color,
              }}
            />
          </div>

          <div className="bar-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
