
"use client";

import {
  X,
  FileText,
  Users,
  BookOpen,
  CalendarDays,
  Download,
  Trash2,
  Folder,
  HardDrive,
} from "lucide-react";

import type { Material } from "../../src/models/material";

export default function MaterialDetails({
  material,
  canDelete,
  onClose,
  onDownload,
  onDelete,
}: {
  material: Material;
  canDelete: boolean;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="user-form-modal course-details-modal">
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <div className="modal-heading-icon">
              <FileText size={21} />
            </div>

            <h2>{material.title}</h2>
            <p>
              {material.courseCode} · {material.courseName}
            </p>
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
          {material.description}
        </p>

        {/* MATERIAL INFORMATION */}

        <div className="course-detail-grid">
          <div>
            <BookOpen size={19} />
            <span>Course</span>
            <strong>{material.courseName}</strong>
          </div>

          <div>
            <Users size={19} />
            <span>Uploaded By</span>
            <strong>{material.lecturerName}</strong>
          </div>

          <div>
            <FileText size={19} />
            <span>Type</span>
            <strong>{material.type}</strong>
          </div>

          <div>
            <Folder size={19} />
            <span>Category</span>
            <strong>{material.category}</strong>
          </div>

          <div>
            <HardDrive size={19} />
            <span>File Size</span>
            <strong>{material.fileSize}</strong>
          </div>

          <div>
            <CalendarDays size={19} />
            <span>Uploaded</span>
            <strong>{material.uploadedAt}</strong>
          </div>
        </div>

        {/* DOWNLOADS */}

        <div className="course-detail-enrollment">
          <div>
            <span>Downloads</span>

            <strong>{material.downloads.toLocaleString()}</strong>
          </div>

          <div className="course-capacity">
            <div
              style={{
                width: `${Math.min(100, material.downloads)}%`,
              }}
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}

        <div className="modal-actions">
          {canDelete && (
            <button
              className="danger-action"
              onClick={onDelete}
              type="button"
            >
              <Trash2 size={16} />
              Delete Material
            </button>
          )}

          <button
            className="primary-action"
            onClick={onDownload}
            type="button"
          >
            <Download size={16} />
            Download
          </button>

          <button
            className="secondary-action"
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
