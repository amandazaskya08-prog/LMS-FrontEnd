
import {
  FileText,
  CheckCircle,
  Download,
  BookOpen,
} from "lucide-react";

import type { Material } from "../../src/models/material";

export default function MaterialStats({
  materials,
}: {
  materials: Material[];
}) {
  const active = materials.filter(
    (material) => material.status === "active"
  ).length;

  const downloads = materials.reduce(
    (total, material) => total + material.downloads,
    0
  );

  const coursesCovered = new Set(
    materials.map((material) => material.courseId)
  ).size;

  const stats = [
    {
      label: "Total Materials",
      value: materials.length,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Active Materials",
      value: active,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Total Downloads",
      value: downloads,
      icon: Download,
      color: "purple",
    },
    {
      label: "Courses Covered",
      value: coursesCovered,
      icon: BookOpen,
      color: "orange",
    },
  ];

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
