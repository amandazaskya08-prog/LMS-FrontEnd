import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  ArrowRight,
  Clock,
  CalendarDays,
} from "lucide-react";

import StatCard from "../../../components/ui/stat-card";
import { courses, quizzes, currentUser } from "../../../src/data/mock-data";

export default function DashboardPage() {
  const upcomingQuizzes = quizzes.filter(
    (quiz) => quiz.status === "upcoming"
  );

  return (
    <div className="page-container">
      <section className="welcome-banner">
        <div>
          <span className="welcome-label">STUDENT DASHBOARD</span>

          <h1>Hello, {currentUser.name.split(" ")[0]}! 👋</h1>

          <p>
            Here's an overview of your academic activities.
          </p>

          <div className="welcome-meta">
            <span>
              <GraduationCap size={16} />
              {currentUser.studyProgram}
            </span>

            <span>
              <CalendarDays size={16} />
              Academic Year 2026/2027
            </span>
          </div>
        </div>

        <div className="welcome-illustration">
          <GraduationCap size={100} strokeWidth={1.2} />
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          title="Enrolled Courses"
          value={courses.length}
          description="Currently registered"
          icon={BookOpen}
          color="#DBEAFE"
        />

        <StatCard
          title="Completed Quizzes"
          value="8"
          description="This semester"
          icon={ClipboardCheck}
          color="#DCFCE7"
        />

        <StatCard
          title="Academic Progress"
          value="78%"
          description="Overall progress"
          icon={GraduationCap}
          color="#F3E8FF"
        />

        <StatCard
          title="UKT Status"
          value="Pending"
          description="Payment required"
          icon={Wallet}
          color="#FEF3C7"
        />
      </section>

      <div className="dashboard-grid">
        <section className="content-card courses-card">
          <div className="section-heading">
            <div>
              <h2>My Courses</h2>
              <p>Continue your learning journey.</p>
            </div>

            <a href="/courses" className="text-link">
              View all <ArrowRight size={16} />
            </a>
          </div>

          <div className="course-list">
            {courses.slice(0, 3).map((course) => (
              <div className="course-item" key={course.id}>
                <div
                  className="course-icon"
                  style={{ background: course.color }}
                >
                  <BookOpen size={22} />
                </div>

                <div className="course-info">
                  <span className="course-code">{course.code}</span>
                  <h3>{course.name}</h3>
                  <p>{course.lecturer}</p>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <span className="progress-label">
                    {course.progress}% completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-card quiz-card">
          <div className="section-heading">
            <div>
              <h2>Upcoming Quizzes</h2>
              <p>Don't miss your deadlines.</p>
            </div>
          </div>

          <div className="quiz-list">
            {upcomingQuizzes.map((quiz) => (
              <div className="quiz-item" key={quiz.id}>
                <div className="quiz-icon">
                  <ClipboardCheck size={21} />
                </div>

                <div className="quiz-info">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.course}</p>

                  <span>
                    <Clock size={14} />
                    {quiz.duration} minutes
                  </span>

                  <small>Deadline: {quiz.deadline}</small>
                </div>
              </div>
            ))}
          </div>

          <a href="/quizzes" className="view-all-button">
            View all quizzes <ArrowRight size={16} />
          </a>
        </section>
      </div>

      <section className="content-card activity-card">
        <div className="section-heading">
          <div>
            <h2>Academic Information</h2>
            <p>Your current academic details.</p>
          </div>
        </div>

        <div className="academic-details">
          <div>
            <span>Student ID</span>
            <strong>{currentUser.studentId}</strong>
          </div>

          <div>
            <span>Faculty</span>
            <strong>{currentUser.faculty}</strong>
          </div>

          <div>
            <span>Study Program</span>
            <strong>{currentUser.studyProgram}</strong>
          </div>

          <div>
            <span>Academic Year</span>
            <strong>2026/2027</strong>
          </div>
        </div>
      </section>
    </div>
  );
}