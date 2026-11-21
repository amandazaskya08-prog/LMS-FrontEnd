
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  Course,
  CourseFormData,
  CourseStatus,
  LecturerOption,
} from "../../src/models/course";

import type {
  Faculty,
  StudyProgram,
} from "../../src/models/academic";

export default function CourseModal({
  course,
  faculties,
  programs,
  lecturers,
  onClose,
  onSave,
}: {
  course: Course | null;
  faculties: Faculty[];
  programs: StudyProgram[];
  lecturers: LecturerOption[];
  onClose: () => void;
  onSave: (data: CourseFormData) => void;
}) {
  const [form, setForm] = useState<CourseFormData>({
    code: course?.code ?? "",
    name: course?.name ?? "",
    description: course?.description ?? "",
    facultyId: course?.facultyId ?? faculties[0]?.id ?? "",
    programId: course?.programId ?? "",
    lecturerId: course?.lecturerId ?? "",
    semester: course?.semester ?? 1,
    academicYear: course?.academicYear ?? "2026/2027",
    credits: course?.credits ?? 3,
    maxStudents: course?.maxStudents ?? 40,
    status: course?.status ?? "draft",
  });

  const availablePrograms = programs.filter(
    (program) => program.facultyId === form.facultyId
  );

  const availableLecturers = lecturers.filter(
    (lecturer) => lecturer.facultyId === form.facultyId
  );

  function update<K extends keyof CourseFormData>(
    key: K,
    value: CourseFormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleFacultyChange(value: string) {
    const nextProgram = programs.find(
      (program) => program.facultyId === value
    );

    const nextLecturer = lecturers.find(
      (lecturer) => lecturer.facultyId === value
    );

    setForm((previous) => ({
      ...previous,
      facultyId: value,
      programId: nextProgram?.id ?? "",
      lecturerId: nextLecturer?.id ?? "",
    }));
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!availablePrograms.some((item) => item.id === form.programId)) {
      alert("Please select a valid study program.");
      return;
    }

    if (!availableLecturers.some((item) => item.id === form.lecturerId)) {
      alert("Please select a lecturer from this faculty.");
      return;
    }

    if (course && form.maxStudents < course.enrolledStudents) {
      alert("Maximum students cannot be lower than current enrollment.");
      return;
    }

    onSave({
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="user-form-modal course-modal">
        <div className="modal-header">
          <div>
            <div className="modal-heading-icon">
              <span>📚</span>
            </div>

            <h2>{course ? "Edit Course" : "Create New Course"}</h2>

            <p>
              Complete the information for this academic course.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="academic-form-grid">
            <div className="form-field">
              <label>Course Name *</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Course Code *</label>
              <input
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Faculty *</label>
              <select
                value={form.facultyId}
                onChange={(e) => handleFacultyChange(e.target.value)}
                required
              >
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Study Program *</label>
              <select
                value={form.programId}
                onChange={(e) => update("programId", e.target.value)}
                required
              >
                {availablePrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Assigned Lecturer *</label>
              <select
                value={form.lecturerId}
                onChange={(e) => update("lecturerId", e.target.value)}
                required
              >
                {availableLecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Academic Year *</label>
              <input
                value={form.academicYear}
                onChange={(e) => update("academicYear", e.target.value)}
                required
                placeholder="2026/2027"
              />
            </div>

            <div className="form-field">
              <label>Semester *</label>
              <select
                value={form.semester}
                onChange={(e) => update("semester", Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Credit Hours (SKS) *</label>
              <input
                type="number"
                min="1"
                max="6"
                value={form.credits}
                onChange={(e) => update("credits", Number(e.target.value))}
                required
              />
            </div>

            <div className="form-field">
              <label>Maximum Students *</label>
              <input
                type="number"
                min={course?.enrolledStudents ?? 1}
                value={form.maxStudents}
                onChange={(e) => update("maxStudents", Number(e.target.value))}
                required
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as CourseStatus)
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label>Description *</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
              />
            </div>
          </div>


          <div className="modal-actions">
            
            <button
              type="button"
              className="secondary-action"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-action">
              {course ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
