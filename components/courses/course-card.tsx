
import {
  BookOpen,
  Users,
  GraduationCap,
  Pencil,
  Eye,
} from "lucide-react";

import type { Course } from "../../src/models/course";

export default function CourseCard({
  course,
  facultyName,
  programName,
  onView,
  onEdit,
  canEdit,
}: {
  course: Course;
  facultyName: string;
  programName: string;
  onView: () => void;
  onEdit: () => void;
  canEdit: boolean;
}) {
  return (
    <article className="course-card">
      <div className="course-card-top">
        <div className="course-card-icon">
          <BookOpen size={23} />
        </div>

        <span className={`status-badge ${course.status}`}>
          <span />
          {course.status}
        </span>
      </div>

      <span className="course-code">{course.code}</span>

      <h3>{course.name}</h3>

      <p className="course-description">
        {course.description}
      </p>

      <div className="course-information">
        <div>
          <GraduationCap size={16} />
          <span>{programName}</span>
        </div>

        <div>
          <BookOpen size={16} />
          <span>{facultyName}</span>
        </div>

        <div>
          <Users size={16} />
          <span>{course.lecturerName}</span>
        </div>
      </div>

      <div className="course-card-bottom">
        <span>
          {course.credits} SKS · Semester {course.semester}
        </span>

        <span>
          {course.enrolledStudents}/{course.maxStudents} students
        </span>
      </div>

      <div className="course-capacity">
        <div
          style={{
            width: `${Math.min(
              100,
              (course.enrolledStudents / Math.max(1, course.maxStudents)) * 100
            )}%`,
          }}
        />
      </div>

      <div className="course-card-actions">
        <button onClick={onView} className="secondary-action">
          <Eye size={16} />
          Details
        </button>

        {canEdit && (
          <button onClick={onEdit} className="primary-action">
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>
    </article>
  );
}
