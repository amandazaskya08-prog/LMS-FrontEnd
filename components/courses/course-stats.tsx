
import {
  BookOpen,
  Users,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

import type { Course } from "../../src/models/course";

export default function CourseStats({
  courses,
}: {
  courses: Course[];
}) {
  const active = courses.filter(
    (course) => course.status === "active"
  ).length;

  const students = courses.reduce(
    (total, course) => total + course.enrolledStudents,
    0
  );

  const capacity = courses.reduce(
    (total, course) => total + course.maxStudents,
    0
  );

  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "blue",
    },
    {
      label: "Active Courses",
      value: active,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Enrolled Students",
      value: students,
      icon: Users,
      color: "purple",
    },
    {
      label: "Available Seats",
      value: Math.max(0, capacity - students),
      icon: GraduationCap,
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
