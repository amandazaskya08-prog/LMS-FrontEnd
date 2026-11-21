import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  TrendingUp,
  UserCheck,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import StatCard from "../../../../components/ui/stat-card";
import PageHeader from "../../../../components/ui/page-header";

const statistics = [
  {
    title: "Total Students",
    value: "2,450",
    description: "Registered students",
    icon: Users,
    color: "#DBEAFE",
  },
  {
    title: "Total Lecturers",
    value: "125",
    description: "Active lecturers",
    icon: GraduationCap,
    color: "#DCFCE7",
  },
  {
    title: "Total Courses",
    value: "86",
    description: "Available courses",
    icon: BookOpen,
    color: "#F3E8FF",
  },
  {
    title: "Pending UKT",
    value: "145",
    description: "Payments awaiting verification",
    icon: Wallet,
    color: "#FEF3C7",
  },
];

const recentActivities = [
  {
    title: "New student registered",
    description: "A new student account was created.",
    time: "10 minutes ago",
  },
  {
    title: "New course created",
    description: "Web Development has been added.",
    time: "1 hour ago",
  },
  {
    title: "UKT payment submitted",
    description: "A student submitted payment proof.",
    time: "3 hours ago",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor and manage your university learning platform."
      />

      <section className="welcome-banner">
        <div>
          <span className="welcome-label">
            ADMINISTRATION PANEL
          </span>

          <h1>Welcome, Administrator! 👋</h1>

          <p>
            Here's what's happening across your university today.
          </p>

          <div className="welcome-meta">
            <span>
              <TrendingUp size={16} />
              University Overview
            </span>
          </div>
        </div>

        <div className="welcome-illustration">
          <GraduationCap size={100} />
        </div>
      </section>

      <section className="stats-grid">
        {statistics.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Recent Activities</h2>
              <p>Latest university activities.</p>
            </div>

            <TrendingUp size={20} color="#234b8c" />
          </div>

          <div className="course-list">
            {recentActivities.map((activity) => (
              <div className="course-item" key={activity.title}>
                <div className="course-icon">
                  <UserCheck size={21} />
                </div>

                <div className="course-info">
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>

                  <span className="progress-label">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Academic Overview</h2>
              <p>Current academic period.</p>
            </div>

            <CalendarDays size={20} color="#234b8c" />
          </div>

          <div className="academic-details admin-details">
            <div>
              <span>Academic Year</span>
              <strong>2026/2027</strong>
            </div>

            <div>
              <span>Semester</span>
              <strong>Odd Semester</strong>
            </div>

            <div>
              <span>Faculties</span>
              <strong>8</strong>
            </div>

            <div>
              <span>Active Programs</span>
              <strong>24</strong>
            </div>
          </div>

          <div className="admin-notice">
            <Wallet size={20} />

            <div>
              <strong>145 UKT payments pending</strong>
              <p>Payment verification requires attention.</p>
            </div>

            <ArrowUpRight size={17} />
          </div>
        </section>
      </div>
    </div>
  );
}