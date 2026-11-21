
"use client";

import {
  X,
  BookOpen,
  GraduationCap,
  Users,
  CalendarDays,
  Trash2,
} from "lucide-react";

import type { Course } from "../../src/models/course";

export default function CourseDetails({
  course,
  facultyName,
  programName,
  onClose,
  onDelete,
}: {
  course: Course;
  facultyName: string;
  programName: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="user-form-modal course-details-modal">

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <div className="modal-heading-icon">
              <BookOpen size={21} />
            </div>

            <h2>{course.name}</h2>
            <p>{course.code}</p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* DESCRIPTION */}
        <p className="course-details-description">
          {course.description}
        </p>

        {/* COURSE INFORMATION */}
        <div className="course-detail-grid">

          <div>
            <GraduationCap size={19} />
            <span>Faculty</span>
            <strong>{facultyName}</strong>
          </div>

          <div>
            <BookOpen size={19} />
            <span>Study Program</span>
            <strong>{programName}</strong>
          </div>

          <div>
            <Users size={19} />
            <span>Lecturer</span>
            <strong>{course.lecturerName}</strong>
          </div>

          <div>
            <CalendarDays size={19} />
            <span>Academic Year</span>
            <strong>{course.academicYear}</strong>
          </div>

          <div>
            <BookOpen size={19} />
            <span>Semester</span>
            <strong>{course.semester}</strong>
          </div>

          <div>
            <GraduationCap size={19} />
            <span>Credits</span>
            <strong>{course.credits} SKS</strong>
          </div>

        </div>

        {/* ENROLLMENT */}
        <div className="course-detail-enrollment">
          <div>
            <span>Student Enrollment</span>

            <strong>
              {course.enrolledStudents} / {course.maxStudents}
            </strong>
          </div>

          <div className="course-capacity">
            <div
              style={{
                width: `${Math.min(
                  100,
                  (course.enrolledStudents /
                    Math.max(1, course.maxStudents)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="modal-actions">

          <button
            className="danger-action"
            onClick={onDelete}
            type="button"
          >
            <Trash2 size={16} />
            Delete Course
          </button>

          <button
            className="primary-action"
            onClick={onClose}
            type="button"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}
