
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  CourseOption,
  Material,
  MaterialFormData,
  MaterialStatus,
  MaterialType,
} from "../../src/models/material";

import { materialCategories } from "../../src/data/material-data";

export default function MaterialModal({
  material,
  courses,
  onClose,
  onSave,
}: {
  material: Material | null;
  courses: CourseOption[];
  onClose: () => void;
  onSave: (data: MaterialFormData) => void;
}) {
  const [form, setForm] = useState<MaterialFormData>({
    title: material?.title ?? "",
    description: material?.description ?? "",
    courseId: material?.courseId ?? courses[0]?.id ?? "",
    type: material?.type ?? "PDF",
    category: material?.category ?? materialCategories[0],
    fileSize: material?.fileSize ?? "",
    fileUrl: material?.fileUrl ?? "",
    status: material?.status ?? "draft",
  });

  function update<K extends keyof MaterialFormData>(
    key: K,
    value: MaterialFormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!courses.some((item) => item.id === form.courseId)) {
      alert("Please select a valid course.");
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      fileSize: form.fileSize.trim() || "—",
      fileUrl: form.fileUrl.trim(),
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="user-form-modal course-modal">
        <div className="modal-header">
          <div>
            <div className="modal-heading-icon">
              <span>📄</span>
            </div>

            <h2>
              {material ? "Edit Material" : "Upload New Material"}
            </h2>

            <p>
              Provide the details for this study material.
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
              <label>Material Title *</label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Course *</label>
              <select
                value={form.courseId}
                onChange={(e) => update("courseId", e.target.value)}
                required
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Type *</label>
              <select
                value={form.type}
                onChange={(e) =>
                  update("type", e.target.value as MaterialType)
                }
              >
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Document">Document</option>
                <option value="Presentation">Presentation</option>
              </select>
            </div>

            <div className="form-field">
              <label>Category *</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {materialCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>File Size</label>
              <input
                value={form.fileSize}
                onChange={(e) => update("fileSize", e.target.value)}
                placeholder="e.g. 2.4 MB"
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as MaterialStatus)
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label>File URL</label>
              <input
                value={form.fileUrl}
                onChange={(e) => update("fileUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="form-field full-width">
              <label>Description *</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  update("description", e.target.value)
                }
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
              {material ? "Save Changes" : "Upload Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
