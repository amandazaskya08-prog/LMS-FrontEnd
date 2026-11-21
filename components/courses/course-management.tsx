
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
} from "lucide-react";

import CourseStats from "./course-stats";
import CourseCard from "./course-card";
import CourseModal from "./course-modal";
import CourseDetails from "./course-details";

import {
  initialCourses,
  demoLecturers,
} from "../../src/data/courses-data";

import type {
  Course,
  CourseFormData,
} from "../../src/models/course";

import type {
  Faculty,
  StudyProgram,
} from "../../src/models/academic";

import type { UserRole } from "../../src/models/types";

// DEMO ACADEMIC DATA

const faculties: Faculty[] = [
  {
    id: "FAC001",
    name: "Faculty of Computer Science",
    code: "FCS",
    dean: "Dr. Ahmad Wijaya",
    email: "fcs@campus.ac.id",
    description: "Computing and information technology.",
    status: "active",
    createdAt: "2026-01-01",
  },
  {
    id: "FAC002",
    name: "Faculty of Engineering",
    code: "FE",
    dean: "Dr. Budi Santoso",
    email: "engineering@campus.ac.id",
    description: "Engineering and applied sciences.",
    status: "active",
    createdAt: "2026-01-02",
  },
  {
    id: "FAC003",
    name: "Faculty of Economics",
    code: "FECO",
    dean: "Dr. Citra Maharani",
    email: "economics@campus.ac.id",
    description: "Business and economics.",
    status: "active",
    createdAt: "2026-01-03",
  },
];

const programs: StudyProgram[] = [
  {
    id: "PROG001",
    facultyId: "FAC001",
    name: "Informatics",
    code: "IF",
    degree: "S1",
    headOfProgram: "Dr. Budi Santoso",
    status: "active",
    createdAt: "2026-01-05",
  },
  {
    id: "PROG002",
    facultyId: "FAC001",
    name: "Information Systems",
    code: "SI",
    degree: "S1",
    headOfProgram: "Dr. Rina Putri",
    status: "active",
    createdAt: "2026-01-05",
  },
  {
    id: "PROG003",
    facultyId: "FAC002",
    name: "Civil Engineering",
    code: "TS",
    degree: "S1",
    headOfProgram: "Dr. Andi Pratama",
    status: "active",
    createdAt: "2026-01-06",
  },
  {
    id: "PROG004",
    facultyId: "FAC003",
    name: "Management",
    code: "MN",
    degree: "S1",
    headOfProgram: "Dr. Siti Rahma",
    status: "active",
    createdAt: "2026-01-07",
  },
];

// ROLE LABELS

const roleLabels: Record<UserRole, string> = {
  admin: "Super Administrator",
  lecturer: "Lecturer",
  student: "College Student",
};

export default function CourseManagement({
  role,
}: {
  role: UserRole;
}) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");

  const [modalCourse, setModalCourse] = useState<
    Course | null | undefined
  >(undefined);

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const isAdmin = role === "admin";
  const isLecturer = role === "lecturer";

  // ROLE-BASED COURSE VISIBILITY

  const roleCourses = useMemo(() => {
    if (isAdmin) return courses;

    if (isLecturer) {
      return courses.filter(
        (course) => course.lecturerId === "LEC001"
      );
    }

    return courses.filter(
      (course) => course.status === "active"
    );
  }, [courses, isAdmin, isLecturer]);

  // SEARCH AND FILTERING

  const filteredCourses = useMemo(() => {
    const keyword = search.toLowerCase();

    return roleCourses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(keyword) ||
        course.code.toLowerCase().includes(keyword) ||
        course.lecturerName.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        course.status === statusFilter;

      const matchesFaculty =
        facultyFilter === "all" ||
        course.facultyId === facultyFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFaculty
      );
    });
  }, [
    roleCourses,
    search,
    statusFilter,
    facultyFilter,
  ]);

  // CREATE AND UPDATE COURSE

  function saveCourse(data: CourseFormData) {
    const lecturer = demoLecturers.find(
      (item) => item.id === data.lecturerId
    );

    if (!lecturer) {
      alert("Selected lecturer does not exist.");
      return;
    }

    if (modalCourse) {
      setCourses((previous) =>
        previous.map((course) =>
          course.id === modalCourse.id
            ? {
                ...course,
                ...data,
                lecturerName: lecturer.name,
                updatedAt: new Date()
                  .toISOString()
                  .slice(0, 10),
              }
            : course
        )
      );
    } else {
      const duplicateCode = courses.some(
        (course) =>
          course.code.toLowerCase() ===
          data.code.toLowerCase()
      );

      if (duplicateCode) {
        alert("A course with this code already exists.");
        return;
      }

      setCourses((previous) => [
        {
          ...data,
          id: `COURSE${Date.now()}`,
          lecturerName: lecturer.name,
          enrolledStudents: 0,
          createdAt: new Date()
            .toISOString()
            .slice(0, 10),
          updatedAt: new Date()
            .toISOString()
            .slice(0, 10),
        },
        ...previous,
      ]);
    }

    setModalCourse(undefined);
  }

  // DELETE COURSE

  function deleteCourse(course: Course) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.name}"?`
    );

    if (!confirmed) return;

    setCourses((previous) =>
      previous.filter(
        (item) => item.id !== course.id
      )
    );

    setSelectedCourse(null);
  }

  // HELPER FUNCTIONS

  function getFacultyName(id: string) {
    return (
      faculties.find((item) => item.id === id)?.name ??
      "Unknown Faculty"
    );
  }

  function getProgramName(id: string) {
    return (
      programs.find((item) => item.id === id)?.name ??
      "Unknown Program"
    );
  }

  // PAGE

  return (
    <div className="page-container">

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>
            {isAdmin
              ? "Course Management"
              : isLecturer
                ? "My Teaching Courses"
                : "My Courses"}
          </h1>

          <p>
            {isAdmin
              ? "Manage university courses, lecturers and enrollment."
              : isLecturer
                ? "View your assigned courses."
                : "Explore available courses and academic information."}
          </p>
        </div>

        {isAdmin && (
          <button
            className="primary-action"
            onClick={() => setModalCourse(null)}
          >
            <Plus size={18} />
            Create Course
          </button>
        )}
      </div>

      {/* STATISTICS */}

      <CourseStats courses={roleCourses} />

      {/* COURSE LIST */}

      <section className="content-card course-management-panel">

        <div className="academic-toolbar">
          <div>
            <h2>Courses</h2>

            <p>
              {filteredCourses.length} courses available for{" "}
              {roleLabels[role]}.
            </p>
          </div>

          <div className="user-filters">

            <div className="user-search">
              <Search size={18} />

              <input
                placeholder="Search courses..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            {isAdmin && (
              <select
                value={facultyFilter}
                onChange={(e) =>
                  setFacultyFilter(e.target.value)
                }
              >
                <option value="all">All Faculties</option>

                {faculties.map((faculty) => (
                  <option
                    key={faculty.id}
                    value={faculty.id}
                  >
                    {faculty.name}
                  </option>
                ))}
              </select>
            )}

            {(isAdmin || isLecturer) && (
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>

                {isAdmin && (
                  <option value="draft">Draft</option>
                )}
              </select>
            )}

          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="course-grid">

            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                facultyName={getFacultyName(
                  course.facultyId
                )}
                programName={getProgramName(
                  course.programId
                )}
                onView={() =>
                  setSelectedCourse(course)
                }
                onEdit={() =>
                  setModalCourse(course)
                }
                canEdit={isAdmin}
              />
            ))}

          </div>
        ) : (
          <div className="course-empty">
            <BookOpen size={38} />

            <h3>No courses found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        )}

      </section>

      {/* CREATE / EDIT MODAL */}

      {modalCourse !== undefined && (
        <CourseModal
          course={modalCourse}
          faculties={faculties}
          programs={programs}
          lecturers={demoLecturers}
          onClose={() =>
            setModalCourse(undefined)
          }
          onSave={saveCourse}
        />
      )}

      {/* COURSE DETAILS MODAL */}

      {selectedCourse && (
        <CourseDetails
          course={selectedCourse}
          facultyName={getFacultyName(
            selectedCourse.facultyId
          )}
          programName={getProgramName(
            selectedCourse.programId
          )}
          onClose={() =>
            setSelectedCourse(null)
          }
          onDelete={() =>
            deleteCourse(selectedCourse)
          }
        />
      )}

    </div>
  );
}
