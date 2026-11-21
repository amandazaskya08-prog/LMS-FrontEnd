
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  FileText,
  Download,
  Building2,
  Layers,
} from "lucide-react";

import ReportStats, {
  type ReportStatItem,
} from "./report-stats";
import BarChart from "./bar-chart";
import DonutChart from "./donut-chart";
import LineChart from "./line-chart";

import {
  chartColors,
  adminStudentsByFaculty,
  adminUsersByRole,
  adminEnrollmentsByCourse,
  adminMaterialsByType,
  adminMonthlyActiveUsers,
  lecturerMaterialsByType,
  lecturerDownloadsByMaterial,
  lecturerDownloadsTrend,
} from "../../src/data/reports-data";

import type { UserRole } from "../../src/models/types";

export default function ReportsDashboard({
  role,
}: {
  role: UserRole;
}) {
  const isAdmin = role === "admin";
  const isLecturer = role === "lecturer";

  const adminStats: ReportStatItem[] = [
    { label: "Total Students", value: 1248, icon: Users, color: "blue" },
    { label: "Active Users", value: 942, icon: UserCheck, color: "green" },
    {
      label: "Total Lecturers",
      value: 86,
      icon: GraduationCap,
      color: "purple",
    },
    { label: "Total Courses", value: 5, icon: BookOpen, color: "orange" },
    { label: "Total Materials", value: 7, icon: FileText, color: "blue" },
    { label: "Total Downloads", value: 613, icon: Download, color: "green" },
    { label: "Total Faculties", value: 3, icon: Building2, color: "purple" },
    { label: "Study Programs", value: 4, icon: Layers, color: "orange" },
  ];

  const lecturerStats: ReportStatItem[] = [
    { label: "My Courses", value: 1, icon: BookOpen, color: "blue" },
    { label: "My Students", value: 32, icon: Users, color: "green" },
    { label: "My Materials", value: 2, icon: FileText, color: "purple" },
    { label: "Total Downloads", value: 224, icon: Download, color: "orange" },
  ];

  const stats = isAdmin ? adminStats : lecturerStats;

  return (
    <div className="page-container">
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>
            {isAdmin
              ? "Reports & Statistics"
              : "My Teaching Reports"}
          </h1>

          <p>
            {isAdmin
              ? "University-wide analytics across users, courses, and materials."
              : "Analytics for your courses, students, and materials."}
          </p>
        </div>
      </div>

      {/* STATISTICS */}

      <ReportStats stats={stats} />

      {/* ADMIN CHARTS */}

      {isAdmin && (
        <>
          <div className="reports-grid">
            <section className="chart-card">
              <div className="chart-card-header">
                <h3>Students by Faculty</h3>
                <p>Distribution of enrolled students</p>
              </div>

              <BarChart
                data={adminStudentsByFaculty}
                color={chartColors.blue}
              />
            </section>

            <section className="chart-card">
              <div className="chart-card-header">
                <h3>Users by Role</h3>
                <p>Platform account breakdown</p>
              </div>

              <DonutChart data={adminUsersByRole} />
            </section>
          </div>

          <div className="reports-grid">
            <section className="chart-card">
              <div className="chart-card-header">
                <h3>Enrollments by Course</h3>
                <p>Registered students per course</p>
              </div>

              <BarChart
                data={adminEnrollmentsByCourse}
                color={chartColors.green}
              />
            </section>

            <section className="chart-card">
              <div className="chart-card-header">
                <h3>Materials by Type</h3>
                <p>Learning resource formats</p>
              </div>

              <DonutChart data={adminMaterialsByType} />
            </section>
          </div>

          <section className="chart-card full-width">
            <div className="chart-card-header">
              <h3>Monthly Active Users</h3>
              <p>Active accounts over the last 8 months</p>
            </div>

            <LineChart
              data={adminMonthlyActiveUsers}
              color={chartColors.blue}
            />
          </section>
        </>
      )}

      {/* LECTURER CHARTS */}

      {isLecturer && (
        <>
          <div className="reports-grid">
            <section className="chart-card">
              <div className="chart-card-header">
                <h3>My Materials by Type</h3>
                <p>Breakdown of your uploads</p>
              </div>

              <DonutChart data={lecturerMaterialsByType} />
            </section>

            <section className="chart-card">
              <div className="chart-card-header">
                <h3>Downloads by Material</h3>
                <p>Most accessed resources</p>
              </div>

              <BarChart
                data={lecturerDownloadsByMaterial}
                color={chartColors.purple}
              />
            </section>
          </div>

          <section className="chart-card full-width">
            <div className="chart-card-header">
              <h3>Downloads Trend</h3>
              <p>Monthly downloads over the last 8 months</p>
            </div>

            <LineChart
              data={lecturerDownloadsTrend}
              color={chartColors.purple}
            />
          </section>
        </>
      )}
    </div>
  );
}
