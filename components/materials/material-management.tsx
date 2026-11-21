
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
} from "lucide-react";

import MaterialStats from "./material-stats";
import MaterialCard from "./material-card";
import MaterialModal from "./material-modal";
import MaterialDetails from "./material-details";

import {
  courseOptions,
  initialMaterials,
} from "../../src/data/material-data";

import type {
  CourseOption,
  Material,
  MaterialFormData,
} from "../../src/models/material";

import type { UserRole } from "../../src/models/types";

// ROLE LABELS

const roleLabels: Record<UserRole, string> = {
  admin: "Super Administrator",
  lecturer: "Lecturer",
  student: "College Student",
};

// DEMO LECTURER (MATCHES THE LOGGED-IN LECTURER)

const DEMO_LECTURER_ID = "LEC001";

export default function MaterialManagement({
  role,
}: {
  role: UserRole;
}) {
  const [materials, setMaterials] =
    useState<Material[]>(initialMaterials);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const [modalMaterial, setModalMaterial] = useState<
    Material | null | undefined
  >(undefined);

  const [selectedMaterial, setSelectedMaterial] =
    useState<Material | null>(null);

  const isAdmin = role === "admin";
  const isLecturer = role === "lecturer";
  const isStudent = role === "student";

  const canManage = isAdmin || isLecturer;

  // ROLE-BASED MATERIAL VISIBILITY

  const roleMaterials = useMemo(() => {
    if (isAdmin) return materials;

    if (isLecturer) {
      return materials.filter(
        (material) => material.lecturerId === DEMO_LECTURER_ID
      );
    }

    return materials.filter(
      (material) => material.status === "active"
    );
  }, [materials, isAdmin, isLecturer]);

  // SEARCH AND FILTERING

  const filteredMaterials = useMemo(() => {
    const keyword = search.toLowerCase();

    return roleMaterials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(keyword) ||
        material.courseCode.toLowerCase().includes(keyword) ||
        material.courseName.toLowerCase().includes(keyword) ||
        material.lecturerName.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "all" ||
        material.type === typeFilter;

      const matchesCourse =
        courseFilter === "all" ||
        material.courseId === courseFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCourse
      );
    });
  }, [
    roleMaterials,
    search,
    typeFilter,
    courseFilter,
  ]);

  // COURSES AVAILABLE TO THE CURRENT USER

  const availableCourses: CourseOption[] = useMemo(() => {
    if (isAdmin) return courseOptions;

    if (isLecturer) {
      return courseOptions.filter(
        (course) => course.lecturerId === DEMO_LECTURER_ID
      );
    }

    return courseOptions;
  }, [isAdmin, isLecturer]);

  // CREATE AND UPDATE MATERIAL

  function saveMaterial(data: MaterialFormData) {
    const course = courseOptions.find(
      (item) => item.id === data.courseId
    );

    if (!course) {
      alert("Selected course does not exist.");
      return;
    }

    if (modalMaterial) {
      setMaterials((previous) =>
        previous.map((material) =>
          material.id === modalMaterial.id
            ? {
                ...material,
                ...data,
                courseCode: course.code,
                courseName: course.name,
                lecturerId: course.lecturerId,
                lecturerName: course.lecturerName,
                updatedAt: new Date()
                  .toISOString()
                  .slice(0, 10),
              }
            : material
        )
      );
    } else {
      setMaterials((previous) => [
        {
          ...data,
          id: `MAT${Date.now()}`,
          courseCode: course.code,
          courseName: course.name,
          lecturerId: course.lecturerId,
          lecturerName: course.lecturerName,
          downloads: 0,
          uploadedAt: new Date()
            .toISOString()
            .slice(0, 10),
          updatedAt: new Date()
            .toISOString()
            .slice(0, 10),
        },
        ...previous,
      ]);
    }

    setModalMaterial(undefined);
  }

  // DELETE MATERIAL

  function deleteMaterial(material: Material) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${material.title}"?`
    );

    if (!confirmed) return;

    setMaterials((previous) =>
      previous.filter((item) => item.id !== material.id)
    );

    setSelectedMaterial(null);
  }

  // DOWNLOAD MATERIAL (DEMO)

  function downloadMaterial(material: Material) {
    setMaterials((previous) =>
      previous.map((item) =>
        item.id === material.id
          ? { ...item, downloads: item.downloads + 1 }
          : item
      )
    );

    setSelectedMaterial((current) =>
      current && current.id === material.id
        ? { ...current, downloads: current.downloads + 1 }
        : current
    );

    if (material.fileUrl) {
      window.open(material.fileUrl, "_blank", "noopener,noreferrer");
    }
  }

  // PERMISSION HELPERS

  function canEditMaterial(material: Material) {
    if (isAdmin) return true;

    if (isLecturer) {
      return material.lecturerId === DEMO_LECTURER_ID;
    }

    return false;
  }

  function canDeleteMaterial(material: Material) {
    if (isAdmin) return true;

    if (isLecturer) {
      return material.lecturerId === DEMO_LECTURER_ID;
    }

    return false;
  }

  // PAGE

  return (
    <div className="page-container">

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>
            {isAdmin
              ? "Study Material Management"
              : isLecturer
                ? "My Teaching Materials"
                : "Study Materials"}
          </h1>

          <p>
            {isAdmin
              ? "Manage all learning materials across courses."
              : isLecturer
                ? "Upload and manage materials for your courses."
                : "Access learning resources from your lecturers."}
          </p>
        </div>

        {canManage && (
          <button
            className="primary-action"
            onClick={() => setModalMaterial(null)}
          >
            <Plus size={18} />
            Upload Material
          </button>
        )}
      </div>

      {/* STATISTICS */}

      <MaterialStats materials={roleMaterials} />

      {/* MATERIAL LIST */}

      <section className="content-card course-management-panel">

        <div className="academic-toolbar">
          <div>
            <h2>Materials</h2>

            <p>
              {filteredMaterials.length} materials available for{" "}
              {roleLabels[role]}.
            </p>
          </div>

          <div className="user-filters">

            <div className="user-search">
              <Search size={18} />

              <input
                placeholder="Search materials..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="all">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Document">Document</option>
              <option value="Presentation">
                Presentation
              </option>
            </select>

            {isAdmin && (
              <select
                value={courseFilter}
                onChange={(e) =>
                  setCourseFilter(e.target.value)
                }
              >
                <option value="all">All Courses</option>

                {courseOptions.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.code} · {course.name}
                  </option>
                ))}
              </select>
            )}

          </div>
        </div>

        {filteredMaterials.length > 0 ? (
          <div className="course-grid">

            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onView={() =>
                  setSelectedMaterial(material)
                }
                onEdit={() =>
                  setModalMaterial(material)
                }
                onDownload={() =>
                  downloadMaterial(material)
                }
                canEdit={
                  canManage && canEditMaterial(material)
                }
                canDownload={isStudent}
              />
            ))}

          </div>
        ) : (
          <div className="course-empty">
            <FileText size={38} />

            <h3>No materials found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        )}

      </section>

      {/* CREATE / EDIT MODAL */}

      {modalMaterial !== undefined && (
        <MaterialModal
          material={modalMaterial}
          courses={availableCourses}
          onClose={() => setModalMaterial(undefined)}
          onSave={saveMaterial}
        />
      )}

      {/* MATERIAL DETAILS MODAL */}

      {selectedMaterial && (
        <MaterialDetails
          material={selectedMaterial}
          canDelete={canDeleteMaterial(selectedMaterial)}
          onClose={() => setSelectedMaterial(null)}
          onDownload={() => downloadMaterial(selectedMaterial)}
          onDelete={() => deleteMaterial(selectedMaterial)}
        />
      )}

    </div>
  );
}
