
import type { LucideIcon } from "lucide-react";

export interface ReportStatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange";
}

export default function ReportStats({
  stats,
}: {
  stats: ReportStatItem[];
}) {
  return (
    <div className="user-stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className="user-stat-card" key={stat.label}>
            <div className={`user-stat-icon ${stat.color}`}>
              <Icon size={21} />
            </div>

            <div>
              <span>{stat.label}</span>
              <h2>{stat.value.toLocaleString()}</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}
