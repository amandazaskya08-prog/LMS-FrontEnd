import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div>
          <p className="stat-title">{title}</p>
          <h2>{value}</h2>
        </div>

        <div
          className="stat-icon"
          style={{ backgroundColor: color }}
        >
          <Icon size={22} />
        </div>
      </div>

      <p className="stat-description">{description}</p>
    </div>
  );
}