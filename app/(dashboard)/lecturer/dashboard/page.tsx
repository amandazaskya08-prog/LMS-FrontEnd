import {
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  Clock,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

import StatCard from "../../../../components/ui/stat-card";
import PageHeader from "../../../../components/ui/page-header";

const statistics = [
  {
    title: "My Courses",
    value: "5",
    description: "Currently teaching",
    icon: BookOpen,
    color: "#DBEAFE",
  },
  {
    title: "Total Students",
    value: "185",
    description: "Across all courses",
    icon: Users,
    color: "#DCFCE7",
  },
  {
    title: "Active Quizzes",
    value: "3",
    description: "Currently available",
    icon: ClipboardList,
    color: "#F3E8FF",
  },
  {
    title: "Pending Grading",
    value: "24",
    description: "Submissions to review",
    icon: FileText,
    color: "#FEF3C7",
  },
];

const teachingCourses = [
  {
    code: "CS101",
    name: "Introduction to Programming",
    students: 45,
    semester: "Semester 1",
  },
  {
    code: "CS202",
    name: "Database Management",
    students: 40,
    semester: "Semester 2",
  },
  {
    code: "CS301",
    name: "Web Development",
    students: 35,
    semester: "Semester 3",
  },
];

const pendingTasks = [
  {
    title: "Programming Assignment",
    course: "CS101",
    submissions: 12,
  },
  {
    title: "Database Quiz",
    course: "CS202",
    submissions: 8,
  },
  {
    title: "Web Development Project",
    course: "CS301",
    submissions: 4,
  },
];

export default function LecturerDashboardPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard Dosen"
        description="Memantau performa mengajar dan aktifitas mahasiswa jauh lebih mudah."
      />

      <section className="welcome-banner">
        <div>
          <span className="welcome-label">
            LECTURER PORTAL
          </span>

          <h1>Welcome back, Dr. Budi! 👋</h1>

          <p>
            Here's an overview of your teaching activities.
          </p>

          <div className="welcome-meta">
            <span>
              <GraduationCap size={16} />
              Faculty of Computer Science
            </span>
          </div>
        </div>

        <div className="welcome-illustration">
          <BookOpen size={100} />
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
              <h2>My Teaching Courses</h2>
              <p>Your assigned courses.</p>
            </div>

            <a href="/courses" className="text-link">
              View all <ArrowRight size={16} />
            </a>
          </div>

          <div className="course-list">
            {teachingCourses.map((course) => (
              <div className="course-item" key={course.code}>
                <div className="course-icon">
                  <BookOpen size={21} />
                </div>

                <div className="course-info">
                  <span className="course-code">
                    {course.code}
                  </span>

                  <h3>{course.name}</h3>

                  <p>
                    {course.students} students · {course.semester}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Pending Submissions</h2>
              <p>Assignments requiring grading.</p>
            </div>
          </div>

          <div className="quiz-list">
            {pendingTasks.map((task) => (
              <div className="quiz-item" key={task.title}>
                <div className="quiz-icon">
                  <Clock size={21} />
                </div>

                <div className="quiz-info">
                  <h3>{task.title}</h3>

                  <p>{task.course}</p>

                  <span>
                    {task.submissions} submissions waiting
                  </span>
                </div>
              </div>
            ))}
          </div>

          <a href="/materials" className="view-all-button">
            View teaching activities
            <ArrowRight size={16} />
          </a>
        </section>
      </div>
    </div>
  );
}